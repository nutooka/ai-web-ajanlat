import { routeLimiter } from "@/features/contact/spam";
import { recordFunnelStep } from "@/features/funnel/store";
import { clientIp, readJsonBody } from "@/lib/http";

const isAllowed = routeLimiter("funnel", 120);

/** Anonymous funnel counter: only whitelisted step names, no personal data. */
export async function POST(request: Request) {
  if (!(await isAllowed(clientIp(request.headers) ?? "unknown", Date.now()))) return new Response(null, { status: 429 });
  const body = await readJsonBody(request, 200);
  if (!body.ok) return new Response(null, { status: body.status });
  const step = body.value && typeof body.value === "object" ? (body.value as { step?: unknown }).step : undefined;
  try {
    await recordFunnelStep(step);
  } catch (error) {
    console.error("[funnel] record failed", error);
  }
  return new Response(null, { status: 204 });
}
