import { describe, expect, it } from "vitest";
import { pricingConfig } from "@/config/pricing";
import { isComplete, pruneAnswers } from "@/features/questionnaire/engine";
import type { Answers } from "@/features/questionnaire/types";
import { calculateQuote } from "./engine";
import type { PricingConfig } from "./types";

/** A simple, complete Shopify webshop: one courier, fixed fee, theme design, owner uploads. */
const base: Answers = {
  projectType: "webshop",
  shop_current: "new",
  shop_count: "1-10",
  shop_productUpload: "self",
  shop_variants: "none",
  shop_payments: ["card", "cod"],
  shop_paymentAccount: "yes",
  shop_courier: "yes",
  shop_couriers: "1",
  shop_delivery: ["home"],
  shop_shippingFee: "fixed",
  shop_courierContract: "yes",
  shop_accounts: "guest",
  shop_wholesale: "no",
  shop_invoicing: "no",
  shop_languages: "1",
  shop_design: "theme",
  shop_legal: "yes",
  domain: "has",
  branding: "full",
  deadline: "normal",
  budget: "unsure",
};

const noDiscounts: PricingConfig = {
  ...pricingConfig,
  discounts: { ...pricingConfig.discounts, quickDecision: { ...pricingConfig.discounts.quickDecision, enabled: false }, perPackage: {} },
};

const quote = (answers: Answers, config: PricingConfig = noDiscounts) => calculateQuote(answers, config)!;
const items = (answers: Answers, pkg: "basic" | "standard" | "premium" = "standard") => quote(answers).packages[pkg].items;
const priceOf = (answers: Answers, prefix: string) => items(answers).filter((item) => item.id.startsWith(prefix)).map((item) => item.price);

describe("webshop questionnaire", () => {
  it("the base fixture is a complete questionnaire", () => {
    expect(isComplete(base)).toBe(true);
  });

  it("asks the courier details only when shipping by courier", () => {
    const withCourier = pruneAnswers(base);
    expect(withCourier.shop_delivery).toEqual(["home"]);
    const withoutCourier = pruneAnswers({ ...base, shop_courier: "no" });
    expect(withoutCourier.shop_delivery).toBeUndefined();
    expect(withoutCourier.shop_shippingFee).toBeUndefined();
    expect(isComplete(withoutCourier)).toBe(true);
  });
});

describe("courier integration: one tier, never added up", () => {
  it.each([
    ["one courier, home delivery, fixed fee", {}, 300],
    ["one courier + parcel locker", { shop_delivery: ["home", "locker"] }, 750],
    ["two couriers (with locker too)", { shop_couriers: "2", shop_delivery: ["home", "locker"] }, 1000],
    ["dynamic carrier rates beat everything", { shop_couriers: "2", shop_delivery: ["locker"], shop_shippingFee: "carrier" }, 1600],
  ])("%s", (_name, change, expected) => {
    expect(priceOf({ ...base, ...change }, "shipping.")).toEqual([expected]);
  });

  it("free shipping over an amount and personal pickup cost nothing extra", () => {
    expect(priceOf({ ...base, shop_shippingFee: "free_over", shop_delivery: ["home", "pickup"] }, "shipping.")).toEqual([300]);
  });

  it("no courier, no courier price – even if old courier answers are left behind", () => {
    expect(priceOf({ ...base, shop_courier: "no", shop_shippingFee: "carrier", shop_couriers: "3+" }, "shipping.")).toEqual([]);
  });

  it("dynamic rates and 3+ couriers need a technical review", () => {
    expect(quote(base).review.required).toBe(false);
    expect(quote({ ...base, shop_shippingFee: "carrier" }).review.required).toBe(true);
    expect(quote({ ...base, shop_couriers: "3+" }).review.reasons.join(" ")).toMatch(/futár/i);
  });

  it("a missing courier contract adds no price, only a requirement", () => {
    const withContract = quote(base);
    const without = quote({ ...base, shop_courierContract: "no" });
    expect(without.packages.standard.listPrice).toBe(withContract.packages.standard.listPrice);
    expect(without.requirements.join(" ")).toMatch(/futárszerződés/);
  });
});

