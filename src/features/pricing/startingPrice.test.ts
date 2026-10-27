import { describe, expect, it } from "vitest";
import { RESOLVED_PROJECT_TYPES } from "@/features/questionnaire/types";
import { calculateQuote } from "./engine";
import { SAMPLE_COMPANY_ANSWERS, startingPrice } from "./startingPrice";

describe("startingPrice", () => {
  it.each(RESOLVED_PROJECT_TYPES)("is a positive round number for %s", (type) => {
    const price = startingPrice(type);
    expect(price).toBeGreaterThan(0);
    expect(price % 50).toBe(0);
  });

  it("is never above the Basic price of a richer scope", () => {
    expect(startingPrice("company")).toBeLessThanOrEqual(calculateQuote(SAMPLE_COMPANY_ANSWERS)!.packages.basic.finalPrice);
  });

  it("orders project types by size", () => {
    expect(startingPrice("landing")).toBeLessThan(startingPrice("company"));
    expect(startingPrice("company")).toBeLessThan(startingPrice("webshop"));
    expect(startingPrice("webshop")).toBeLessThan(startingPrice("webapp"));
  });
});
