import { describe, expect, it } from "vitest";
import { RESOLVED_PROJECT_TYPES } from "@/features/questionnaire/types";
import { calculateQuote } from "./engine";
import { publicQuote, quickStartingPrice, SAMPLE_COMPANY_ANSWERS, startingPrice } from "./startingPrice";

describe("startingPrice", () => {
  it.each(RESOLVED_PROJECT_TYPES)("is a positive round number for %s", (type) => {
    const price = startingPrice(type);
    expect(price).toBeGreaterThan(0);
    expect(price % 50).toBe(0);
  });

  it("is never above the Basic price of a richer scope", () => {
    expect(startingPrice("company")).toBeLessThanOrEqual(publicQuote(SAMPLE_COMPANY_ANSWERS)!.packages.basic.finalPrice);
  });

  it("orders project types by size", () => {
    expect(startingPrice("landing")).toBeLessThan(startingPrice("company"));
    expect(startingPrice("company")).toBeLessThan(startingPrice("webshop"));
    expect(startingPrice("webshop")).toBeLessThan(startingPrice("webapp"));
  });

  it.each(RESOLVED_PROJECT_TYPES)("is the full price for %s: the quick-decision discount is never baked in", (type) => {
    const discounted = calculateQuote({ projectType: type, languages: "1", domain: "has", branding: "full", design: "template", contentUpload: "self", deadline: "normal" })!.packages.basic;
    expect(startingPrice(type)).toBe(discounted.listPrice);
    expect(quickStartingPrice(type)).toBe(discounted.finalPrice);
    expect(quickStartingPrice(type)).toBeLessThan(startingPrice(type));
  });

  it("public samples carry no quick-decision discount", () => {
    const quote = publicQuote(SAMPLE_COMPANY_ANSWERS)!;
    expect(quote.quickDecision.percent).toBe(0);
    expect(quote.packages.basic.discounts.find((discount) => discount.id === "quick")).toBeUndefined();
  });
});
