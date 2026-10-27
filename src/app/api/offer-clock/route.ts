import { clientIp, createUpstashFirstSeenStore, DEVICE_CLOCK_TTL_SECONDS, deviceKey } from "@/features/contact/contactLock";
import {
  OFFER_CLOCK_COOKIE,
  offerClockSecret,
  offerClockSetCookie,
  readCookie,
  signOfferClock,
  verifyOfferClock,
} from "@/features/offer/offerClock";

/**
 * Starts (or returns) the visitor's offer clock.
 * The start is the earliest of: the signed cookie, and the same device seen before
 * (hashed IP + browser + language, so an incognito window does not restart the discount).
 * Response includes the server time so the client can show an accurate countdown.
 */
export async function POST(request: Request) {
  const now = Date.now();
  const secret = offerClockSecret();
  const fromCookie = verifyOfferClock(readCookie(request.headers.get("cookie"), OFFER_CLOCK_COOKIE), secret, now);

  let issuedAt = fromCookie ?? now;
  const ip = clientIp(request.headers);
  const store = createUpstashFirstSeenStore(process.env, fetch, DEVICE_CLOCK_TTL_SECONDS);
  if (store && ip) {
    try {
      const seen = await store([deviceKey(ip, `${request.headers.get("user-agent") ?? ""}|${request.headers.get("accept-language") ?? ""}`, secret)], issuedAt);
      issuedAt = Math.min(issuedAt, seen.firstSeenAt);
    } catch {
      // Store down: the cookie still works on its own.
    }
  }

  if (fromCookie !== null && issuedAt === fromCookie) return Response.json({ issuedAt, now }, { headers: { "Cache-Control": "no-store" } });

  const secure = new URL(request.url).protocol === "https:";
  return Response.json(
    { issuedAt, now },
    { headers: { "Set-Cookie": offerClockSetCookie(signOfferClock(issuedAt, secret), secure), "Cache-Control": "no-store" } },
  );
}
