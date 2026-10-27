import { describe, expect, it } from "vitest";
import { pricingConfig } from "@/config/pricing";
import { flexibilityMultiplier, scheduleRange } from "./flexibility";

const flex = pricingConfig.flexibility;

describe("flexibilityMultiplier", () => {
  it("hits the anchor points", () => {
    expect(flexibilityMultiplier(10, 10, flex)).toBe(1);
    expect(flexibilityMultiplier(6, 10, flex)).toBe(flex.maxMultiplier);
    expect(flexibilityMultiplier(25, 10, flex)).toBe(flex.minMultiplier);
    expect(flexibilityMultiplier(40, 10, flex)).toBe(flex.minMultiplier);
  });

  it("is monotonic: more time never costs more", () => {
    let previous = Infinity;
    for (let weeks = 1; weeks <= 30; weeks += 1) {
      const value = flexibilityMultiplier(weeks, 10, flex);
      expect(value).toBeLessThanOrEqual(previous);
      previous = value;
    }
  });
});

describe("scheduleRange", () => {
  it("brackets the normal schedule", () => {
    const range = scheduleRange(4, flex);
    expect(range.fastestWeeks).toBeLessThanOrEqual(4);
    expect(range.latestWeeks).toBeGreaterThan(4);
    expect(range.latestWeeks).toBeLessThanOrEqual(flex.maxWeeks);
  });
});
