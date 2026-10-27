import { createHmac } from "node:crypto";

/**
 * Stops "restart the clock" tricks (new browser, cleared cookies): the first offer-clock start
 * is remembered per contact (phone / e-mail) for 30 days. Only an HMAC of the contact is stored –
 * the raw phone number or address never leaves the request.
 */
export const CONTACT_LOCK_TTL_SECONDS = 30 * 24 * 60 * 60;

/** Same number written differently (+40 712…, 0040712…, 0712…) gives the same key. */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("40") && digits.length === 11) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function contactKeys(contact: { phone?: string; email?: string }, secret: string): string[] {
  const parts = [
    contact.phone ? `phone:${normalizePhone(contact.phone)}` : null,
    contact.email ? `email:${contact.email.trim().toLowerCase()}` : null,
  ].filter((part): part is string => Boolean(part));
  return parts.map((part) => `offer-first-seen:${createHmac("sha256", secret).update(part).digest("hex")}`);
}

export interface FirstSeenResult {
  /** Earliest clock start known for any of the keys (including the candidate just stored). */
  firstSeenAt: number;
  /** True when at least one key already existed – i.e. this contact asked before. */
  repeat: boolean;
}

/** Stores `candidate` for keys that are new and returns the earliest known value. */
export type FirstSeenStore = (keys: string[], candidate: number) => Promise<FirstSeenResult>;

/**
 * Upstash Redis over its REST API (no SDK needed): SET NX EX + GET per key in one pipeline.
 * Returns null when the store is not configured, so the app keeps working without it.
 */
export function createUpstashFirstSeenStore(env: NodeJS.ProcessEnv = process.env, fetchImpl: typeof fetch = fetch): FirstSeenStore | null {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return async (keys, candidate) => {
    if (keys.length === 0) return { firstSeenAt: candidate, repeat: false };
    const commands = keys.flatMap((key) => [
      ["SET", key, String(candidate), "NX", "EX", String(CONTACT_LOCK_TTL_SECONDS)],
      ["GET", key],
    ]);
    const response = await fetchImpl(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Upstash ${response.status}`);
    const results = (await response.json()) as { result?: string | null; error?: string }[];

    let firstSeenAt = candidate;
    let repeat = false;
    for (let index = 0; index < keys.length; index += 1) {
      const setResult = results[index * 2]?.result;
      const stored = Number(results[index * 2 + 1]?.result);
      if (setResult !== "OK") repeat = true;
      if (Number.isFinite(stored) && stored > 0) firstSeenAt = Math.min(firstSeenAt, stored);
    }
    return { firstSeenAt, repeat };
  };
}
