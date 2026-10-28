import { describe, expect, it } from "vitest";
import { pricingConfig } from "@/config/pricing";
import type { Answers } from "@/features/questionnaire/types";
import { calculateQuote } from "./engine";
import { PACKAGE_IDS, type PricingConfig } from "./types";

const common: Answers = { languages: "1", branding: "full", design: "template", contentUpload: "self", deadline: "normal" };

const fixtures: Record<string, Answers> = {
  company: { projectType: "company", company_pages: "6-10", company_features: ["contact_form", "blog"], company_content: "ready", company_seo: "basic", ...common },
  webshop: {
    projectType: "webshop", shop_count: "51-200", shop_variants: "yes", shop_onlinePayment: "yes", shop_cod: "yes",
    shop_shipping: ["courier", "international"], shop_inventory: "yes", shop_invoicing: "yes", shop_productUpload: "us", ...common,
  },
  webapp: {
    projectType: "webapp", app_users: "customers", app_auth: "yes", app_roles: "2-3", app_admin: "yes", app_database: "yes",
    app_payment: "none", app_integrations: ["email_sms"], app_features: ["dashboard", "reports"], ...common,
  },
  landing: { projectType: "landing", landing_goal: "leads", landing_sections: "3-5", landing_forms: ["form"], landing_analytics: "no", landing_ads: "yes", ...common },
  redesign: {
    projectType: "redesign", redesign_problems: ["slow", "outdated"], redesign_platform: "wordpress", redesign_migration: "partial",
    redesign_pages: "1-5", redesign_newFeatures: ["blog"], ...common,
  },
};

/** Config without discounts and productivity factor, to test raw arithmetic. */
const noDiscounts: PricingConfig = {
  ...pricingConfig,
  hourlyRate: 200,
  productivityFactor: 1,
  discounts: { quickDecision: { ...pricingConfig.discounts.quickDecision, enabled: false }, perPackage: {}, maxTotalPercent: 25, minTierStepPercent: 10 },
};

