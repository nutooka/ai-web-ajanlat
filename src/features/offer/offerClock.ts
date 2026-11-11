import { createHmac, timingSafeEqual } from "node:crypto";
import { purposeKey, serverSecret } from "@/lib/secrets";

/**
 * Server-verified "offer clock": when the visitor first opened their offer.
 * Stored as `<issuedAt>.<hmac>` in an httpOnly cookie, so it can be neither read
 * by scripts nor moved by editing it. Deleting it just starts a new clock.
 */
export const OFFER_CLOCK_COOKIE = "nutooka_offer_clock";
const OFFER_CLOCK_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** OFFER_CLOCK_SECRET; throws in production when it is missing or short, per-process random in development. */
export function offerClockSecret(): string {
  return serverSecret();
}

function mac(issuedAt: number, key: string): string {
  return createHmac("sha256", key).update(`offer-clock:${issuedAt}`).digest("base64url");
}

/** New cookies are signed with the derived "clock" key. */
export function signOfferClock(issuedAt: number, secret: string): string {
  return `${issuedAt}.${mac(issuedAt, purposeKey(secret, "clock"))}`;
}

function matches(expected: string, given: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Returns the issue time when the cookie is genuine and not from the future, otherwise null. */
export function verifyOfferClock(value: string | undefined, secret: string, now: number): number | null {
  if (!value) return null;
  const [rawIssuedAt, given] = value.split(".");
  const issuedAt = Number(rawIssuedAt);
  if (!Number.isSafeInteger(issuedAt) || !given) return null;
  // Cookies issued before the per-purpose keys were signed with the raw secret; they expire within a week.
  const genuine = matches(mac(issuedAt, purposeKey(secret, "clock")), given) || matches(mac(issuedAt, secret), given);
  if (!genuine) return null;
  if (issuedAt > now + 60_000) return null;
  if (now - issuedAt > OFFER_CLOCK_MAX_AGE_SECONDS * 1000) return null;
  return issuedAt;
}

export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export function offerClockSetCookie(value: string, secure: boolean): string {
  return [
    `${OFFER_CLOCK_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${OFFER_CLOCK_MAX_AGE_SECONDS}`,
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

/** Minutes since the clock started; 0 when there is no valid clock (never charge more than shown). */
export function offerAgeMinutes(issuedAt: number | null, now: number): number {
  return issuedAt === null ? 0 : Math.max(0, (now - issuedAt) / 60_000);
}
