import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Server-verified "offer clock": when the visitor first opened their offer.
 * Stored as `<issuedAt>.<hmac>` in an httpOnly cookie, so it can be neither read
 * by scripts nor moved by editing it. Deleting it just starts a new clock.
 */
export const OFFER_CLOCK_COOKIE = "nutooka_offer_clock";
export const OFFER_CLOCK_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

let fallbackSecret: string | undefined;

/** OFFER_CLOCK_SECRET in production; a per-process random secret otherwise (clocks reset on restart). */
export function offerClockSecret(): string {
  const configured = process.env.OFFER_CLOCK_SECRET;
  if (configured && configured.length >= 16) return configured;
  fallbackSecret ??= randomBytes(32).toString("hex");
  return fallbackSecret;
}

function signature(issuedAt: number, secret: string): string {
  return createHmac("sha256", secret).update(`offer-clock:${issuedAt}`).digest("base64url");
}

export function signOfferClock(issuedAt: number, secret: string): string {
  return `${issuedAt}.${signature(issuedAt, secret)}`;
}

/** Returns the issue time when the cookie is genuine and not from the future, otherwise null. */
export function verifyOfferClock(value: string | undefined, secret: string, now: number): number | null {
  if (!value) return null;
  const [rawIssuedAt, mac] = value.split(".");
  const issuedAt = Number(rawIssuedAt);
  if (!Number.isSafeInteger(issuedAt) || !mac) return null;
  const expected = Buffer.from(signature(issuedAt, secret));
  const actual = Buffer.from(mac);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
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
