import { describe, expect, it } from "vitest";
import { pricingConfig } from "@/config/pricing";
import { formatWindow, quickWindowText } from "@/features/pricing/quickDecision";
import { formatCountdown } from "./useOfferClock";

describe("discount window in words", () => {
  it("counts down hours and minutes, then mm:ss in the last hour", () => {
    expect(formatCountdown(48 * 60)).toBe("48 ó 00 p");
    expect(formatCountdown(61.5)).toBe("1 ó 01 p");
    expect(formatCountdown(59.5)).toBe("59:30");
    expect(formatCountdown(-1)).toBe("00:00");
  });

  it("names the window the way the pages say it", () => {
    expect(quickWindowText(pricingConfig.discounts.quickDecision)).toBe("48 órán belül");
    expect(formatWindow(48 * 60)).toBe("48 óra");
    expect(formatWindow(30)).toBe("30 perc");
  });
});
