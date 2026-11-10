import { z } from "zod";
import { siteConfig } from "@/config/site";
import { escapeHtml, type EmailContent } from "./email/templates";
import type { EmailSender } from "./submitOffer";
import { checkSpamSignals } from "./spam";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+\d][\d\s()./-]{6,}$/;

export const questionSchema = z.object({
  reach: z
    .string()
    .trim()
    .min(1, "Add meg a telefonszámod vagy az e-mail-címed.")
    .max(120)
    .refine((value) => EMAIL.test(value) || PHONE.test(value), "Adj meg érvényes telefonszámot vagy e-mail-címet."),
  message: z.string().trim().min(3, "Írd le röviden, miben segíthetek.").max(2000),
  consent: z.literal(true, { error: "Fogadd el az adatkezelési tájékoztatót." }),
  website: z.string().max(200).optional(),
  elapsedMs: z.number().int().nonnegative(),
});

export type QuestionResult = { status: 200; body: { ok: true } } | { status: 422 | 500 | 503; body: { ok: false; error: string } };

function ownerQuestionEmail(reach: string, message: string): EmailContent {
  const html = `<!doctype html><html lang="hu"><body style="font-family:Arial,Helvetica,sans-serif;color:#0E0F12;">
<h2 style="margin:0 0 12px;">Új kérdés a főoldalról</h2>
<p><b>Elérhetőség:</b> ${escapeHtml(reach)}</p>
<p style="white-space:pre-wrap;padding:12px 14px;border-radius:10px;background:#F5F5F0;">${escapeHtml(message)}</p>
</body></html>`;
  return { subject: `Kérdés a főoldalról – ${reach}`, html, text: `Új kérdés a főoldalról\n\nElérhetőség: ${reach}\n\n${message}` };
}

/** Short "ask me anything" form: one contact field + message → e-mail to the owner. */
export async function submitQuestion(input: unknown, deps: { send: EmailSender | null; ownerEmail: string | undefined }): Promise<QuestionResult> {
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) return { status: 422, body: { ok: false, error: parsed.error.issues[0]?.message ?? "Ellenőrizd a megadott adatokat." } };
  const { reach, message, website, elapsedMs } = parsed.data;
  if (!checkSpamSignals({ website, elapsedMs }).ok) return { status: 200, body: { ok: true } };
  if (!deps.send || !deps.ownerEmail) {
    return { status: 503, body: { ok: false, error: `Az üzenetküldés most nem elérhető. Hívj a ${siteConfig.company.phone} számon.` } };
  }
  try {
    await deps.send({ ...ownerQuestionEmail(reach, message), to: deps.ownerEmail, ...(EMAIL.test(reach) ? { replyTo: reach } : {}) });
  } catch (error) {
    console.error("[question] e-mail failed", error);
    return { status: 500, body: { ok: false, error: "Nem sikerült elküldeni. Próbáld újra pár perc múlva." } };
  }
  return { status: 200, body: { ok: true } };
}
