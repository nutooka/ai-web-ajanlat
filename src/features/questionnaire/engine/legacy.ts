/**
 * Older webshop answers (before the detailed shipping / payment / product questions)
 * are translated to the current questions, so saved questionnaires and shared offer
 * links keep working. Only runs when an old-style answer is present.
 */
const LEGACY_KEYS = ["shop_onlinePayment", "shop_cod", "shop_shipping", "shop_inventory"];
const OPTION_ALIASES: Record<string, Record<string, string>> = {
  shop_current: { none: "new", marketplace: "new", existing: "migrate" },
  shop_count: { upto50: "11-50", "201-1000": "200+", "1000+": "200+" },
  shop_variants: { yes: "simple", no: "none" },
  shop_invoicing: { yes: "smartbill", unsure: "no" },
};
const DESIGN_TO_SHOP: Record<string, string> = { template: "theme", tailored: "layouts", custom: "custom" };

const isWebshop = (input: Record<string, unknown>) =>
  input.projectType === "webshop" || (input.projectType === "unsure" && input.resolvedType === "webshop");

export function migrateLegacyAnswers(input: Record<string, unknown>): Record<string, unknown> {
  const hasLegacy =
    LEGACY_KEYS.some((key) => key in input) ||
    Object.entries(OPTION_ALIASES).some(([key, map]) => typeof input[key] === "string" && (input[key] as string) in map);
  if (!hasLegacy || !isWebshop(input)) return input;

  const out: Record<string, unknown> = { ...input };
  for (const [key, map] of Object.entries(OPTION_ALIASES)) {
    const value = out[key];
    if (typeof value === "string" && map[value]) out[key] = map[value];
  }
  if (out.shop_current === "migrate" && out.shop_migrateData === undefined) out.shop_migrateData = ["products", "customers"];

  if (out.shop_payments === undefined && ("shop_onlinePayment" in input || "shop_cod" in input)) {
    const payments = [input.shop_onlinePayment === "yes" ? "card" : null, input.shop_cod === "yes" ? "cod" : null].filter(Boolean);
    out.shop_payments = payments.length > 0 ? payments : ["transfer"];
  }
  if (Array.isArray(out.shop_payments) && out.shop_payments.includes("card") && out.shop_paymentAccount === undefined) out.shop_paymentAccount = "unsure";

  if (out.shop_courier === undefined && Array.isArray(input.shop_shipping)) {
    const old = input.shop_shipping as string[];
    const courier = old.includes("courier") || old.includes("locker");
    out.shop_courier = courier ? "yes" : "no";
    if (courier) {
      out.shop_couriers ??= "1";
      out.shop_delivery ??= old.map((item) => (item === "courier" ? "home" : item));
      out.shop_shippingFee ??= "fixed";
      out.shop_courierContract ??= "unsure";
    }
  }

  if (out.shop_languages === undefined && typeof input.languages === "string") out.shop_languages = input.languages;
  if (out.shop_languages !== undefined && out.shop_languages !== "1") out.shop_translations ??= "ready";
  if (out.shop_design === undefined && typeof input.design === "string") out.shop_design = DESIGN_TO_SHOP[input.design] ?? "theme";
  if (out.shop_productUpload === "us") out.shop_productData ??= "ready";
  out.shop_legal ??= "notyet";
  return out;
}
