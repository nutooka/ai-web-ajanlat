import { describe, expect, it } from "vitest";
import type { Answers } from "@/features/questionnaire/types";
import { buildOffer, OFFER_DISCLAIMER } from "./buildOffer";

const answers: Answers = {
  projectType: "company",
  company_activity: "fogászati rendelő",
  company_pages: "6-10",
  company_features: ["contact_form", "blog"],
  company_content: "ready",
  company_seo: "basic",
  languages: "2",
  branding: "full",
  design: "tailored",
  contentUpload: "self",
  deadline: "normal",
};

describe("buildOffer", () => {
  it("returns null without a project type", () => {
    expect(buildOffer({})).toBeNull();
  });

  it("contains every required section", () => {
    const offer = buildOffer(answers)!;
    expect(offer.projectTypeLabel).toBe("Bemutatkozó / céges weboldal");
    expect(offer.summary).toContain("fogászati rendelő");
    expect(offer.tech.stack.length).toBeGreaterThan(0);
    expect(offer.selectedFeatures).toContain("Blog / hírek modul");
    expect(offer.nextSteps.length).toBeGreaterThan(0);
    expect(offer.disclaimer).toBe(OFFER_DISCLAIMER);
    expect(offer.includes.standard.length).toBeGreaterThan(0);
    expect(offer.excludes.standard.length).toBeGreaterThan(0);
  });

  it("lists Standard-only selections as excluded from Basic", () => {
    const offer = buildOffer(answers)!;
    expect(offer.excludes.basic.some((line) => line.startsWith("Blog / hírek modul"))).toBe(true);
    expect(offer.excludes.standard.some((line) => line.startsWith("Blog / hírek modul"))).toBe(false);
  });

  it("lists only visible, answered questions with readable labels", () => {
    const offer = buildOffer({ ...answers, shop_count: "1000+" })!;
    const rows = Object.fromEntries(offer.answerRows.map((row) => [row.questionId, row.answer]));
    expect(rows.shop_count).toBeUndefined();
    expect(rows.company_features).toBe("Kapcsolati űrlap, Blog / hírek");
    expect(rows.notes).toBeUndefined();
  });
});
