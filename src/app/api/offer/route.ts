import { createResendSender } from "@/features/contact/resendSender";
import { createRateLimiter } from "@/features/contact/spam";
import { submitOffer } from "@/features/contact/submitOffer";

const MAX_BODY_BYTES = 64 * 1024;
const isAllowed = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  if (!isAllowed(clientIp(request), Date.now())) {
    return Response.json({ ok: false, error: "Túl sok kérés. Kérjük, próbáld újra néhány perc múlva." }, { status: 429 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "A kérés túl nagy." }, { status: 413 });
  }

  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "Érvénytelen kérés." }, { status: 400 });
  }

  const result = await submitOffer(input, { send: createResendSender(), ownerEmail: process.env.OFFER_OWNER_EMAIL });
  return Response.json(result.body, { status: result.status });
}
