import { pricingConfig } from "@/config/pricing";
import type { PricingConfig } from "./types";

/**
 * What choosing an answer option does to the offer, derived from the pricing config
 * (so the badges in the questionnaire never drift from the real prices).
 * - price / majorPrice: adds noticeable / large work or a surcharge (small items get no badge)
 * - review: needs a technical check first (price becomes "from")
 * - extraCost: costs money outside our price (app fee, subscription, translation)
 */
export type OptionImpact = "price" | "majorPrice" | "review" | "extraCost";

/** RON thresholds for the price badges (before design/language multipliers and discounts). */
export const IMPACT_THRESHOLDS = { price: 300, majorPrice: 1000 } as const;

const has = (list: readonly string[] | undefined, value: string) => list?.includes(value) ?? false;

/** Rough RON effect of one option, enough to rank it. */
function estimatedPrice(questionId: string, optionId: string, config: PricingConfig): number {
  const item = config.answerItems[questionId]?.[optionId];
  const fromHours = item ? item.hours * config.hourlyRate * config.productivityFactor : 0;
  // The cheapest surcharge it can trigger: "ships by courier" starts at the basic courier, not the priciest tier.
  const surchargePrices = config.surcharges.filter((rule) => has(rule.when[questionId], optionId)).map((rule) => rule.price);
  const fromSurcharges = surchargePrices.length > 0 ? Math.min(...surchargePrices) : 0;

  const level = config.design.answerMap?.[questionId]?.[optionId] ?? (questionId === "design" ? optionId : undefined);
  const fromDesign = level === "custom" ? IMPACT_THRESHOLDS.majorPrice : level === "tailored" ? IMPACT_THRESHOLDS.price : 0;

  const extraLanguages = questionId === "languages" || questionId === "shop_languages" ? (config.languages.extraByAnswer[optionId] ?? 0) : 0;
  const fromLanguages = extraLanguages > 1 ? IMPACT_THRESHOLDS.majorPrice : extraLanguages > 0 ? IMPACT_THRESHOLDS.price : 0;

  return Math.max(fromHours, fromSurcharges, fromDesign, fromLanguages);
}

export function optionImpacts(questionId: string, optionId: string, config: PricingConfig = pricingConfig): OptionImpact[] {
  const impacts: OptionImpact[] = [];

  const price = estimatedPrice(questionId, optionId, config);
  if (price >= IMPACT_THRESHOLDS.majorPrice) impacts.push("majorPrice");
  else if (price >= IMPACT_THRESHOLDS.price) impacts.push("price");

  // An option that is only a precondition (e.g. "ships by courier") also appears in plain rules:
  // the badge goes to the option that actually triggers the review or the fee.
  const surcharges = config.surcharges.filter((rule) => has(rule.when[questionId], optionId));
  if (surcharges.some((rule) => rule.review) && !surcharges.some((rule) => !rule.review)) impacts.push("review");

  const notes = config.offerNotes.filter((note) => has(note.when[questionId], optionId));
  if (notes.some((note) => note.extraCost) && !notes.some((note) => !note.extraCost)) impacts.push("extraCost");

  return impacts;
}

export const OPTION_IMPACT_LABELS: Record<OptionImpact, string> = {
  price: "Növeli az árat",
  majorPrice: "Jelentősen növeli az árat",
  review: "Egyeztetés kell",
  extraCost: "Külön díj (pl. app)",
};