describe("products", () => {
  it("count and data readiness are separate factors", () => {
    const us = { ...base, shop_productUpload: "us", shop_count: "11-50" };
    expect(priceOf({ ...us, shop_productData: "ready" }, "upload.")).toEqual([300]);
    expect(priceOf({ ...us, shop_productData: "ready" }, "productData.")).toEqual([]);
    expect(priceOf({ ...us, shop_productData: "docs" }, "productData.")).toEqual([400]);
    expect(priceOf({ ...us, shop_productData: "collect" }, "productData.")).toEqual([1200]);
  });

  it("owner upload: no upload or data price", () => {
    expect(priceOf({ ...base, shop_count: "51-200", shop_productData: "collect" }, "upload.")).toEqual([]);
    expect(priceOf({ ...base, shop_count: "51-200", shop_productData: "collect" }, "productData.")).toEqual([]);
  });

  it("200+ products is a custom quote", () => {
    expect(quote({ ...base, shop_productUpload: "us", shop_productData: "ready", shop_count: "200+" }).review.required).toBe(true);
  });

  it("complex product configuration: surcharge on top of variants, with review", () => {
    const simple = quote({ ...base, shop_variants: "simple" });
    const complex = quote({ ...base, shop_variants: "complex" });
    expect(complex.packages.standard.subtotal - simple.packages.standard.subtotal).toBe(1000);
    expect(complex.review.required).toBe(true);
  });
});

describe("integrations, languages, design, migration", () => {
  it("invoicing: standard apps fixed, other systems reviewed", () => {
    expect(priceOf({ ...base, shop_invoicing: "smartbill" }, "invoicing.")).toEqual([500]);
    expect(priceOf({ ...base, shop_invoicing: "oblio" }, "invoicing.")).toEqual([500]);
    expect(quote({ ...base, shop_invoicing: "other" }).review.required).toBe(true);
    expect(quote({ ...base, shop_invoicing: "smartbill" }).requirements.join(" ")).toMatch(/e-Factura/);
  });

  it("extra languages: technical setup only, translation excluded", () => {
    expect(priceOf({ ...base, shop_languages: "2", shop_translations: "ready" }, "languages.")).toEqual([300]);
    expect(priceOf({ ...base, shop_languages: "3+", shop_translations: "ready" }, "languages.")).toEqual([600]);
    const translating = quote({ ...base, shop_languages: "2", shop_translations: "full" });
    expect(translating.packages.standard.subtotal).toBe(quote({ ...base, shop_languages: "2", shop_translations: "ready" }).packages.standard.subtotal);
    expect(translating.exclusions.join(" ")).toMatch(/fordítás/i);
  });

  it("design: theme is the base, custom UI is a fixed surcharge (not also a multiplier)", () => {
    expect(priceOf(base, "design.")).toEqual([]);
    expect(priceOf({ ...base, shop_design: "layouts" }, "design.")).toEqual([600]);
    expect(priceOf({ ...base, shop_design: "custom" }, "design.")).toEqual([2000]);
    const themeDesign = items(base).find((item) => item.id === "base.design")!.price;
    expect(items({ ...base, shop_design: "custom" }).find((item) => item.id === "base.design")!.price).toBe(themeDesign);
    // Basic stays on the theme.
    expect(items({ ...base, shop_design: "custom" }, "basic").some((item) => item.id.startsWith("design."))).toBe(false);
  });

  it("migration is priced by what moves; orders need a review", () => {
    const migrate = { ...base, shop_current: "migrate" };
    expect(priceOf({ ...migrate, shop_migrateData: ["products", "redirects"] }, "migration.").reduce((a, b) => a + b, 0)).toBe(900);
    expect(quote({ ...migrate, shop_migrateData: ["orders"] }).review.required).toBe(true);
    expect(priceOf({ ...base, shop_current: "restart", shop_migrateData: ["products"] }, "migration.")).toEqual([]);
  });

  it("legal texts and Shopify fees are never part of the development price", () => {
    const q = quote({ ...base, shop_legal: "help" });
    expect(q.exclusions.join(" ")).toMatch(/jogi/i);
    expect(q.exclusions.join(" ")).toMatch(/Shopify-előfizetés/);
    expect(q.packages.standard.listPrice).toBe(quote(base).packages.standard.listPrice);
  });
});

