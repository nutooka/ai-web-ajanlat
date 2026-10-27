import { Resend } from "resend";
import type { EmailSender } from "./submitOffer";

/** Returns null when Resend is not configured, so the app still runs without it. */
export function createResendSender(): EmailSender | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.OFFER_FROM_EMAIL;
  if (!apiKey || !from) return null;

  const resend = new Resend(apiKey);
  return async ({ to, subject, html, text, replyTo }) => {
    const { error } = await resend.emails.send({ from, to, subject, html, text, ...(replyTo ? { replyTo } : {}) });
    if (error) throw new Error(`Resend: ${error.name} – ${error.message}`);
  };
}
