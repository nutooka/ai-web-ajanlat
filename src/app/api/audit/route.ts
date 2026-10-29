import { createRateLimiter } from "@/features/contact/spam";
import { AuditError, normalizeUrl, readCachedAudit, writeCachedAudit, type AuditResult } from "@/features/audit/audit";
import { runFullAudit } from "@/features/audit/run";

// The Google test itself takes 15–40 seconds.
export const maxDuration = 60;

const isAllowed = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

const MESSAGES: Record<AuditError["kind"], string> = {
  unreachable: "Nem sikerült megnyitni az oldalt. Ellenőrizd a címet, vagy hogy az oldal elérhető-e.",
  busy: "A mérőszolgáltatás most túlterhelt. Próbáld újra pár perc múlva.",
  failed: "A mérés nem sikerült. Próbáld újra pár perc múlva.",
};

/** One site: from the cache (a day) or a fresh Google test + our own checks. */
async function auditOne(url: string): Promise<AuditResult> {
  const cached = await readCachedAudit(url).catch(() => null);
  if (cached) return cached;
  // Trim: a key piped in from the clipboard may carry a trailing newline.
  const result = await runFullAudit(url, { apiKey: process.env.PAGESPEED_API_KEY?.trim() || undefined });
  await writeCachedAudit(result).catch(() => undefined);
  return result;
}

/** POST { url, competitor? } → { result, competitor? } */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 2000) return Response.json({ ok: false, error: "A kérés túl nagy." }, { status: 413 });
  let input: { url?: unknown; competitor?: unknown };
  try {
    input = JSON.parse(raw) as typeof input;
  } catch {
    return Response.json({ ok: false, error: "Érvénytelen kérés." }, { status: 400 });
  }
  const url = typeof input.url === "string" ? normalizeUrl(input.url) : null;
  if (!url) return Response.json({ ok: false, error: "Ez nem tűnik weboldal-címnek. Példa: pelda.ro" }, { status: 422 });
  const hasCompetitor = typeof input.competitor === "string" && input.competitor.trim() !== "";
  const competitorUrl = hasCompetitor ? normalizeUrl(String(input.competitor)) : null;
  if (hasCompetitor && !competitorUrl) return Response.json({ ok: false, error: "A versenytárs címe nem tűnik weboldal-címnek." }, { status: 422 });

  if (!isAllowed(clientIp(request), Date.now())) {
    return Response.json({ ok: false, error: "Túl sok mérés rövid idő alatt. Próbáld újra pár perc múlva." }, { status: 429 });
  }

  const [own, rival] = await Promise.allSettled([auditOne(url), competitorUrl ? auditOne(competitorUrl) : Promise.resolve(null)]);
  if (own.status === "rejected") {
    console.error("[audit] failed", url, own.reason);
    const kind = own.reason instanceof AuditError ? own.reason.kind : "failed";
    return Response.json({ ok: false, error: MESSAGES[kind] }, { status: 502 });
  }
  if (rival.status === "rejected") console.error("[audit] competitor failed", competitorUrl, rival.reason);
  return Response.json({
    ok: true,
    result: own.value,
    competitor: rival.status === "fulfilled" ? rival.value : null,
    competitorError: rival.status === "rejected" ? "A versenytárs oldalát nem sikerült lemérni." : null,
  });
}
