import { createResendScheduler } from "@/features/contact/resendSender";
import { createUpstashSequenceStore, type FollowUpDeps } from "./sequence";

/**
 * Everything follow-ups need, or null when any part is missing (then no follow-up is sent at all).
 * The secret must be configured: a per-instance fallback would make stop links fail on other instances.
 */
export function createFollowUpDeps(env: NodeJS.ProcessEnv = process.env): FollowUpDeps | null {
  if (env.FOLLOWUPS_ENABLED === "false") return null;
  const secret = env.OFFER_CLOCK_SECRET;
  const scheduler = createResendScheduler();
  const store = createUpstashSequenceStore(env);
  if (!secret || secret.length < 16 || !scheduler || !store) return null;
  return { ...scheduler, store, secret };
}
