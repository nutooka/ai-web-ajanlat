import { after } from "next/server";
import { createResendSender } from "@/features/contact/resendSender";
import { createRecipientGuard, routeLimiter } from "@/features/contact/spam";
import { createUpstashFirstSeenStore } from "@/features/contact/contactLock";
import { submitOffer } from "@/features/contact/submitOffer";
import { saveSharedOffer } from "@/features/offer/share";
import { createFollowUpDeps } from "@/features/followup/deps";
import { siteUrl } from "@/config/site";
import { OFFER_CLOCK_COOKIE, offerAgeMinutes, offerClockSecret, readCookie, verifyOfferClock } from "@/features/offer/offerClock";
import { clientIp, readJsonBody } from "@/lib/http";

const MAX_BODY_BYTES = 64 * 1024;
const isAllowed = routeLimiter("offer", 5);

export async function POST(request: Request) {
  if (!(await isAllowed(clientIp(request.headers) ?? "unknown", Date.now()))) {
    return Response.json({ ok: false, error: "Túl sok kérés. Kérjük, próbáld újra néhány perc múlva." }, { status: 429 });
  }

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return Response.json({ ok: false, error: body.status === 413 ? "A kérés túl nagy." : "Érvénytelen kérés." }, { status: body.status });
  }

  const now = Date.now();
  const secret = offerClockSecret();
  const issuedAt = verifyOfferClock(readCookie(request.headers.get("cookie"), OFFER_CLOCK_COOKIE), secret, now);
  const result = await submitOffer(body.value, {
    send: createResendSender(),
    ownerEmail: process.env.OFFER_OWNER_EMAIL,
    offerAgeMinutes: offerAgeMinutes(issuedAt, now),
    offerOpenedAt: issuedAt,
    firstSeen: createUpstashFirstSeenStore(),
    lockSecret: secret,
    shareLink: async (answers, packageId, ageMinutes) => {
      const code = await saveSharedOffer(answers, packageId, secret, { ageMinutes });
      return code ? `${siteUrl}/a/${code}` : null;
    },
    followUps: createFollowUpDeps(),
    recipients: createRecipientGuard({ secret }),
    defer: after,
  });
  return Response.json(result.body, { status: result.status });
}
