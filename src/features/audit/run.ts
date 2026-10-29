import { inspectHtml, type Inspection } from "./checks";
import { runPageSpeed, type AuditResult } from "./audit";
import { safeFetch } from "./safeFetch";

/** Our own look at the page (contact, legal, Google basics). Never throws – a site may block us, the Google test still stands. */
export async function inspectSite(url: string, deps: { fetchImpl?: typeof fetch } = {}): Promise<Inspection | null> {
  try {
    const origin = new URL(url).origin;
    const insecure = `http://${new URL(url).host}/`;
    const [page, httpVersion, robots, sitemap] = await Promise.all([
      safeFetch(url, deps),
      safeFetch(insecure, { ...deps, maxBytes: 1 }).catch(() => null),
      safeFetch(`${origin}/robots.txt`, { ...deps, maxBytes: 50_000 }).catch(() => null),
      safeFetch(`${origin}/sitemap.xml`, { ...deps, maxBytes: 5_000 }).catch(() => null),
    ]);
    if (page.status >= 400) return null;
    const robotsTxt = robots && robots.status === 200 && !/<html/i.test(robots.html) ? robots.html : null;
    return inspectHtml({
      html: page.html,
      finalUrl: page.finalUrl,
      httpRedirectsToHttps: httpVersion ? httpVersion.finalUrl.startsWith("https://") : null,
      robotsTxt,
      // Many sites only list their sitemap in robots.txt (e.g. /sitemaps/index.xml).
      sitemapFound: (robotsTxt !== null && /^\s*sitemap\s*:\s*\S+/im.test(robotsTxt)) || (sitemap ? sitemap.status === 200 && /<(urlset|sitemapindex)/i.test(sitemap.html) : null),
    });
  } catch (error) {
    console.error("[audit] inspect failed", url, error);
    return null;
  }
}

/** Google mobile test + our own checks, in parallel. */
export async function runFullAudit(url: string, { apiKey }: { apiKey?: string }): Promise<AuditResult> {
  const [speed, inspection] = await Promise.all([runPageSpeed(url, { apiKey }), inspectSite(url)]);
  return { ...speed, inspection };
}
