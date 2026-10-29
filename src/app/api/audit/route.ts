import { createRateLimiter } from "@/features/contact/spam";
import { AuditError, normalizeUrl, readCachedAudit, runPageSpeed, writeCachedAudit } from "@/features/audit/audit";

// The Google test itself takes 15–40 seconds.
export const maxDuration = 60;

const isAllowed = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** POST { url } → AuditResult (cached for a day). */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 1000) return Response.json({ ok: false, error: "A kérés túl nagy." }, { status: 413 });
  let input: { url?: unknown };
  try {
    input = JSON.parse(raw) as { url?: unknown };
  } catch {
    return Response.json({ ok: false, error: "Érvénytelen kérés." }, { status: 400 });
  }
  const url = typeof input.url === "string" ? normalizeUrl(input.url) : null;
  if (!url) return Response.json({ ok: false, error: "Ez nem tűnik weboldal-címnek. Példa: pelda.ro" }, { status: 422 });

  const cached = await readCachedAudit(url).catch(() => null);
  if (cached) return Response.json({ ok: true, result: cached });

  if (!isAllowed(clientIp(request), Date.now())) {
    return Response.json({ ok: false, error: "Túl sok mérés rövid idő alatt. Próbáld újra pár perc múlva." }, { status: 429 });
  }

  try {
    // Trim: a key piped in from the clipboard may carry a trailing newline.
    const result = await runPageSpeed(url, { apiKey: process.env.PAGESPEED_API_KEY?.trim() || undefined });
    await writeCachedAudit(result).catch(() => undefined);
    return Response.json({ ok: true, result });
  } catch (error) {
    console.error("[audit] failed", url, error);
    const kind = error instanceof AuditError ? error.kind : "failed";
    const message =
      kind === "unreachable"
        ? "Nem sikerült megnyitni az oldalt. Ellenőrizd a címet, vagy hogy az oldal elérhető-e."
        : kind === "busy"
          ? "A mérőszolgáltatás most túlterhelt. Próbáld újra pár perc múlva."
          : "A mérés nem sikerült. Próbáld újra pár perc múlva.";
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}
