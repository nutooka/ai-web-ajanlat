import { pricingConfig } from "@/config/pricing";
import { getEffectiveProjectType, pruneAnswers } from "@/features/questionnaire/engine";
import type { Answers, ResolvedProjectType } from "@/features/questionnaire/types";
import {
  PACKAGE_IDS,
  type AppliedDiscount,
  type CostCategory,
  type DesignLevel,
  type ItemDefinition,
  type LineItem,
  type Maintenance,
  type PackageId,
  type PackageQuote,
  type PricingConfig,
  type Quote,
  type UrgencyLevel,
} from "./types";

interface CandidateItem extends ItemDefinition {
  id: string;
  source: LineItem["source"];
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;
const roundHalf = (value: number) => Math.round(value * 2) / 2;

function asList(value: Answers[string]): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** All cost items the visitor's answers imply (independent of package). */
export function collectAnswerItems(answers: Answers, config: PricingConfig): CandidateItem[] {
  const items: CandidateItem[] = [];

  for (const [questionId, options] of Object.entries(config.answerItems)) {
    for (const optionId of asList(answers[questionId])) {
      const definition = options[optionId];
      if (definition) items.push({ ...definition, id: `${questionId}.${optionId}`, source: "answer" });
    }
  }

  const productCount = answers.shop_count;
  if (answers.shop_productUpload === "us" && typeof productCount === "string") {
    const hours = config.productUpload.hoursByCount[productCount];
    if (hours) {
      const { label, category, essential } = config.productUpload;
      items.push({ label, category, essential, hours, id: "shop_productUpload.us", source: "answer" });
    }
  }

  const extraLanguages = config.languages.extraByAnswer[String(answers.languages ?? "1")] ?? 0;
  if (extraLanguages > 0) {
    items.push({
      id: "languages.setup",
      label: `Többnyelvűség beállítása (+${extraLanguages} nyelv)`,
      hours: config.languages.setupHoursPerExtra * extraLanguages,
      category: "development",
      essential: true,
      source: "answer",
    });
  }

  return items;
}

function resolveDesign(answers: Answers, packageId: PackageId, config: PricingConfig): DesignLevel {
  const chosen: DesignLevel =
    answers.design === "tailored" || answers.design === "custom" ? answers.design : "template";
  if (packageId === "basic") return config.design.basic;
  if (packageId === "premium") {
    const order: DesignLevel[] = ["template", "tailored", "custom"];
    return order.indexOf(chosen) > order.indexOf(config.design.premium) ? chosen : config.design.premium;
  }
  return chosen;
}

function resolveUrgency(answers: Answers): UrgencyLevel {
  const value = answers.deadline;
  return value === "flexible" || value === "fast" || value === "urgent" ? value : "normal";
}

function itemsForPackage(
  packageId: PackageId,
  projectType: ResolvedProjectType,
  answerItems: CandidateItem[],
  config: PricingConfig,
): CandidateItem[] {
  const base: CandidateItem[] = config.baseItems[projectType].map((item) => ({ ...item, source: "base" }));
  const chosen = packageId === "basic" ? answerItems.filter((item) => item.essential) : answerItems;
  if (packageId !== "premium") return [...base, ...chosen];

  const selectedIds = new Set(answerItems.map((item) => item.id));
  const extras: CandidateItem[] = config.premiumExtras
    .filter((extra) => !extra.skipIfSelected?.some((id) => selectedIds.has(id)))
    .map((extra) => ({
      id: extra.id,
      label: extra.label,
      hours: roundHalf(extra.hours * config.premiumExtrasScale[projectType]),
      category: extra.category,
      essential: extra.essential,
      source: "premium",
    }));
  return [...base, ...chosen, ...extras];
}

function categoryMultiplier(category: CostCategory, designMultiplier: number, languageMultiplier: number): number {
  if (category === "design") return designMultiplier;
  if (category === "development" || category === "content") return languageMultiplier;
  return 1;
}

function applyDiscounts(listPrice: number, packageId: PackageId, config: PricingConfig): AppliedDiscount[] {
  const candidates = [
    { id: "launch", ...config.discounts.launch },
    ...(config.discounts.perPackage[packageId] ? [{ id: `package.${packageId}`, ...config.discounts.perPackage[packageId] }] : []),
  ].filter((discount) => discount.enabled && discount.percent > 0);

  let remainingPercent = config.discounts.maxTotalPercent;
  const applied: AppliedDiscount[] = [];
  for (const discount of candidates) {
    const percent = Math.min(discount.percent, remainingPercent);
    if (percent <= 0) break;
    remainingPercent -= percent;
    applied.push({ id: discount.id, label: discount.label, percent, amount: roundTo((listPrice * percent) / 100, config.roundTo) });
  }
  return applied;
}

function estimateMaintenance(projectType: ResolvedProjectType, packageId: PackageId, config: PricingConfig): Maintenance {
  const hostingMonthly = config.maintenance.hostingMonthly[projectType];
  const support = config.maintenance.support[packageId];
  const monthlyTotal = hostingMonthly + support.monthly;
  return {
    hostingMonthly,
    supportMonthly: support.monthly,
    supportLabel: support.label,
    domainYearly: config.maintenance.domainYearly,
    monthlyTotal,
    yearlyTotal: monthlyTotal * 12 + config.maintenance.domainYearly,
  };
}

function buildPackage(
  packageId: PackageId,
  projectType: ResolvedProjectType,
  answers: Answers,
  answerItems: CandidateItem[],
  languageMultiplier: number,
  config: PricingConfig,
): PackageQuote {
  const designLevel = resolveDesign(answers, packageId, config);
  const designMultiplier = config.design.multipliers[designLevel];
  const urgency = config.urgency[resolveUrgency(answers)];

  const items: LineItem[] = itemsForPackage(packageId, projectType, answerItems, config).map((item) => {
    const hours = item.hours * categoryMultiplier(item.category, designMultiplier, languageMultiplier) * config.productivityFactor;
    return {
      id: item.id,
      label: item.label,
      description: item.description,
      category: item.category,
      source: item.source,
      hours: roundHalf(hours),
      // Every visible amount is a round number; tiny items still cost at least one step.
      price: Math.max(config.roundTo, roundTo(hours * config.hourlyRate, config.roundTo)),
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const urgencyAdjustment = roundTo(subtotal * (urgency.priceMultiplier - 1), config.roundTo);
  const listPrice = roundTo(subtotal + urgencyAdjustment, config.roundTo);
  const discounts = applyDiscounts(listPrice, packageId, config);
  const savings = discounts.reduce((sum, discount) => sum + discount.amount, 0);
  const hours = roundHalf(items.reduce((sum, item) => sum + item.hours, 0));
  const buildWeeks = Math.max(1, Math.ceil((hours / config.weeklyCapacityHours) * urgency.timeMultiplier));
  const minWeeks = buildWeeks + config.feedbackWeeks;

  return {
    id: packageId,
    ...config.packages[packageId],
    design: { level: designLevel, label: config.design.labels[designLevel], multiplier: designMultiplier },
    items,
    subtotal,
    urgencyAdjustment,
    listPrice,
    discounts,
    finalPrice: listPrice - savings,
    savings,
    hours,
    timeline: { minWeeks, maxWeeks: Math.max(minWeeks + 1, Math.ceil(minWeeks * 1.3)) },
    maintenance: estimateMaintenance(projectType, packageId, config),
  };
}

/** A higher tier must never cost less than a lower one, even after tier-specific discounts. */
function enforceTierOrder(packages: PackageQuote[]): PackageQuote[] {
  return packages.reduce<PackageQuote[]>((result, current) => {
    const previous = result.at(-1);
    if (!previous || current.finalPrice >= previous.finalPrice) return [...result, current];

    const shortfall = previous.finalPrice - current.finalPrice;
    const discounts = [...current.discounts];
    let remaining = shortfall;
    for (let index = discounts.length - 1; index >= 0 && remaining > 0; index -= 1) {
      const reduce = Math.min(discounts[index].amount, remaining);
      discounts[index] = { ...discounts[index], amount: discounts[index].amount - reduce };
      remaining -= reduce;
    }
    const kept = discounts.filter((discount) => discount.amount > 0);
    const savings = kept.reduce((sum, discount) => sum + discount.amount, 0);
    return [...result, { ...current, discounts: kept, savings, finalPrice: current.listPrice - savings }];
  }, []);
}

/**
 * Recommend the richest package that fits the visitor's budget.
 * Without a budget answer we recommend Standard.
 */
function recommendPackage(packages: PackageQuote[], budgetMax: number | undefined): PackageId {
  if (budgetMax === undefined) return "standard";
  const fitting = packages.filter((pkg) => pkg.finalPrice <= budgetMax);
  return fitting.at(-1)?.id ?? "basic";
}

/**
 * Pure and deterministic: the same answers + config always give the same quote.
 * Returns null until the project type is known.
 */
export function calculateQuote(rawAnswers: Answers, config: PricingConfig = pricingConfig): Quote | null {
  const answers = pruneAnswers(rawAnswers);
  const projectType = getEffectiveProjectType(answers);
  if (!projectType) return null;

  const answerItems = collectAnswerItems(answers, config);
  const extraLanguages = config.languages.extraByAnswer[String(answers.languages ?? "1")] ?? 0;
  const languageMultiplier = 1 + extraLanguages * config.languages.multiplierPerExtra;
  const urgencyLevel = resolveUrgency(answers);

  const ordered = enforceTierOrder(
    PACKAGE_IDS.map((id) => buildPackage(id, projectType, answers, answerItems, languageMultiplier, config)),
  );

  const budgetAnswer = typeof answers.budget === "string" ? answers.budget : undefined;
  const budgetCeiling = budgetAnswer === undefined ? undefined : config.budgetCeilings[budgetAnswer];
  const budgetMax = budgetCeiling === null ? Number.POSITIVE_INFINITY : budgetCeiling;

  return {
    projectType,
    currency: config.currency,
    hourlyRate: config.hourlyRate,
    urgency: { level: urgencyLevel, label: config.urgency[urgencyLevel].label, priceMultiplier: config.urgency[urgencyLevel].priceMultiplier },
    languageMultiplier,
    recommended: recommendPackage(ordered, budgetMax),
    budget:
      budgetMax === undefined
        ? null
        : { max: Number.isFinite(budgetMax) ? budgetMax : null, withinBasic: ordered[0].finalPrice <= budgetMax },
    packages: Object.fromEntries(ordered.map((pkg) => [pkg.id, pkg])) as Record<PackageId, PackageQuote>,
  };
}