describe("totals", () => {
  it("surcharges sit in their own group, separate from base features", () => {
    const list = items({ ...base, shop_invoicing: "smartbill" });
    expect(list.find((item) => item.id === "invoicing.smartbill")!.group).toBe("surcharge");
    expect(list.find((item) => item.id === "base.engine")!.group).toBe("base");
  });

  it("discounts apply to the development price, surcharges included", () => {
    const withDiscounts = calculateQuote({ ...base, shop_invoicing: "smartbill" }, pricingConfig, { offerAgeMinutes: 0 })!.packages.basic;
    const quick = withDiscounts.discounts.find((discount) => discount.id === "quick")!;
    expect(quick.amount).toBe(Math.round((withDiscounts.listPrice * quick.percent) / 100 / 50) * 50);
    expect(withDiscounts.finalPrice).toBe(withDiscounts.listPrice - withDiscounts.savings);
  });

  it("changing an answer back gives exactly the original quote", () => {
    const before = quote(base);
    quote({ ...base, shop_shippingFee: "carrier", shop_invoicing: "other", shop_design: "custom" });
    expect(quote({ ...base })).toEqual(before);
  });

  it("price only moves with the answers: adding a surcharge adds exactly its price", () => {
    const plain = quote(base).packages.standard.subtotal;
    expect(quote({ ...base, shop_delivery: ["home", "locker"] }).packages.standard.subtotal - plain).toBe(450);
  });
});

describe("older saved answers", () => {
  it("are translated to the new questions and still give a complete quote", () => {
    const legacy: Answers = {
      projectType: "webshop",
      shop_current: "existing",
      shop_count: "upto50",
      shop_variants: "yes",
      shop_onlinePayment: "yes",
      shop_cod: "yes",
      shop_shipping: ["courier", "locker"],
      shop_inventory: "yes",
      shop_accounts: "guest",
      shop_wholesale: "no",
      shop_invoicing: "yes",
      shop_productUpload: "self",
      languages: "1",
      domain: "has",
      branding: "full",
      design: "template",
      deadline: "normal",
      budget: "unsure",
    };
    const migrated = pruneAnswers(legacy);
    expect(isComplete(migrated)).toBe(true);
    expect(migrated).toMatchObject({ shop_current: "migrate", shop_count: "11-50", shop_variants: "simple", shop_payments: ["card", "cod"], shop_invoicing: "smartbill", shop_design: "theme" });
    expect(priceOf(legacy, "shipping.")).toEqual([750]);
  });
});

describe("offer and e-mails carry the new details", () => {
  it("surcharges, review, requirements, exclusions and answers reach the offer and both e-mails", async () => {
    const { buildOffer } = await import("@/features/offer/buildOffer");
    const { customerEmail, ownerEmail } = await import("@/features/contact/email/templates");
    const answers: Answers = { ...base, shop_shippingFee: "carrier", shop_courierContract: "no", shop_invoicing: "smartbill", shop_legal: "help" };
    const offer = buildOffer(answers)!;
    expect(offer.quote.review.required).toBe(true);
    expect(offer.excludes.standard.join(" ")).toMatch(/jogi/i);
    expect(offer.answerRows.map((row) => row.questionId)).toEqual(expect.arrayContaining(["shop_shippingFee", "shop_courierContract", "shop_invoicing"]));

    const contact = { name: undefined, company: undefined, message: undefined, email: "anna@example.com", wantsCopy: true, consent: true, callbackTime: "asap" as const };
    const owner = ownerEmail(offer, "standard", contact, { submittedAt: 0, offerOpenedAt: null, offerAgeMinutes: 0, shareUrl: "https://nutooka.tech/a/ABCDEF" });
    expect(owner.text).toMatch(/Technikai egyeztetés szükséges/);
    expect(owner.text).toMatch(/Felár: Futárintegráció automatikus díjszámítással/);
    expect(owner.text).toMatch(/futárszerződés/);
    expect(owner.text).toMatch(/nutooka\.tech\/a\/ABCDEF/);
    expect(owner.text).toMatch(/Hogyan számoljuk a szállítási díjat/);

    const customer = customerEmail(offer, "standard", contact);
    expect(customer.text).toMatch(/-tól/);
    expect(customer.text).toMatch(/Nem része az árnak/);
  });
});

