import type { ResolvedProjectType } from "@/features/questionnaire/types";

export const PACKAGE_IDS = ["basic", "standard", "premium"] as const;
export type PackageId = (typeof PACKAGE_IDS)[number];

/**
 * - design:      scaled by the design-complexity multiplier
 * - development / content: scaled by the extra-language multiplier
 * - others:      fixed hours
 */
export type CostCategory = "planning" | "design" | "branding" | "development" | "backend" | "integration" | "content" | "quality";

export interface ItemDefinition {
  label: string;
  hours: number;
  category: CostCategory;
  /** Essential items are part of Basic; the rest start at Standard. */
  essential: boolean;
  description?: string;
}

export interface PremiumExtra extends ItemDefinition {
  id: string;
  /** Skip the extra when the visitor already chose one of these items (id = "questionId.optionId"). */
  skipIfSelected?: string[];
}

export type DesignLevel = "template" | "tailored" | "custom";
export type UrgencyLevel = "flexible" | "normal" | "fast" | "urgent";

export interface Discount {
  enabled: boolean;
  percent: number;
  label: string;
}

export interface PricingConfig {
  currency: "RON";
  hourlyRate: number;
  roundTo: number;
  weeklyCapacityHours: number;
  /**
   * Internal: converts the classic (manual) hour estimates in this config to the
   * effective hours we actually bill. Never shown to the customer.
   */
  productivityFactor: number;
  /** Calendar buffer for client feedback rounds, added to every timeline. */
  feedbackWeeks: number;
  packages: Record<PackageId, { name: string; tagline: string }>;
  baseItems: Record<ResolvedProjectType, (ItemDefinition & { id: string })[]>;
  /** questionId → optionId → cost item. Options not listed cost nothing extra. */
  answerItems: Record<string, Record<string, ItemDefinition>>;
  /** Product upload is priced by product count (webshop). */
  productUpload: { label: string; category: CostCategory; essential: boolean; hoursByCount: Record<string, number> };
  design: { multipliers: Record<DesignLevel, number>; labels: Record<DesignLevel, string>; basic: DesignLevel; premium: DesignLevel };
  languages: { extraByAnswer: Record<string, number>; multiplierPerExtra: number; setupHoursPerExtra: number };
  urgency: Record<UrgencyLevel, { label: string; priceMultiplier: number; timeMultiplier: number }>;
  premiumExtras: PremiumExtra[];
  /** Premium extras are scaled to the project size (a landing page needs less SEO work than a webshop). */
  premiumExtrasScale: Record<ResolvedProjectType, number>;
  /** Budget answer → upper limit in RON (null = no limit). Only used to recommend a package. */
  budgetCeilings: Record<string, number | null>;
  discounts: {
    launch: Discount;
    perPackage: Partial<Record<PackageId, Discount>>;
    maxTotalPercent: number;
  };
  maintenance: {
    hostingMonthly: Record<ResolvedProjectType, number>;
    domainYearly: number;
    support: Record<PackageId, { label: string; monthly: number }>;
  };
}

export interface LineItem {
  id: string;
  label: string;
  description?: string;
  category: CostCategory;
  hours: number;
  price: number;
  source: "base" | "answer" | "premium";
}

export interface AppliedDiscount {
  id: string;
  label: string;
  percent: number;
  amount: number;
}

export interface Maintenance {
  hostingMonthly: number;
  supportMonthly: number;
  supportLabel: string;
  domainYearly: number;
  monthlyTotal: number;
  yearlyTotal: number;
}

export interface PackageQuote {
  id: PackageId;
  name: string;
  tagline: string;
  design: { level: DesignLevel; label: string; multiplier: number };
  items: LineItem[];
  /** Sum of line items. */
  subtotal: number;
  /** Positive = surcharge, negative = discount for a flexible deadline. */
  urgencyAdjustment: number;
  /** Price before discounts, rounded. */
  listPrice: number;
  discounts: AppliedDiscount[];
  finalPrice: number;
  savings: number;
  hours: number;
  timeline: { minWeeks: number; maxWeeks: number };
  maintenance: Maintenance;
}

export interface Quote {
  projectType: ResolvedProjectType;
  currency: "RON";
  hourlyRate: number;
  urgency: { level: UrgencyLevel; label: string; priceMultiplier: number };
  languageMultiplier: number;
  recommended: PackageId;
  /** null when the visitor gave no budget or answered "not sure". */
  budget: { max: number | null; withinBasic: boolean } | null;
  packages: Record<PackageId, PackageQuote>;
}
