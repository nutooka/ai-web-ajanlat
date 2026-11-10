import { pricingConfig } from "@/config/pricing";
import type { Answers, ResolvedProjectType } from "@/features/questionnaire/types";
import { formatWeeks } from "@/lib/format";
import { calculateQuote } from "./engine";
import type { PricingConfig, Quote } from "./types";

/** Smallest realistic scope: template design, one language, normal deadline, no extras. */
const MINIMAL_ANSWERS = { languages: "1", domain: "has", branding: "full", design: "template", contentUpload: "self", deadline: "normal" };

/**
 * A quote for public pages: full price, no quick-decision discount.
 * The discount depends on the visitor's own offer clock, so it is shown separately, never baked into a "from" price.
 */
export function publicQuote(answers: Answers, config: PricingConfig = pricingConfig): Quote | null {
  return calculateQuote(answers, config, { quickDecision: false });
}

/** Smallest realistic quote for a project type, at full price. */
export function minimalQuote(projectType: ResolvedProjectType, config: PricingConfig = pricingConfig): Quote | null {
  return publicQuote({ projectType, ...MINIMAL_ANSWERS }, config);
}

/** "From X RON" price for a project type: the full Basic price from the pricing engine. */
export function startingPrice(projectType: ResolvedProjectType, config: PricingConfig = pricingConfig): number {
  return minimalQuote(projectType, config)?.packages.basic.finalPrice ?? 0;
}

/** The same starting price with the best quick-decision discount, for the "if you decide quickly" badge. */
export function quickStartingPrice(projectType: ResolvedProjectType, config: PricingConfig = pricingConfig): number {
  return calculateQuote({ projectType, ...MINIMAL_ANSWERS }, config)?.packages.basic.finalPrice ?? 0;
}

/** Delivery range from the Basic minimum to the Premium maximum, e.g. "2–4 hét". */
export function deliveryWeeks(quote: Quote): string {
  return formatWeeks(quote.packages.basic.timeline.minWeeks, quote.packages.premium.timeline.maxWeeks);
}

/** Sample answers used for the animated preview on the home page. */
export const SAMPLE_COMPANY_ANSWERS = {
  projectType: "company",
  company_pages: "6-10",
  company_features: ["contact_form", "booking", "gallery"],
  company_content: "ready",
  company_seo: "basic",
  languages: "1",
  domain: "has",
  branding: "full",
  design: "tailored",
  contentUpload: "self",
  deadline: "normal",
};
