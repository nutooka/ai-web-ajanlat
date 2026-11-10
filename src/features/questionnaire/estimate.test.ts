import { describe, expect, it } from "vitest";
import { estimatedMinutes } from "./estimate";

describe("estimatedMinutes", () => {
  it("is about 3 minutes for a company website", () => {
    expect(estimatedMinutes("company")).toBe(3);
  });

  it("is longer for a webshop than for a company website", () => {
    expect(estimatedMinutes("webshop")).toBeGreaterThan(estimatedMinutes("company"));
  });
});
