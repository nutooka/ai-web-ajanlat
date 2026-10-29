import { describe, expect, it, vi } from "vitest";
import { slownessImpact } from "./audit";
import { inspectHtml, robotsBlocksEveryone } from "./checks";
import { isPrivateAddress, safeFetch } from "./safeFetch";

const good = `<!doctype html><html lang="hu"><head>
<title>Pékség Székelyudvarhely – friss kenyér minden reggel</title>
<meta name="description" content="Kézműves pékség Székelyudvarhelyen: kovászos kenyér, kalács, rendelés telefonon vagy online. Nyitva minden nap 6-tól.">
<meta property="og:image" content="/og.jpg"><link rel="icon" href="/favicon.ico">
<script type="application/ld+json">{"@type":"Bakery","@context":"https://schema.org"}</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1"></script>
</head><body><h1>Friss kenyér</h1><img src="a.jpg" alt="Kenyér">
<a href="tel:+40712345678">Hívj</a><a href="https://wa.me/40712345678">WhatsApp</a>
<a href="https://maps.app.goo.gl/abc">Térkép</a><a href="https://facebook.com/pekseg">Facebook</a>
<form><input type="email"><textarea></textarea></form>
<footer>© 2026 Pékség SRL · CUI RO12345678 · <a href="/adatvedelem">Adatvédelem</a> · Sütik</footer></body></html>`;

const bad = `<html><head><title>Home</title><meta name="robots" content="noindex"></head>
<body><img src="a.jpg"><img src="b.jpg"><h1>A</h1><h1>B</h1>
<button class="add-to-cart">Kosárba</button><footer>© 2019 Valami</footer></body></html>`;

const status = (html: string, id: string, extra: Partial<Parameters<typeof inspectHtml>[0]> = {}) =>
  inspectHtml({ html, finalUrl: "https://pelda.ro/", httpRedirectsToHttps: true, sitemapFound: true, robotsTxt: "User-agent: *\nAllow: /", currentYear: 2026, ...extra }).checks.find((check) => check.id === id)?.status;

describe("own checklist", () => {
  it("passes a well-built local business site", () => {
    const result = inspectHtml({ html: good, finalUrl: "https://pelda.ro/", httpRedirectsToHttps: true, sitemapFound: true, robotsTxt: "User-agent: *\nAllow: /", currentYear: 2026 });
    const problems = result.checks.filter((check) => check.status !== "ok").map((check) => check.id);
    expect(problems).toEqual(["pixel"]);
    expect(result.preview.ogImage).toBe("https://pelda.ro/og.jpg");
    expect(result.preview.favicon).toBe("https://pelda.ro/favicon.ico");
    expect(result.facts.isShop).toBe(false);
  });

  it("finds what a neglected site is missing, in plain words", () => {
    for (const id of ["phone", "chat", "form", "location", "social", "privacy", "company", "lang", "schema", "og-image", "favicon", "analytics"]) {
      expect(status(bad, id), id).not.toBe("ok");
    }
    expect(status(bad, "indexable")).toBe("fail");
    expect(status(bad, "h1")).toBe("warn");
    expect(status(bad, "description")).toBe("fail");
    expect(status(bad, "copyright")).toBe("warn");
    // A shop must show ANPC and SOL in Romania.
    expect(status(bad, "anpc")).toBe("fail");
    expect(inspectHtml({ html: bad, finalUrl: "https://pelda.ro/", httpRedirectsToHttps: null, sitemapFound: null, robotsTxt: null }).checks.find((check) => check.id === "alt")?.title).toBe(
      "2 képnek nincs leírása (alt)",
    );
  });

  it("spots an http-only site, a blocking robots.txt and a missing sitemap", () => {
    expect(status(good, "https", { finalUrl: "http://pelda.ro/" })).toBe("fail");
    expect(status(good, "robots", { robotsTxt: "User-agent: *\nDisallow: /\n" })).toBe("fail");
    expect(status(good, "sitemap", { sitemapFound: false })).toBe("warn");
    expect(status(good, "http-redirect", { httpRedirectsToHttps: false })).toBe("warn");
  });

  it("reads robots.txt per bot group and does not call a blog a shop", () => {
    expect(robotsBlocksEveryone("User-agent: *\nDisallow: /admin\n\nUser-agent: BadBot\nDisallow: /\n")).toBe(false);
    expect(robotsBlocksEveryone("User-agent: Googlebot\nUser-agent: *\nDisallow: / # all\n")).toBe(true);
    expect(robotsBlocksEveryone("User-agent: *\nDisallow:\n")).toBe(false);
    const blog = inspectHtml({ html: '<html><a href="/cart/">Kosár</a></html>', finalUrl: "https://a.ro/", httpRedirectsToHttps: null, sitemapFound: null, robotsTxt: null });
    expect(blog.facts.isShop).toBe(false);
  });

  it("detects the platform", () => {
    const wp = inspectHtml({ html: '<meta name="generator" content="WordPress 5.8.2"><link href="/wp-content/x.css">', finalUrl: "https://a.ro/", httpRedirectsToHttps: null, sitemapFound: null, robotsTxt: null });
    expect(wp.facts.platform).toBe("WordPress 5.8.2");
  });
});

describe("what slowness costs", () => {
  it("uses the band that matches the load time, with no claim for fast sites", () => {
    expect(slownessImpact(1800)?.tone).toBe("good");
    expect(slownessImpact(3500)?.text).toContain("32%");
    expect(slownessImpact(7000)?.text).toContain("106%");
    expect(slownessImpact(undefined)).toBeNull();
  });
});

describe("safe fetch (no internal addresses)", () => {
  it("recognises private, loopback and link-local addresses", () => {
    for (const address of ["127.0.0.1", "10.1.2.3", "172.20.0.1", "192.168.1.1", "169.254.169.254", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"]) {
      expect(isPrivateAddress(address), address).toBe(true);
    }
    for (const address of ["8.8.8.8", "76.76.21.21", "2606:4700::1111"]) expect(isPrivateAddress(address), address).toBe(false);
  });

  it("refuses a host that resolves to a private address, also after a redirect", async () => {
    const resolve = vi.fn(async (host: string) => [{ address: host === "evil.pelda.ro" ? "169.254.169.254" : "93.184.216.34", family: 4 }]) as never;
    await expect(safeFetch("https://evil.pelda.ro/", { resolve, fetchImpl: vi.fn() })).rejects.toThrow("blocked");
    const fetchImpl = vi.fn(async () => new Response(null, { status: 302, headers: { location: "https://evil.pelda.ro/admin" } }));
    await expect(safeFetch("https://ok.pelda.ro/", { resolve, fetchImpl })).rejects.toThrow("blocked");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("refuses odd ports and returns the final page otherwise", async () => {
    const resolve = vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]) as never;
    await expect(safeFetch("https://ok.pelda.ro:6379/", { resolve, fetchImpl: vi.fn() })).rejects.toThrow("port");
    const fetchImpl = vi.fn(async () => new Response("<html>ok</html>", { status: 200 }));
    const page = await safeFetch("https://ok.pelda.ro/", { resolve, fetchImpl });
    expect(page.html).toBe("<html>ok</html>");
  });
});
