import type { Inspection } from "./checks";

/**
 * Free website check: Google PageSpeed Insights (Lighthouse, mobile) → a short Hungarian verdict.
 * Pure parsing + a thin fetch wrapper, so it is testable without the network.
 */

export type AuditCategory = "performance" | "accessibility" | "bestPractices" | "seo";

export interface AuditIssue {
  id: string;
  title: string;
  why: string;
  /** 0 = worst. */
  score: number;
}

export interface AuditResult {
  url: string;
  checkedAt: number;
  scores: Record<AuditCategory, number>;
  metrics: { lcp: string; cls: string; tbt: string; fcp: string };
  issues: AuditIssue[];
  /** Main content time on mobile, ms (for the business-impact line). */
  lcpMs?: number;
  /** Total download size, e.g. "3,1 MiB". */
  pageWeight?: string;
  /** Mobile screenshot as a data: URI (from the Google test). */
  screenshot?: string;
  /** Our own checks on the HTML; null when the page could not be fetched by us. */
  inspection?: Inspection | null;
}

export const CATEGORY_LABELS: Record<AuditCategory, string> = {
  performance: "Sebesség",
  seo: "Google-megjelenés (SEO)",
  accessibility: "Akadálymentesség",
  bestPractices: "Biztonság és minőség",
};

export function verdict(score: number): { label: string; tone: "good" | "ok" | "bad" } {
  if (score >= 90) return { label: "Jó", tone: "good" };
  if (score >= 50) return { label: "Javítható", tone: "ok" };
  return { label: "Gyenge", tone: "bad" };
}

/** Hungarian explanations for the Lighthouse findings that matter most to a small business site. */
const ISSUES: Record<string, { title: string; why: string; weight: number }> = {
  "is-crawlable": { title: "A Google nem indexelheti az oldalt", why: "Egy beállítás tiltja a keresőket – így az oldal nem jelenik meg a Google-ben.", weight: 10 },
  viewport: { title: "Nincs mobilra beállítva", why: "Telefonon kicsinyítve, nehezen olvashatóan jelenik meg – a látogatók többsége telefonról jön.", weight: 9 },
  "is-on-https": { title: "Nem biztonságos (nincs HTTPS)", why: "A böngésző „nem biztonságos” figyelmeztetést mutat, ez elriasztja a látogatókat.", weight: 9 },
  "document-title": { title: "Hiányzik az oldal címe", why: "A Google-találatban ez a kék cím – nélküle kevesebben kattintanak.", weight: 7 },
  "meta-description": { title: "Hiányzik a Google-leírás", why: "A találat alatti szürke szöveg – ha nincs, a Google véletlenszerű részletet mutat.", weight: 6 },
  "largest-contentful-paint": { title: "A fő tartalom lassan jelenik meg", why: "A látogató sokáig üres vagy félkész oldalt lát – sokan ilyenkor visszalépnek.", weight: 8 },
  "total-blocking-time": { title: "Telefonon akadozik betöltés közben", why: "A böngésző sokáig dolgozik, ezért a gombok és görgetés késve reagálnak.", weight: 6 },
  "cumulative-layout-shift": { title: "Ugrál a tartalom betöltéskor", why: "Elemek csúsznak el betöltés közben – könnyű mellékattintani.", weight: 6 },
  "render-blocking-resources": { title: "Fájlok blokkolják a megjelenést", why: "Stílus- és szkriptfájlok miatt az oldal csak későn kezd kirajzolódni.", weight: 5 },
  "render-blocking-insight": { title: "Fájlok blokkolják a megjelenést", why: "Stílus- és szkriptfájlok miatt az oldal csak későn kezd kirajzolódni.", weight: 5 },
  "server-response-time": { title: "Lassú a szerver", why: "A tárhely későn kezd válaszolni – minden további lépés ehhez adódik hozzá.", weight: 5 },
  "document-latency-insight": { title: "Lassú a szerver", why: "A tárhely későn kezd válaszolni – minden további lépés ehhez adódik hozzá.", weight: 5 },
  "uses-optimized-images": { title: "Túl nagy képek", why: "A képek a szükségesnél jóval nagyobbak – ez lassítja a betöltést, főleg mobilneten.", weight: 5 },
  "modern-image-formats": { title: "Túl nagy képek", why: "A képek a szükségesnél jóval nagyobbak – ez lassítja a betöltést, főleg mobilneten.", weight: 5 },
  "uses-responsive-images": { title: "Túl nagy képek", why: "A képek a szükségesnél jóval nagyobbak – ez lassítja a betöltést, főleg mobilneten.", weight: 5 },
  "image-delivery-insight": { title: "Túl nagy képek", why: "A képek a szükségesnél jóval nagyobbak – ez lassítja a betöltést, főleg mobilneten.", weight: 5 },
  "offscreen-images": { title: "Túl nagy képek", why: "A képek a szükségesnél jóval nagyobbak – ez lassítja a betöltést, főleg mobilneten.", weight: 4 },
  "unused-javascript": { title: "Felesleges kód töltődik be", why: "Olyan kód is letöltődik, amit az oldal nem használ – ez lassít.", weight: 4 },
  "unused-css-rules": { title: "Felesleges kód töltődik be", why: "Olyan kód is letöltődik, amit az oldal nem használ – ez lassít.", weight: 3 },
  "third-party-summary": { title: "Külső szkriptek lassítanak", why: "Beágyazott widgetek, követőkódok sok időt vesznek el a betöltésből.", weight: 3 },
  "font-display": { title: "A betűtípus késlelteti a szöveget", why: "Amíg a betűtípus töltődik, a szöveg nem látszik.", weight: 3 },
  "font-display-insight": { title: "A betűtípus késlelteti a szöveget", why: "Amíg a betűtípus töltődik, a szöveg nem látszik.", weight: 3 },
  "target-size": { title: "Túl kicsi gombok mobilon", why: "Ujjal nehéz eltalálni a gombokat és linkeket.", weight: 4 },
  "tap-targets": { title: "Túl kicsi gombok mobilon", why: "Ujjal nehéz eltalálni a gombokat és linkeket.", weight: 4 },
  "color-contrast": { title: "Gyenge színkontraszt", why: "Egyes szövegek nehezen olvashatók, főleg napfényben telefonon.", weight: 3 },
  "image-alt": { title: "Képek leírás nélkül", why: "A Google és a felolvasóprogramok nem tudják, mit ábrázolnak a képek.", weight: 3 },
  "link-text": { title: "Semmitmondó linkszövegek", why: "Az „ide kattints” típusú linkek a Google-nek nem mondanak semmit.", weight: 2 },
  "uses-long-cache-ttl": { title: "Rövid gyorsítótárazás", why: "Visszatérő látogatónál is mindent újra letölt a böngésző.", weight: 2 },
  "cache-insight": { title: "Rövid gyorsítótárazás", why: "Visszatérő látogatónál is mindent újra letölt a böngésző.", weight: 2 },
  "errors-in-console": { title: "Hibák az oldal kódjában", why: "A böngésző hibákat jelez – egyes funkciók nem biztos, hogy működnek.", weight: 2 },
};

