import { routeLimiter } from "@/features/contact/spam";
import { OFFER_CLOCK_COOKIE, offerAgeMinutes, offerClockSecret, readCookie, verifyOfferClock } from "@/features/offer/offerClock";
import { parseShareInput, saveSharedOffer } from "@/features/offer/share";
import { clientIp, readJsonBody } from "@/lib/http";

const MAX_BODY_BYTES = 32 * 1024;
// Called as the visitor adjusts the offer, so the limit is generous.
const isAllowed = routeLimiter("offer-share", 120);

/** Returns the offer code for the visitor's answers (stores them for the link). */
export async function POST(request: Request) {
  if (!(await isAllowed(clientIp(request.headers) ?? "unknown", Date.now()))) return Response.json({ ok: false }, { status: 429 });
  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) return Response.json({ ok: false }, { status: body.status });
  const parsed = parseShareInput(body.value);
  if (!parsed) return Response.json({ ok: false }, { status: 400 });
  try {
    // The visitor's own signed clock decides which discount the snapshot shows.
    const now = Date.now();
    const secret = offerClockSecret();
    const issuedAt = verifyOfferClock(readCookie(request.headers.get("cookie"), OFFER_CLOCK_COOKIE), secret, now);
    const code = await saveSharedOffer(parsed.answers, parsed.packageId, secret, {
      now,
      ageMinutes: issuedAt === null ? null : offerAgeMinutes(issuedAt, now),
    });
    if (!code) return Response.json({ ok: false }, { status: 503 });
    return Response.json({ ok: true, code }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[offer-share] store failed", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
