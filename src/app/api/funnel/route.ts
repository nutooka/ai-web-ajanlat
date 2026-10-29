import { createRateLimiter } from "@/features/contact/spam";
import { recordFunnelStep } from "@/features/funnel/store";

const isAllowed = createRateLimiter({ limit: 120, windowMs: 10 * 60 * 1000 });

/** Anonymous funnel counter: only whitelisted step names, no personal data. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!isAllowed(ip, Date.now())) return new Response(null, { status: 429 });
  const raw = await request.text();
  if (raw.length > 200) return new Response(null, { status: 413 });
  let step: unknown;
  try {
    step = (JSON.parse(raw) as { step?: unknown }).step;
  } catch {
    return new Response(null, { status: 400 });
  }
  try {
    await recordFunnelStep(step);
  } catch (error) {
    console.error("[funnel] record failed", error);
  }
  return new Response(null, { status: 204 });
}
