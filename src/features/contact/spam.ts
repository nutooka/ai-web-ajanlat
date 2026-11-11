import { createHash, createHmac } from "node:crypto";
import { kvCommand, kvFromEnv, kvPipeline, type Kv } from "@/lib/kv";
import { purposeKey } from "@/lib/secrets";

const MIN_FILL_TIME_MS = 3000;

type SpamVerdict = { ok: true } | { ok: false; reason: "honeypot" | "too_fast" };

export function checkSpamSignals(input: { website?: string; elapsedMs: number }): SpamVerdict {
  if (input.website && input.website.trim().length > 0) return { ok: false, reason: "honeypot" };
  if (input.elapsedMs < MIN_FILL_TIME_MS) return { ok: false, reason: "too_fast" };
  return { ok: true };
}

/**
 * Fixed-window, in-memory rate limiter. Per instance only – the API routes use createDurableRateLimiter,
 * which falls back to this when the shared store is unavailable.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  return function isAllowed(key: string, now: number): boolean {
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [storedKey, times] of hits) {
        if (times.every((time) => now - time >= windowMs)) hits.delete(storedKey);
      }
    }
    return true;
  };
}

type AsyncRateLimiter = (id: string, now: number) => Promise<boolean>;

/**
 * Fixed-window limiter shared by every instance (Upstash): INCR + EXPIRE NX in one round trip.
 * `aligned` windows are clock-aligned (key `rl:<scope>:<id>:<window>`); otherwise the window starts at the first hit.
 * Falls back to the in-memory limiter when the store is not configured or fails (fail open, but logged),
 * so a store outage never takes the forms down.
 */
export function createDurableRateLimiter({
  scope,
  limit,
  windowMs,
  aligned = true,
  kv,
}: {
  scope: string;
  limit: number;
  windowMs: number;
  aligned?: boolean;
  /** Injected store; undefined = from the environment at call time, null = memory only. */
  kv?: Kv | null;
}): AsyncRateLimiter {
  const fallback = createRateLimiter({ limit, windowMs });
  const ttlSeconds = Math.ceil(windowMs / 1000);
  return async (id, now) => {
    const store = kv === undefined ? kvFromEnv() : kv;
    if (!store) return fallback(id, now);
    // IPs and addresses are never stored as they are.
    const hashed = createHash("sha256").update(id).digest("base64url").slice(0, 22);
    const key = aligned ? `rl:${scope}:${hashed}:${Math.floor(now / windowMs)}` : `rl:${scope}:${hashed}`;
    try {
      const [count] = await kvPipeline(store, [
        ["INCR", key],
        ["EXPIRE", key, ttlSeconds, "NX"],
      ]);
      return Number(count) <= limit;
    } catch (error) {
      console.error(`[ratelimit] ${scope}: store failed, using the in-memory limit`, error);
      return fallback(id, now);
    }
  };
}

/** Per-IP limits of the API routes, shared across instances. */
export const routeLimiter = (scope: string, limit: number, windowMs = 10 * 60 * 1000) => createDurableRateLimiter({ scope, limit, windowMs });

const DAY_MS = 24 * 60 * 60 * 1000;
const RECIPIENT_EMAILS_PER_DAY = 2;
const RECIPIENT_SEQUENCE_DAYS = 30;

/**
 * Caps what the site sends to one e-mail address, so the forms cannot be used to flood someone else's inbox:
 * at most 2 e-mails per 24 hours (audit report, saved offer, offer copy together) and one follow-up sequence per 30 days.
 * Only an HMAC of the lowercased address is stored.
 */
export interface RecipientGuard {
  /** Counts one e-mail to the address; false when the daily cap is reached. */
  allowEmail: (address: string) => Promise<boolean>;
  /** Claims the address's follow-up slot; false when a sequence already started within 30 days. */
  allowSequence: (address: string) => Promise<boolean>;
}

export function recipientHash(address: string, secret: string): string {
  return createHmac("sha256", purposeKey(secret, "contact")).update(`recipient:${address.trim().toLowerCase()}`).digest("hex");
}

export function createRecipientGuard({ secret, kv, now = Date.now }: { secret: string; kv?: Kv | null; now?: () => number }): RecipientGuard {
  const emails = createDurableRateLimiter({ scope: "rcpt", limit: RECIPIENT_EMAILS_PER_DAY, windowMs: DAY_MS, aligned: false, kv });
  const sequenceMs = RECIPIENT_SEQUENCE_DAYS * DAY_MS;
  const sequencesInMemory = createRateLimiter({ limit: 1, windowMs: sequenceMs });
  return {
    allowEmail: (address) => emails(recipientHash(address, secret), now()),
    allowSequence: async (address) => {
      const hash = recipientHash(address, secret);
      const store = kv === undefined ? kvFromEnv() : kv;
      if (!store) return sequencesInMemory(hash, now());
      try {
        return (await kvCommand(store, ["SET", `rcpt-seq:${hash}`, now(), "NX", "EX", Math.ceil(sequenceMs / 1000)])) === "OK";
      } catch (error) {
        console.error("[ratelimit] follow-up slot: store failed, using the in-memory limit", error);
        return sequencesInMemory(hash, now());
      }
    },
  };
}
