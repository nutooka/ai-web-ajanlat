import { createFollowUpDeps } from "@/features/followup/deps";
import { stopSequence } from "@/features/followup/sequence";
import { routeLimiter } from "@/features/contact/spam";
import { clientIp, readJsonBody } from "@/lib/http";

const isAllowed = routeLimiter("followup-stop", 20);

/**
 * POST ?t=<token> – stops a follow-up sequence. Used by the /leiratkozas button and by mail clients'
 * one-click unsubscribe (RFC 8058). GET never stops anything: link scanners prefetch GET URLs.
 */
export async function POST(request: Request) {
  if (!(await isAllowed(clientIp(request.headers) ?? "unknown", Date.now()))) return Response.json({ ok: false, error: "Túl sok kérés." }, { status: 429 });

  let token = new URL(request.url).searchParams.get("t");
  if (!token && request.headers.get("content-type")?.includes("application/json")) {
    const body = await readJsonBody(request, 2 * 1024);
    const value = body.ok && body.value && typeof body.value === "object" ? (body.value as { t?: unknown }).t : null;
    token = typeof value === "string" ? value : null;
  }

  const deps = createFollowUpDeps();
  if (!deps) return Response.json({ ok: false, error: "A leiratkozás most nem elérhető. Írj egy választ a levélre, és kézzel leállítjuk." }, { status: 503 });

  try {
    const result = await stopSequence(token, deps);
    if (result === "invalid") return Response.json({ ok: false, error: "Érvénytelen link." }, { status: 400 });
    return Response.json({ ok: true, result });
  } catch (error) {
    console.error("[followup] stop failed", error);
    return Response.json({ ok: false, error: "Nem sikerült. Próbáld újra, vagy írj választ a levélre." }, { status: 500 });
  }
}

export function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  return Response.redirect(new URL(`/leiratkozas?t=${encodeURIComponent(token)}`, request.url), 303);
}
