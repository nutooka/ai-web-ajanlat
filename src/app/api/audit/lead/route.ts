import { z } from "zod";
import { normalizeUrl, readCachedAudit } from "@/features/audit/audit";
import { auditCustomerEmail, auditOwnerEmail } from "@/features/audit/email";
import { createResendSender } from "@/features/contact/resendSender";
import { checkSpamSignals, createRateLimiter } from "@/features/contact/spam";

const isAllowed = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

const schema = z.object({
  url: z.string().max(300),
  email: z.email(),
  consent: z.literal(true),
  website: z.string().max(200).optional(),
  elapsedMs: z.number().int().nonnegative(),
});

/** POST { url, email, consent } → e-mails the full report to the visitor and a heads-up to the owner. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!isAllowed(ip, Date.now())) return Response.json({ ok: false, error: "Túl sok kérés. Próbáld újra pár perc múlva." }, { status: 429 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
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

  try {
    await send({ ...auditCustomerEmail(result), to: email, replyTo: owner });
  } catch (error) {
    console.error("[audit] customer e-mail failed", error);
    return Response.json({ ok: false, error: "Nem sikerült elküldeni. Próbáld újra pár perc múlva." }, { status: 500 });
  }
  await send({ ...auditOwnerEmail(result, email), to: owner, replyTo: email }).catch((error) => console.error("[audit] owner e-mail failed", error));
  return Response.json({ ok: true });
}