describe("calculateQuote", () => {
  it("returns null until the project type is known", () => {
    expect(calculateQuote({})).toBeNull();
    expect(calculateQuote({ projectType: "unsure", unsure_goal: "sell" })).toBeNull();
  });

  it.each(Object.entries(fixtures))("is deterministic for %s", (_type, answers) => {
    expect(calculateQuote(answers)).toEqual(calculateQuote(structuredClone(answers)));
  });

  it.each(Object.entries(fixtures))("orders tiers Basic ≤ Standard ≤ Premium for %s", (_type, answers) => {
    const quote = calculateQuote(answers)!;
    const [basic, standard, premium] = PACKAGE_IDS.map((id) => quote.packages[id]);
    expect(basic.listPrice).toBeLessThanOrEqual(standard.listPrice);
    expect(standard.listPrice).toBeLessThanOrEqual(premium.listPrice);
    expect(basic.finalPrice).toBeLessThanOrEqual(standard.finalPrice);
    expect(standard.finalPrice).toBeLessThanOrEqual(premium.finalPrice);
  });

  it("prices a minimal landing page from the config", () => {
    const quote = calculateQuote(
      { projectType: "landing", landing_goal: "leads", landing_sections: "3-5", landing_analytics: "no", landing_ads: "no", ...common },
      noDiscounts,
    )!;
    const basic = quote.packages.basic;
    // 2 + 5 + 6 + 2 base hours × 200 RON (no discounts, productivity factor 1)
    expect(basic.hours).toBe(15);
    expect(basic.subtotal).toBe(3000);
    expect(basic.finalPrice).toBe(3000);
  });

  it("never prices Standard the same as Basic, even with only essential, template choices", () => {
    const quote = calculateQuote({ ...fixtures.company, design: "template", company_features: ["contact_form"] })!;
    const { basic, standard, premium } = quote.packages;
    expect(standard.finalPrice).toBeGreaterThan(basic.finalPrice);
    expect(premium.finalPrice).toBeGreaterThan(standard.finalPrice);
    expect(standard.items.map((item) => item.id)).toContain("premium.analytics");
    expect(basic.items.map((item) => item.id)).not.toContain("premium.analytics");
  });

  it("puts only essential selections into Basic", () => {
    const quote = calculateQuote(fixtures.company)!;
    const basicIds = quote.packages.basic.items.map((item) => item.id);
    const standardIds = quote.packages.standard.items.map((item) => item.id);
    expect(basicIds).toContain("company_features.contact_form");
    expect(basicIds).not.toContain("company_features.blog");
    expect(standardIds).toContain("company_features.blog");
  });

  it("adds premium extras but skips ones the visitor already chose", () => {
    const quote = calculateQuote({ ...fixtures.company, company_seo: "advanced" })!;
    const premiumIds = quote.packages.premium.items.map((item) => item.id);
    expect(premiumIds).toContain("premium.support");
    expect(premiumIds).toContain("company_seo.advanced");
    expect(premiumIds).not.toContain("premium.seo");
  });

  it("applies the design multiplier to design items only", () => {
    const template = calculateQuote({ ...fixtures.landing, design: "template" }, noDiscounts)!.packages.standard;
    const custom = calculateQuote({ ...fixtures.landing, design: "custom" }, noDiscounts)!.packages.standard;
    const designPrice = (pkg: typeof template) => pkg.items.find((item) => item.id === "base.design")!.price;
    const devPrice = (pkg: typeof template) => pkg.items.find((item) => item.id === "base.dev")!.price;
    expect(designPrice(custom)).toBe(Math.round((designPrice(template) * 1.7) / 50) * 50);
    expect(devPrice(custom)).toBe(devPrice(template));
  });

  it("adds language setup and scales development for extra languages", () => {
    const one = calculateQuote(fixtures.landing, noDiscounts)!.packages.standard;
    const two = calculateQuote({ ...fixtures.landing, languages: "2" }, noDiscounts)!.packages.standard;
    expect(two.items.some((item) => item.id === "languages.setup")).toBe(true);
    const dev = (pkg: typeof one) => pkg.items.find((item) => item.id === "base.dev")!.price;
    expect(dev(two)).toBe(Math.round((dev(one) * 1.2) / 50) * 50);
  });

  it("applies urgency to price and timeline", () => {
    const normal = calculateQuote(fixtures.webapp, noDiscounts)!.packages.standard;
    const urgent = calculateQuote({ ...fixtures.webapp, deadline: "urgent" }, noDiscounts)!.packages.standard;
    const flexible = calculateQuote({ ...fixtures.webapp, deadline: "flexible" }, noDiscounts)!.packages.standard;
    expect(urgent.urgencyAdjustment).toBe(Math.round((normal.subtotal * 0.4) / 50) * 50);
    expect(flexible.urgencyAdjustment).toBeLessThan(0);
    expect(urgent.timeline.minWeeks).toBeLessThan(normal.timeline.minWeeks);
  });

  it("prices product upload by product count (1–10 included)", () => {
    const upload = (count: string) =>
      calculateQuote({ ...fixtures.webshop, shop_count: count }, noDiscounts)!.packages.standard.items.find((item) => item.id.startsWith("upload."))?.price;
    expect(upload("1-10")).toBeUndefined();
    expect(upload("11-50")).toBe(300);
    expect(upload("51-200")).toBe(900);
  });

  it("ignores answers left on an abandoned branch", () => {
    const clean = calculateQuote(fixtures.landing)!;
    const withLeftovers = calculateQuote({ ...fixtures.landing, shop_count: "1000+", app_admin: "yes" })!;
    expect(withLeftovers).toEqual(clean);
  });

  it("rounds every price to the configured step", () => {
    for (const answers of Object.values(fixtures)) {
      for (const pkg of Object.values(calculateQuote(answers)!.packages)) {
        for (const item of pkg.items) expect(item.price % pricingConfig.roundTo).toBe(0);
        expect(pkg.items.every((item) => item.price >= pricingConfig.roundTo)).toBe(true);
        expect(pkg.listPrice).toBe(pkg.subtotal + pkg.urgencyAdjustment);
        expect(pkg.listPrice % pricingConfig.roundTo).toBe(0);
        expect(pkg.finalPrice % pricingConfig.roundTo).toBe(0);
      }
    }
  });
});

