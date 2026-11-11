import { createResendSender } from "@/features/contact/resendSender";
import { submitQuestion } from "@/features/contact/question";
import { routeLimiter } from "@/features/contact/spam";
import { clientIp, readJsonBody } from "@/lib/http";

const MAX_BODY_BYTES = 8 * 1024;
const isAllowed = routeLimiter("question", 5);

export async function POST(request: Request) {
  if (!(await isAllowed(clientIp(request.headers) ?? "unknown", Date.now()))) {
    return Response.json({ ok: false, error: "Túl sok kérés. Próbáld újra pár perc múlva." }, { status: 429 });
  }
  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) return Response.json({ ok: false, error: body.status === 413 ? "A kérés túl nagy." : "Érvénytelen kérés." }, { status: body.status });
  const result = await submitQuestion(body.value, { send: createResendSender(), ownerEmail: process.env.OFFER_OWNER_EMAIL });
  return Response.json(result.body, { status: result.status });
}
