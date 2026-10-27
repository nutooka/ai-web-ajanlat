import { pricingConfig } from "@/config/pricing";
import type { ResolvedProjectType } from "@/features/questionnaire/types";
import { calculateQuote } from "./engine";
import type { PricingConfig } from "./types";

/** Smallest realistic scope: template design, one language, normal deadline, no extras. */
const MINIMAL_ANSWERS = { languages: "1", domain: "has", branding: "full", design: "template", contentUpload: "self", deadline: "normal" };

/** "From X RON" price for a project type, straight from the pricing engine (Basic package). */
export function startingPrice(projectType: ResolvedProjectType, config: PricingConfig = pricingConfig): number {
  return calculateQuote({ projectType, ...MINIMAL_ANSWERS }, config)?.packages.basic.finalPrice ?? 0;
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