describe("productivity factor", () => {
  it("scales hours and prices by the hidden factor", () => {
    const raw = calculateQuote(fixtures.company, noDiscounts)!.packages.standard;
    const effective = calculateQuote(fixtures.company, { ...noDiscounts, productivityFactor: 0.4 })!.packages.standard;
    expect(effective.subtotal).toBeLessThan(raw.subtotal * 0.41);
    expect(effective.subtotal).toBeGreaterThan(raw.subtotal * 0.39);
  });

  it("adds the feedback buffer to the timeline", () => {
    const pkg = calculateQuote(fixtures.landing)!.packages.standard;
    expect(pkg.timeline.minWeeks).toBeGreaterThanOrEqual(1 + pricingConfig.feedbackWeeks);
  });
});

describe("deadline slider (time vs money)", () => {
  const at = (weeks: number | undefined) =>
    calculateQuote({ ...fixtures.company, ...(weeks === undefined ? {} : { deadlineWeeks: String(weeks) }) }, noDiscounts)!.packages.standard;

  it("charges the normal price at the normal schedule", () => {
    const normal = at(undefined).schedule.normalWeeks;
    expect(at(normal).schedule.multiplier).toBe(1);
    expect(at(normal).urgencyAdjustment).toBe(0);
  });

  it("gets cheaper the more time we get, down to the configured floor", () => {
    const { normalWeeks, latestWeeks } = at(undefined).schedule;
    const later = at(normalWeeks + 2);
    const latest = at(latestWeeks);
    expect(later.finalPrice).toBeLessThan(at(normalWeeks).finalPrice);
    expect(latest.finalPrice).toBeLessThanOrEqual(later.finalPrice);
    expect(latest.schedule.multiplier).toBeGreaterThanOrEqual(pricingConfig.flexibility.minMultiplier);
  });

  it("costs more when faster and clamps to the fastest possible delivery", () => {
    const { normalWeeks, fastestWeeks } = at(undefined).schedule;
    expect(at(Math.max(fastestWeeks, normalWeeks - 1)).finalPrice).toBeGreaterThanOrEqual(at(normalWeeks).finalPrice);
    expect(at(1).schedule.chosenWeeks).toBe(fastestWeeks);
    // Rounding the fastest week up can land just above the fastest ratio, so the surcharge is at most the max.
    expect(at(1).schedule.multiplier).toBeGreaterThan(1);
    expect(at(1).schedule.multiplier).toBeLessThanOrEqual(pricingConfig.flexibility.maxMultiplier);
  });

  it("uses the chosen weeks as the timeline", () => {
    const pkg = at(9);
    expect(pkg.timeline).toEqual({ minWeeks: pkg.schedule.chosenWeeks, maxWeeks: pkg.schedule.chosenWeeks });
  });

  it("keeps the deadline answer through pruning and rejects nonsense", () => {
    expect(calculateQuote({ ...fixtures.company, deadlineWeeks: "abc" }, noDiscounts)!.packages.standard.schedule.chosenWeeks).toBeNull();
    expect(calculateQuote({ ...fixtures.company, deadlineWeeks: "99" }, noDiscounts)!.packages.standard.schedule.chosenWeeks).toBeNull();
  });
});

describe("budget-based recommendation", () => {
  it("recommends Standard without a budget answer", () => {
    expect(calculateQuote(fixtures.company)!.recommended).toBe("standard");
    expect(calculateQuote({ ...fixtures.company, budget: "unsure" })!.recommended).toBe("standard");
    expect(calculateQuote({ ...fixtures.company, budget: "unsure" })!.budget).toBeNull();
  });

  it("recommends the richest package that fits the budget", () => {
    const unlimited = calculateQuote({ ...fixtures.company, budget: "40k+" })!;
    expect(unlimited.recommended).toBe("premium");
    expect(unlimited.budget).toEqual({ max: null, withinBasic: true });

    const tight = calculateQuote({ ...fixtures.webapp, budget: "under5k" })!;
    expect(tight.recommended).toBe("basic");
    expect(tight.budget?.withinBasic).toBe(false);
  });
});