/** Lighthouse JSON (PageSpeed v5 response) → our compact result. */
export function parsePageSpeed(url: string, response: unknown, checkedAt: number): AuditResult {
  const lh = (response as { lighthouseResult?: { categories?: Record<string, { score: number | null }>; audits?: Record<string, LhAudit> } }).lighthouseResult;
  if (!lh?.categories || !lh.audits) throw new Error("PageSpeed: unexpected response");
  const pct = (key: string) => Math.round((lh.categories?.[key]?.score ?? 0) * 100);
  const audits = lh.audits;
  const display = (id: string) => audits[id]?.displayValue ?? "–";

  const seen = new Set<string>();
  const issues = Object.entries(audits)
    .filter(([id, audit]) => ISSUES[id] && typeof audit.score === "number" && audit.score < 0.9)
    .map(([id, audit]) => ({ id, ...ISSUES[id], score: audit.score as number }))
    .sort((a, b) => b.weight * (1 - b.score) - a.weight * (1 - a.score))
    .filter((issue) => (seen.has(issue.title) ? false : (seen.add(issue.title), true)))
    .slice(0, 8)
    .map(({ id, title, why, score }) => ({ id, title, why, score }));

  return {
    url,
    checkedAt,
    scores: { performance: pct("performance"), accessibility: pct("accessibility"), bestPractices: pct("best-practices"), seo: pct("seo") },
    metrics: {
      lcp: display("largest-contentful-paint"),
      cls: display("cumulative-layout-shift"),
      tbt: display("total-blocking-time"),
      fcp: display("first-contentful-paint"),
    },
    issues,
    lcpMs: audits["largest-contentful-paint"]?.numericValue,
    pageWeight: audits["total-byte-weight"]?.displayValue,
    screenshot: typeof audits["final-screenshot"]?.details?.data === "string" && audits["final-screenshot"].details.data.startsWith("data:image/") ? audits["final-screenshot"].details.data : undefined,
  };
}

