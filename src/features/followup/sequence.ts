import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { siteUrl } from "@/config/site";
import type { EmailContent } from "@/lib/email/html";
import { kvCommand, kvFromEnv } from "@/lib/kv";
import { purposeKey } from "@/lib/secrets";
import { MAX_AHEAD, withStopUrl, type FollowUp } from "./plan";

/**
 * Scheduled follow-up e-mails, stoppable with one link.
 * The e-mails are scheduled at Resend right away; only their ids are stored (no address, no content),
 * so "stop" = cancel those ids. The link carries a random id plus an HMAC, so ids cannot be guessed.
 */

export interface ScheduledEmail extends EmailContent {
  to: string;
  replyTo?: string;
  sendAt: number;
  headers?: Record<string, string>;
}

export interface FollowUpDeps {
  /** Schedules one e-mail and returns its provider id. */
  schedule: (email: ScheduledEmail) => Promise<string>;
  cancel: (id: string) => Promise<void>;
  store: SequenceStore;
  secret: string;
}

export interface SequenceStore {
  save: (sequenceId: string, emailIds: string[], ttlSeconds: number) => Promise<void>;
  /** Returns and deletes the stored ids (null when unknown or already stopped). */
  take: (sequenceId: string) => Promise<string[] | null>;
}

const mac = (sequenceId: string, key: string) => createHmac("sha256", key).update(`followup:${sequenceId}`).digest("base64url").slice(0, 22);

/** New tokens are signed with the derived "followup-stop" key. */
export function stopToken(sequenceId: string, secret: string): string {
  return `${sequenceId}.${mac(sequenceId, purposeKey(secret, "followup-stop"))}`;
}

function matches(expected: string, given: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Returns the sequence id when the token is genuine, otherwise null. */
export function verifyStopToken(token: string | null | undefined, secret: string): string | null {
  if (!token) return null;
  const [sequenceId, signature] = token.split(".");
  if (!sequenceId || !signature || !/^[A-Za-z0-9_-]{16,64}$/.test(sequenceId)) return null;
  // Links sent before the per-purpose keys were signed with the raw secret; they stay valid until their e-mails are out.
  const genuine = matches(mac(sequenceId, purposeKey(secret, "followup-stop")), signature) || matches(mac(sequenceId, secret), signature);
  return genuine ? sequenceId : null;
}

const stopPageUrl = (token: string) => `${siteUrl}/leiratkozas?t=${encodeURIComponent(token)}`;
const oneClickUrl = (token: string) => `${siteUrl}/api/followup/stop?t=${encodeURIComponent(token)}`;

export interface ScheduledSequence {
  stopUrl: string;
  ids: string[];
  labels: string[];
}

/**
 * Schedules every follow-up and stores the ids for the stop link.
 * Partial failures are tolerated: whatever was scheduled stays stoppable. Returns null when nothing was scheduled.
 */
export async function scheduleSequence(
  followUps: FollowUp[],
  recipient: { to: string; replyTo?: string },
  deps: FollowUpDeps,
): Promise<ScheduledSequence | null> {
  if (followUps.length === 0) return null;
  const sequenceId = randomBytes(16).toString("base64url");
  const token = stopToken(sequenceId, deps.secret);
  const stopUrl = stopPageUrl(token);
  const headers = { "List-Unsubscribe": `<${oneClickUrl(token)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" };

  const ids: string[] = [];
  const labels: string[] = [];
  for (const item of followUps) {
    try {
      ids.push(await deps.schedule({ ...withStopUrl(item.email, stopUrl), ...recipient, sendAt: item.sendAt, headers }));
      labels.push(item.id);
    } catch (error) {
      console.error(`[followup] scheduling ${item.id} failed`, error);
    }
  }
  if (ids.length === 0) return null;

  try {
    await deps.store.save(sequenceId, ids, Math.ceil(MAX_AHEAD / 1000) + 24 * 60 * 60);
  } catch (error) {
    // Without the store nobody could stop them – better not to send at all.
    console.error("[followup] store failed, cancelling", error);
    await Promise.allSettled(ids.map((id) => deps.cancel(id)));
    return null;
  }
  return { stopUrl, ids, labels };
}

/** Cancels every pending e-mail of a sequence. Already sent ones are simply skipped. */
export async function stopSequence(token: string | null | undefined, deps: Pick<FollowUpDeps, "cancel" | "store" | "secret">): Promise<"stopped" | "invalid" | "unknown"> {
  const sequenceId = verifyStopToken(token, deps.secret);
  if (!sequenceId) return "invalid";
  const ids = await deps.store.take(sequenceId);
  if (!ids) return "unknown";
  await Promise.allSettled(ids.map((id) => deps.cancel(id)));
  return "stopped";
}

/** Upstash Redis over REST (same store as the contact lock). Null when not configured. */
export function createUpstashSequenceStore(env: NodeJS.ProcessEnv = process.env, fetchImpl: typeof fetch = fetch): SequenceStore | null {
  const kv = kvFromEnv(env, fetchImpl);
  if (!kv) return null;
  const key = (sequenceId: string) => `followup:${sequenceId}`;
  return {
    save: async (sequenceId, emailIds, ttlSeconds) => {
      await kvCommand(kv, ["SET", key(sequenceId), JSON.stringify(emailIds), "EX", ttlSeconds]);
    },
    take: async (sequenceId) => {
      const raw = await kvCommand(kv, ["GETDEL", key(sequenceId)]);
      if (typeof raw !== "string") return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : null;
      } catch {
        return null;
      }
    },
  };
}