describe("premium extras", () => {
  it("scale with the project size", () => {
    const hours = (answers: Answers) =>
      calculateQuote(answers)!.packages.premium.items.find((item) => item.id === "premium.support")!.hours;
    expect(hours(fixtures.landing)).toBeLessThan(hours(fixtures.webshop));
  });
});

describe("quick-decision discount", () => {
  const percentAt = (age?: number) => calculateQuote(fixtures.company, pricingConfig, { offerAgeMinutes: age })!.quickDecision.percent;

  it("shrinks over time and ends at full price", () => {
    expect(percentAt(undefined)).toBe(25);
    expect(percentAt(0)).toBe(25);
    expect(percentAt(59.9)).toBe(25);
    expect(percentAt(60)).toBe(15);
    expect(percentAt(119)).toBe(15);
    expect(percentAt(120)).toBe(0);
    expect(percentAt(600)).toBe(0);
  });

  it("makes later prices higher, never lower", () => {
    const price = (age: number) => calculateQuote(fixtures.company, pricingConfig, { offerAgeMinutes: age })!.packages.standard.finalPrice;
    expect(price(10)).toBeLessThan(price(70));
    expect(price(70)).toBeLessThan(price(130));
  });

  it("drops the discount row once expired", () => {
    const standard = calculateQuote(fixtures.company, pricingConfig, { offerAgeMinutes: 500 })!.packages.standard;
    expect(standard.discounts.map((discount) => discount.id)).toEqual(["package.standard"]);
  });

  it("reports minutes left in the current tier", () => {
    const state = calculateQuote(fixtures.company, pricingConfig, { offerAgeMinutes: 45 })!.quickDecision;
    expect(state).toMatchObject({ percent: 25, minutesLeft: 15, nextPercent: 15, expired: false });
  });
});

describe("discounts", () => {
  it("shows the quick-decision discount and the Standard package discount", () => {
    const standard = calculateQuote(fixtures.company)!.packages.standard;
    expect(standard.discounts.map((discount) => discount.id)).toEqual(["quick", "package.standard"]);
    expect(standard.savings).toBe(standard.discounts.reduce((sum, discount) => sum + discount.amount, 0));
    expect(standard.finalPrice).toBe(standard.listPrice - standard.savings);
  });

  it("can be switched off from the config", () => {
    const pkg = calculateQuote(fixtures.company, noDiscounts)!.packages.standard;
    expect(pkg.discounts).toEqual([]);
    expect(pkg.finalPrice).toBe(pkg.listPrice);
  });

  it("caps the combined discount", () => {
    const greedy: PricingConfig = {
      ...pricingConfig,
      discounts: {
        quickDecision: { enabled: true, label: "A", tiers: [{ withinMinutes: 60, percent: 20 }] },
        perPackage: { standard: { enabled: true, percent: 20, label: "B" } },
        maxTotalPercent: 25,
        minTierStepPercent: 10,
      },
    };
    const standard = calculateQuote(fixtures.company, greedy)!.packages.standard;
    expect(standard.discounts.map((discount) => discount.percent)).toEqual([20, 5]);
  });

  it("never lets Standard drop below Basic because of a tier discount", () => {
    // Nothing optional selected → Basic and Standard have the same items.
    const answers: Answers = { projectType: "landing", landing_goal: "leads", landing_sections: "3-5", landing_analytics: "no", landing_ads: "no", ...common };
    const quote = calculateQuote(answers)!;
    expect(quote.packages.standard.finalPrice).toBeGreaterThanOrEqual(quote.packages.basic.finalPrice);
  });

  it("does not discount maintenance", () => {
    const standard = calculateQuote(fixtures.webshop)!.packages.standard;
    expect(standard.maintenance.monthlyTotal).toBe(
      pricingConfig.maintenance.hostingMonthly.webshop + pricingConfig.maintenance.support.standard.monthly,
    );
  });
});
