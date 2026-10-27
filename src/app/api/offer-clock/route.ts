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
 * Response includes the server time so the client can show an accurate countdown.
 */
export async function POST(request: Request) {
  const now = Date.now();
  const secret = offerClockSecret();
  const existing = verifyOfferClock(readCookie(request.headers.get("cookie"), OFFER_CLOCK_COOKIE), secret, now);
  if (existing !== null) return Response.json({ issuedAt: existing, now });

  const secure = new URL(request.url).protocol === "https:";
  return Response.json(
    { issuedAt: now, now },
    { headers: { "Set-Cookie": offerClockSetCookie(signOfferClock(now, secret), secure), "Cache-Control": "no-store" } },
  );
}