describe("webshop summary", () => {
  it("uses the webshop's own design and language answers (no empty phrases)", async () => {
    const { summarizeProject } = await import("@/lib/ai/ruleBased");
    const text = summarizeProject(pruneAnswers({ ...base, shop_languages: "2", shop_translations: "ready" }), "webshop");
    expect(text).toMatch(/Shopify-alapú/);
    expect(text).toMatch(/két nyelven, a márkádra szabott profi Shopify-témával/);
    expect(text).not.toMatch(/ – megoldással| megoldással,/);
  });
});

describe("Shopify limits shown as conditions", () => {
  it("over 50 product descriptions needs a technical talk", () => {
    const answers: Answers = { ...base, shop_productUpload: "us", shop_productData: "collect", shop_count: "51-200" };
    expect(priceOf(answers, "productData.")).toEqual([1200]);
    expect(quote(answers).review.reasons.join(" ")).toMatch(/50 termékleírás/);
    expect(quote({ ...answers, shop_count: "11-50" }).review.required).toBe(false);
  });

  it("asks the owner to activate Shopify Payments for card payments", () => {
    expect(quote(base).requirements.join(" ")).toMatch(/Shopify Payments/);
    expect(quote({ ...base, shop_payments: ["cod"] }).requirements.join(" ")).not.toMatch(/Shopify Payments/);
  });

  it("lists the extra Shopify costs for courier rates, lockers, migration and apps", () => {
    const q = quote({
      ...base,
      shop_shippingFee: "carrier",
      shop_delivery: ["home", "locker"],
      shop_current: "migrate",
      shop_migrateData: ["customers", "orders"],
      shop_wholesale: "yes",
      shop_accounts: "required",
      shop_promotions: ["loyalty"],
    });
    const notes = [...q.requirements, ...q.exclusions].join(" ");
    for (const text of [/magasabb Shopify-előfizetés/, /csomagautomata/, /jelszavai/, /Matrixify/, /viszonteladói/, /zárt bolthoz/, /hűségpont/]) {
      expect(notes).toMatch(text);
    }
    const plain = [...quote(base).requirements, ...quote(base).exclusions].join(" ");
    expect(plain).not.toMatch(/Matrixify|jelszavai|hűségpont|zárt bolthoz/);
  });
});

describe("option badges in the questionnaire", () => {
  it("flags the options that raise the price, need a talk or cost extra", async () => {
    const { optionImpacts } = await import("./optionImpact");
    expect(optionImpacts("shop_courier", "yes")).toEqual(["price"]);
    expect(optionImpacts("shop_courier", "no")).toEqual([]);
    expect(optionImpacts("shop_shippingFee", "carrier")).toEqual(["majorPrice", "review", "extraCost"]);
    expect(optionImpacts("shop_variants", "complex")).toEqual(["majorPrice", "review"]);
    expect(optionImpacts("shop_wholesale", "yes")).toEqual(["price", "extraCost"]);
    expect(optionImpacts("shop_design", "theme")).toEqual([]);
    expect(optionImpacts("shop_design", "custom")).toEqual(["majorPrice"]);
    // Small items stay quiet so the badges keep meaning something.
    expect(optionImpacts("company_features", "faq")).toEqual([]);
  });
});
