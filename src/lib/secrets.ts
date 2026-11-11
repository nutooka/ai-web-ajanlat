import { hkdfSync, randomBytes } from "node:crypto";

/**
 * The one server secret (OFFER_CLOCK_SECRET) and the per-purpose keys derived from it (HKDF-SHA256),
 * so a signature made for one purpose can never be replayed for another.
 */

const MIN_SECRET_LENGTH = 16;

let fallbackSecret: string | undefined;

/**
 * OFFER_CLOCK_SECRET; a per-process random value in development (clocks reset on restart).
 * In production a missing or short secret is a configuration error: a per-instance random value would make
 * cookies, stop links and offer codes fail on every other instance.
 */
export function serverSecret(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.OFFER_CLOCK_SECRET;
  if (configured && configured.length >= MIN_SECRET_LENGTH) return configured;
  if (env.VERCEL_ENV === "production") {
    throw new Error(`OFFER_CLOCK_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} characters – set it in the Vercel production environment.`);
  }
  fallbackSecret ??= randomBytes(32).toString("hex");
  return fallbackSecret;
}

type KeyPurpose = "clock" | "contact" | "share" | "followup-stop";

const derived = new Map<string, string>();

/** Per-purpose key derived from the secret (hex). Cached, since HKDF runs on every request otherwise. */
export function purposeKey(secret: string, purpose: KeyPurpose): string {
  const cacheKey = `${purpose}\u0000${secret}`;
  let key = derived.get(cacheKey);
  if (!key) {
    key = Buffer.from(hkdfSync("sha256", secret, "nutooka/v1", purpose, 32)).toString("hex");
    if (derived.size > 32) derived.clear();
    derived.set(cacheKey, key);
  }
  return key;
}
