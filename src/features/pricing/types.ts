import type { ResolvedProjectType } from "@/features/questionnaire/types";
import type { FlexibilityConfig } from "./flexibility";
import type { QuickDecisionConfig, QuickDecisionState } from "./quickDecision";

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
  /** "standard": already part of Standard (so Standard always offers more than Basic). Default: Premium only. */
  fromPackage?: "standard" | "premium";
}

export type DesignLevel = "template" | "tailored" | "custom";

/** questionId → accepted option ids. Every listed question must match (any of its options). */
export type AnswerCondition = Record<string, readonly string[]>;

/**
 * A fixed-price complexity surcharge in RON (not hour-based, never scaled).
 * Rules sharing a `group` are mutually exclusive: the first matching rule of the group wins,
 * so a bigger option replaces a smaller one instead of being added on top.
 */
export interface SurchargeRule {
  id: string;
  label: string;
  price: number;
  when: AnswerCondition;
  group?: string;
  /** Shown under the line item: what it covers, limits, the price range behind the estimate. */
  description?: string;
  /** When set, the offer needs a technical review: no unconditional fixed price. */
  review?: string;
}

/** A condition, limit or exclusion printed on the offer (no price effect). */
export interface OfferNoteRule {
  id: string;
  when: AnswerCondition;
  kind: "requirement" | "exclusion";
  text: string;
}
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
  /** Fixed-price complexity surcharges (see SurchargeRule). */
  surcharges: SurchargeRule[];
  /** Conditions, limits and exclusions shown on the offer. */
  offerNotes: OfferNoteRule[];
  design: {
    multipliers: Record<DesignLevel, number>;
    labels: Record<DesignLevel, string>;
    basic: DesignLevel;
    premium: DesignLevel;
    /** Per project type: different names for the same levels (e.g. "Shopify theme"). */
    labelsByType?: Partial<Record<ResolvedProjectType, Record<DesignLevel, string>>>;
    /** Per project type: the level Premium upgrades to (default: `premium`). */
    premiumByType?: Partial<Record<ResolvedProjectType, DesignLevel>>;
    /** Answers that set the design level instead of the shared `design` question (e.g. shop_design). */
    answerMap?: Record<string, Record<string, DesignLevel>>;
    /**
     * Per project type: fixed RON surcharges per design level instead of the multiplier
     * (e.g. webshop: theme customisation is the base, fully custom UI is a fixed surcharge).
     */
    fixedByType?: Partial<Record<ResolvedProjectType, Partial<Record<DesignLevel, { label: string; price: number; description?: string }>>>>;
  };
  languages: { extraByAnswer: Record<string, number>; multiplierPerExtra: number; setupHoursPerExtra: number };
  urgency: Record<UrgencyLevel, { label: string; priceMultiplier: number; timeMultiplier: number }>;
  flexibility: FlexibilityConfig;
  premiumExtras: PremiumExtra[];
  /** Premium extras are scaled to the project size (a landing page needs less SEO work than a webshop). */
  premiumExtrasScale: Record<ResolvedProjectType, number>;
  /** Budget answer → upper limit in RON (null = no limit). Only used to recommend a package. */
  budgetCeilings: Record<string, number | null>;
  discounts: {
    /** Time-limited discount: the sooner the visitor requests a call, the bigger it is. */
    quickDecision: QuickDecisionConfig;
    perPackage: Partial<Record<PackageId, Discount>>;
    maxTotalPercent: number;
    /** A higher package costs at least this much (%) more than the one below it. */
    minTierStepPercent: number;
  };
  maintenance: {
    hostingMonthly: Record<ResolvedProjectType, number>;
    /** Name of the monthly running cost per project type (default: hosting). */
    hostingLabels?: Partial<Record<ResolvedProjectType, string>>;
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
  /** "base" = core features; "surcharge" = complexity surcharge (fixed RON). */
  group: "base" | "surcharge";
  /** Set when this item needs a technical review before a fixed price. */
  review?: string;
}

export interface AppliedDiscount {
  id: string;
  label: string;
  percent: number;
  amount: number;
}

export interface Maintenance {
  hostingMonthly: number;
  hostingLabel: string;
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
  /** Delivery schedule for this package and the price effect of the chosen deadline. */
  schedule: {
    normalWeeks: number;
    fastestWeeks: number;
    latestWeeks: number;
    /** Set when the visitor picked a deadline on the slider. */
    chosenWeeks: number | null;
    multiplier: number;
    label: string;
  };
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
  quickDecision: QuickDecisionState;
  /** null when the visitor gave no budget or answered "not sure". */
  budget: { max: number | null; withinBasic: boolean } | null;
  /** Risky or custom requests: the price is a starting estimate, a technical review comes first. */
  review: { required: boolean; reasons: string[] };
  /** What the customer needs to provide or arrange (contracts, accounts, content). */
  requirements: string[];
  /** What the development price does not cover, given these answers. */
  exclusions: string[];
  packages: Record<PackageId, PackageQuote>;
}
