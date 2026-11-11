import { after } from "next/server";
import { z } from "zod";
import { normalizeUrl, readCachedAudit } from "@/features/audit/audit";
import { auditCustomerEmail, auditOwnerEmail } from "@/features/audit/email";
import { createResendSender } from "@/features/contact/resendSender";
import { checkSpamSignals, createRecipientGuard, routeLimiter } from "@/features/contact/spam";
import { createFollowUpDeps } from "@/features/followup/deps";
import { auditFollowUps } from "@/features/followup/plan";
import { scheduleSequence } from "@/features/followup/sequence";
import { offerClockSecret } from "@/features/offer/offerClock";
import { clientIp, readJsonBody } from "@/lib/http";

const MAX_BODY_BYTES = 8 * 1024;
const isAllowed = routeLimiter("audit-lead", 5);

const schema = z.object({
  url: z.string().max(300),
  email: z.email(),
  consent: z.literal(true),
  website: z.string().max(200).optional(),
  elapsedMs: z.number().int().nonnegative(),
});

/** POST { url, email, consent } → e-mails the full report to the visitor and a heads-up to the owner. */
export async function POST(request: Request) {
  if (!(await isAllowed(clientIp(request.headers) ?? "unknown", Date.now()))) {
    return Response.json({ ok: false, error: "Túl sok kérés. Próbáld újra pár perc múlva." }, { status: 429 });
  }

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) return Response.json({ ok: false, error: body.status === 413 ? "A kérés túl nagy." : "Érvénytelen kérés." }, { status: body.status });
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return Response.json({ ok: false, error: "Adj meg egy érvényes e-mail-címet, és fogadd el az adatkezelést." }, { status: 422 });
  const { email, website, elapsedMs } = parsed.data;
  if (!checkSpamSignals({ website, elapsedMs }).ok) return Response.json({ ok: true });

  const url = normalizeUrl(parsed.data.url);
  // Only reports this site produced (cached) are sent – nobody can make us mail arbitrary content.
  const result = url ? await readCachedAudit(url).catch(() => null) : null;
  if (!result) return Response.json({ ok: false, error: "Az átvilágítás lejárt. Futtasd újra, és kérd utána a jelentést." }, { status: 404 });

  const send = createResendSender();
  const owner = process.env.OFFER_OWNER_EMAIL;
  if (!send || !owner) return Response.json({ ok: false, error: "Az e-mail-küldés most nem elérhető." }, { status: 503 });

  // Capped per address, so the form cannot be used to flood someone else's inbox. Same answer either way.
  const recipients = createRecipientGuard({ secret: offerClockSecret() });
  if (!(await recipients.allowEmail(email))) {
    console.warn("[audit] recipient limit reached, report not sent");
    return Response.json({ ok: true });
  }

  try {
    await send({ ...auditCustomerEmail(result), to: email, replyTo: owner });
  } catch (error) {
    console.error("[audit] customer e-mail failed", error);
    return Response.json({ ok: false, error: "Nem sikerült elküldeni. Próbáld újra pár perc múlva." }, { status: 500 });
  }

  // Follow-ups and the owner's heads-up do not need to hold up the visitor.
  after(async () => {
    const followUpDeps = createFollowUpDeps();
    const followUp =
      followUpDeps && (await recipients.allowSequence(email))
        ? await scheduleSequence(auditFollowUps({ now: Date.now(), url: result.url }), { to: email, replyTo: owner }, followUpDeps).catch((error) => {
            console.error("[audit] follow-up scheduling failed", error);
            return null;
          })
        : null;
    await send({ ...auditOwnerEmail(result, email, followUp?.stopUrl ?? null), to: owner, replyTo: email }).catch((error) => console.error("[audit] owner e-mail failed", error));
  });
  return Response.json({ ok: true });
}
