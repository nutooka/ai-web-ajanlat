import { createHmac } from "node:crypto";
import { kvFromEnv, kvPipeline } from "@/lib/kv";
import { purposeKey } from "@/lib/secrets";

/**
 * Stops "restart the clock" tricks (new browser, cleared cookies): the first offer-clock start
 * is remembered per contact (phone / e-mail) for 30 days. Only an HMAC of the contact is stored –
 * the raw phone number or address never leaves the request.
 */
const CONTACT_LOCK_TTL_SECONDS = 30 * 24 * 60 * 60;

/** Same number written differently (+40 712…, 0040712…, 0712…) gives the same key. */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("40") && digits.length === 11) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

const hash = (key: string, value: string) => createHmac("sha256", key).update(value).digest("hex");

/**
 * Keys hashed with the derived "contact" key, plus the same keys hashed with the raw secret (how they were
 * stored before the per-purpose keys), so contacts seen before the switch are still recognised.
 * The legacy half can be dropped once the old entries have expired (30 days after the switch, mid-December 2026).
 */
export function contactKeys(contact: { phone?: string; email?: string }, secret: string): string[] {
  const parts = [
    contact.phone ? `phone:${normalizePhone(contact.phone)}` : null,
    contact.email ? `email:${contact.email.trim().toLowerCase()}` : null,
  ].filter((part): part is string => Boolean(part));
  const key = purposeKey(secret, "contact");
  return [...parts.map((part) => `offer-first-seen:${hash(key, part)}`), ...parts.map((part) => `offer-first-seen:${hash(secret, part)}`)];
}

/**
 * Same device without cookies (incognito, cleared site data): IP + browser signature, hashed.
 * Only the earliest clock start is stored, for 7 days – never the raw IP.
 */
export const DEVICE_CLOCK_TTL_SECONDS = 7 * 24 * 60 * 60;

/** Derived-key hash first, then the legacy raw-secret hash (old entries expire within a week). */
export function deviceKeys(ip: string, userAgent: string, secret: string): string[] {
  const value = `device:${ip}|${userAgent.trim()}`;
  return [hash(purposeKey(secret, "contact"), value), hash(secret, value)].map((digest) => `offer-device-first-seen:${digest}`);
}

interface FirstSeenResult {
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
export function createUpstashFirstSeenStore(
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
  ttlSeconds: number = CONTACT_LOCK_TTL_SECONDS,
): FirstSeenStore | null {
  const kv = kvFromEnv(env, fetchImpl);
  if (!kv) return null;

  return async (keys, candidate) => {
    if (keys.length === 0) return { firstSeenAt: candidate, repeat: false };
    const results = await kvPipeline(
      kv,
      keys.flatMap((key) => [
        ["SET", key, candidate, "NX", "EX", ttlSeconds],
        ["GET", key],
      ]),
    );

    let firstSeenAt = candidate;
    let repeat = false;
    for (let index = 0; index < keys.length; index += 1) {
      const stored = Number(results[index * 2 + 1]);
      if (results[index * 2] !== "OK") repeat = true;
      if (Number.isFinite(stored) && stored > 0) firstSeenAt = Math.min(firstSeenAt, stored);
    }
    return { firstSeenAt, repeat };
  };
}
