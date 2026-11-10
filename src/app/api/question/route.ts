import { createResendSender } from "@/features/contact/resendSender";
import { submitQuestion } from "@/features/contact/question";
import { createRateLimiter } from "@/features/contact/spam";

const isAllowed = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!isAllowed(ip, Date.now())) return Response.json({ ok: false, error: "Túl sok kérés. Próbáld újra pár perc múlva." }, { status: 429 });
  const input = await request.json().catch(() => null);
  const result = await submitQuestion(input, { send: createResendSender(), ownerEmail: process.env.OFFER_OWNER_EMAIL });
  return Response.json(result.body, { status: result.status });
}
