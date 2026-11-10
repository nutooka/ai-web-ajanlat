import { Resend } from "resend";
import type { ScheduledEmail } from "@/features/followup/sequence";
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

/** Scheduled sending + cancelling at Resend (follow-up e-mails). Null when Resend is not configured. */
export function createResendScheduler(): { schedule: (email: ScheduledEmail) => Promise<string>; cancel: (id: string) => Promise<void> } | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.OFFER_FROM_EMAIL;
  if (!apiKey || !from) return null;

  const resend = new Resend(apiKey);
  return {
    schedule: async ({ to, subject, html, text, replyTo, sendAt, headers }) => {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
        scheduledAt: new Date(sendAt).toISOString(),
        ...(replyTo ? { replyTo } : {}),
        ...(headers ? { headers } : {}),
      });
      if (error || !data) throw new Error(`Resend: ${error?.name ?? "no data"} – ${error?.message ?? ""}`);
      return data.id;
    },
    cancel: async (id) => {
      const { error } = await resend.emails.cancel(id);
      if (error) throw new Error(`Resend cancel: ${error.name} – ${error.message}`);
    },
  };
}
