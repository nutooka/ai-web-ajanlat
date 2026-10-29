import { describe, expect, it, vi } from "vitest";
import { AuditError, normalizeUrl, parsePageSpeed, runPageSpeed, verdict } from "./audit";
import { auditCustomerEmail, auditOwnerEmail } from "./email";

/** Trimmed-down PageSpeed v5 response with the fields we read. */
const sample = {
  lighthouseResult: {
    categories: { performance: { score: 0.42 }, accessibility: { score: 0.88 }, "best-practices": { score: 0.96 }, seo: { score: 0.7 } },
    audits: {
      "largest-contentful-paint": { score: 0.1, displayValue: "6,2 s" },
      "cumulative-layout-shift": { score: 0.95, displayValue: "0,02" },
      "total-blocking-time": { score: 0.6, displayValue: "450 ms" },
      "first-contentful-paint": { score: 0.5, displayValue: "2,9 s" },
      "uses-optimized-images": { score: 0.3 },
      "modern-image-formats": { score: 0 },
      "meta-description": { score: 0 },
      viewport: { score: 1 },
      "color-contrast": { score: 0 },
      "some-unknown-audit": { score: 0 },
    },
  },
};

describe("website check", () => {
  it("turns the Google response into scores, metrics and ranked Hungarian issues", () => {
    const result = parsePageSpeed("https://pelda.ro/", sample, 1);
    expect(result.scores).toEqual({ performance: 42, accessibility: 88, bestPractices: 96, seo: 70 });
    expect(result.metrics.lcp).toBe("6,2 s");
    const titles = result.issues.map((issue) => issue.title);
    // Worst and most important first; the two image audits collapse into one; unknown and passing audits are left out.
    expect(titles[0]).toBe("A fő tartalom lassan jelenik meg");
    expect(titles.filter((title) => title === "Túl nagy képek")).toHaveLength(1);
    expect(titles).toContain("Hiányzik a Google-leírás");
    expect(titles).not.toContain("Nincs mobilra beállítva");
    expect(result.issues.every((issue) => issue.why.length > 10)).toBe(true);
  });

  it("labels scores like PageSpeed does", () => {
    expect(verdict(95).label).toBe("Jó");
    expect(verdict(70).label).toBe("Javítható");
    expect(verdict(30).label).toBe("Gyenge");
  });

  it("accepts plain domains and rejects non-public addresses", () => {
    expect(normalizeUrl("pelda.ro")).toBe("https://pelda.ro/");
    expect(normalizeUrl("http://www.pelda.ro/rolunk#x")).toBe("http://www.pelda.ro/rolunk");
    for (const bad of ["", "localhost:3000", "http://127.0.0.1", "ftp://pelda.ro", "pelda", "http://intranet.local", "javascript:alert(1)"]) {
      expect(normalizeUrl(bad)).toBeNull();
    }
  });

  it("calls the mobile test with the API key and reports quota errors as busy", async () => {
    const ok = vi.fn(async () => new Response(JSON.stringify(sample)));
    await runPageSpeed("https://pelda.ro/", { apiKey: "k", fetchImpl: ok });
    const called = String((ok.mock.calls[0] as unknown as [string])[0]);
    expect(called).toContain("strategy=mobile");
    expect(called).toContain("key=k");
    expect(called).toContain("category=seo");

    const busy = vi.fn(async () => new Response(JSON.stringify({ error: { message: "Quota exceeded" } }), { status: 429 }));
    await expect(runPageSpeed("https://pelda.ro/", { fetchImpl: busy })).rejects.toMatchObject({ kind: "busy" });
    expect(new AuditError("busy", "x")).toBeInstanceOf(Error);
  });

  it("e-mails a readable report to the visitor and a lead note to the owner", () => {
    const result = parsePageSpeed("https://pelda.ro/", sample, 1);
    const customer = auditCustomerEmail(result);
    expect(customer.subject).toContain("pelda.ro");
    expect(customer.text).toContain("Sebesség: 42/100 (Gyenge)");
    expect(customer.html).toContain("Hiányzik a Google-leírás");
    const owner = auditOwnerEmail(result, "ugyfel@pelda.ro");
    expect(owner.subject).toContain("ugyfel@pelda.ro");
    expect(owner.html).toContain("kérte a teljes jelentést");
  });
});
