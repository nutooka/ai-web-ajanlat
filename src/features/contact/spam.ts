export const MIN_FILL_TIME_MS = 3000;

export type SpamVerdict = { ok: true } | { ok: false; reason: "honeypot" | "too_fast" };

export function checkSpamSignals(input: { website?: string; elapsedMs: number }): SpamVerdict {
  if (input.website && input.website.trim().length > 0) return { ok: false, reason: "honeypot" };
  if (input.elapsedMs < MIN_FILL_TIME_MS) return { ok: false, reason: "too_fast" };
  return { ok: true };
}

/**
 * Fixed-window, in-memory rate limiter.
 * Best-effort on serverless (each instance has its own memory) – enough for an MVP.
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