/**
 * What slowness costs, in plain words. Figures: Google / SOASTA mobile benchmark research (2017):
 * as load time goes from 1 s to 3 / 5 / 6 / 10 s, the probability of a bounce rises by 32 / 90 / 106 / 123%.
 */
export function slownessImpact(lcpMs: number | undefined): { tone: "good" | "bad"; text: string } | null {
  if (lcpMs === undefined) return null;
  const seconds = (lcpMs / 1000).toLocaleString("hu-HU", { maximumFractionDigits: 1 });
  if (lcpMs <= 2500) return { tone: "good", text: `Telefonon ${seconds} mp alatt megjelenik a fő tartalom – ez gyors, a látogatók nem morzsolódnak le a várakozás miatt.` };
  const [from, rise] = lcpMs <= 4000 ? [3, 32] : lcpMs <= 5500 ? [5, 90] : lcpMs <= 8000 ? [6, 106] : [10, 123];
  return {
    tone: "bad",
    text: `Telefonon ${seconds} mp, mire a fő tartalom megjelenik. A Google kutatása szerint ha egy oldal 1 helyett ${from} másodperc alatt tölt be, ${rise}%-kal nő az esélye, hogy a látogató visszalép – vagyis ennyivel kevesebben jutnak el a telefonszámodig.`,
  };
}

interface LhAudit {
  score: number | null;
  displayValue?: string;
  numericValue?: number;
  details?: { data?: string };
}

/** Accepts "pelda.ro", "www.pelda.ro/rolunk", "https://…"; rejects anything that is not a public web address. */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 300) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  if (!host.includes(".") || host === "localhost" || /^[\d.]+$/.test(host) || host.includes(":") || host.endsWith(".local") || host.endsWith(".internal")) return null;
  url.hash = "";
  return url.toString();
}

const PSI = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export async function runPageSpeed(
  url: string,
  { apiKey, fetchImpl = fetch, now = Date.now() }: { apiKey?: string; fetchImpl?: typeof fetch; now?: number } = {},
): Promise<AuditResult> {
  const params = new URLSearchParams({ url, strategy: "mobile", locale: "hu" });
  for (const category of ["performance", "seo", "accessibility", "best-practices"]) params.append("category", category);
  if (apiKey) params.set("key", apiKey);
  const response = await fetchImpl(`${PSI}?${params}`, { signal: AbortSignal.timeout(110_000), cache: "no-store" });
  const body = (await response.json().catch(() => null)) as { error?: { message?: string; code?: number } } | null;
  if (!response.ok || !body) {
    const message = body?.error?.message ?? `HTTP ${response.status}`;
    throw new AuditError(response.status === 400 ? "unreachable" : response.status === 429 ? "busy" : "failed", message);
  }
  return parsePageSpeed(url, body, now);
}

export class AuditError extends Error {
  constructor(
    readonly kind: "unreachable" | "busy" | "failed",
    message: string,
  ) {
    super(message);
  }
}

/** Results are cached for a day, so a refresh or the e-mail step never re-runs the 20-second test. */
const CACHE_TTL_SECONDS = 24 * 60 * 60;

function kv(env: NodeJS.ProcessEnv) {
  const url = (env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL)?.replace(/\/$/, "");
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export const cacheKey = (url: string) => `audit:v2:${url.toLowerCase()}`;

export async function readCachedAudit(url: string, { env = process.env, fetchImpl = fetch } = {}): Promise<AuditResult | null> {
  const store = kv(env);
  if (!store) return null;
  const response = await fetchImpl(store.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${store.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["GET", cacheKey(url)]),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const result = ((await response.json()) as { result?: string | null }).result;
  return result ? (JSON.parse(result) as AuditResult) : null;
}

export async function writeCachedAudit(result: AuditResult, { env = process.env, fetchImpl = fetch } = {}): Promise<void> {
  const store = kv(env);
  if (!store) return;
  await fetchImpl(store.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${store.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", cacheKey(result.url), JSON.stringify(result), "EX", String(CACHE_TTL_SECONDS)]),
    cache: "no-store",
  });
}
