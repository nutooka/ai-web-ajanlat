import { pricingConfig } from "@/config/pricing";
import { getEffectiveProjectType, otherRequests, pruneAnswers } from "@/features/questionnaire/engine";
import type { Answers, ResolvedProjectType } from "@/features/questionnaire/types";
import { flexibilityMultiplier, scheduleRange } from "./flexibility";
import { resolveQuickDecision } from "./quickDecision";
import {
  PACKAGE_IDS,
  type AnswerCondition,
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
  type SurchargeRule,
  type UrgencyLevel,
} from "./types";

interface CandidateItem extends ItemDefinition {
  id: string;
  source: LineItem["source"];
  /** Fixed RON price (surcharges): not hour-based, never scaled. */
  fixedPrice?: number;
  review?: string;
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;
const roundHalf = (value: number) => Math.round(value * 2) / 2;

function asList(value: Answers[string]): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** `$type` in a condition matches the effective project type (also when reached via "not sure yet"). */
export function matchesCondition(answers: Answers, condition: AnswerCondition): boolean {
  const projectType = getEffectiveProjectType(answers);
  return Object.entries(condition).every(([questionId, accepted]) => {
    const values = questionId === "$type" ? (projectType ? [projectType] : []) : asList(answers[questionId]);
    return values.some((value) => accepted.includes(value));
  });
}

/** Surcharge rules that apply; within a group only the first match counts (no double charging). */
export function matchingSurcharges(answers: Answers, config: PricingConfig): SurchargeRule[] {
  const usedGroups = new Set<string>();
  return config.surcharges.filter((rule) => {
    if (!matchesCondition(answers, rule.when)) return false;
    if (!rule.group) return true;
    if (usedGroups.has(rule.group)) return false;
    usedGroups.add(rule.group);
    return true;
  });
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

  for (const rule of matchingSurcharges(answers, config)) {
    if (rule.price <= 0) continue;
    items.push({
      id: rule.id,
      label: rule.label,
      description: rule.description,
      category: "development",
      essential: true,
      hours: 0,
      fixedPrice: rule.price,
      review: rule.review,
      source: "answer",
    });
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

function chosenDesign(answers: Answers, config: PricingConfig): DesignLevel {
  for (const [questionId, map] of Object.entries(config.design.answerMap ?? {})) {
    const value = answers[questionId];
    if (typeof value === "string" && map[value]) return map[value];
  }
  return answers.design === "tailored" || answers.design === "custom" ? answers.design : "template";
}

function resolveDesign(answers: Answers, packageId: PackageId, projectType: ResolvedProjectType, config: PricingConfig): DesignLevel {
  const chosen = chosenDesign(answers, config);
  if (packageId === "basic") return config.design.basic;
  if (packageId === "premium") {
    const order: DesignLevel[] = ["template", "tailored", "custom"];
    const floor = config.design.premiumByType?.[projectType] ?? config.design.premium;
    return order.indexOf(chosen) > order.indexOf(floor) ? chosen : floor;
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
  if (packageId === "basic") return [...base, ...chosen];

  const selectedIds = new Set(answerItems.map((item) => item.id));
  const extras: CandidateItem[] = config.premiumExtras
    .filter((extra) => packageId === "premium" || extra.fromPackage === "standard")
    .filter((extra) => !extra.skipIfSelected?.some((id) => selectedIds.has(id)))
    .map((extra) => ({
      id: extra.id,
      label: extra.label,
      description: extra.description,
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

function applyDiscounts(listPrice: number, packageId: PackageId, config: PricingConfig, quickPercent: number): AppliedDiscount[] {
  const candidates = [
    { id: "quick", enabled: true, percent: quickPercent, label: config.discounts.quickDecision.label },
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
    hostingLabel: config.maintenance.hostingLabels?.[projectType] ?? "Tárhely, üzemeltetés",
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
  quickPercent: number,
): PackageQuote {
  const designLevel = resolveDesign(answers, packageId, projectType, config);
  // Some project types price design as a fixed surcharge per level instead of a multiplier.
  const fixedDesign = config.design.fixedByType?.[projectType];
  const designMultiplier = fixedDesign ? 1 : config.design.multipliers[designLevel];
  const urgency = config.urgency[resolveUrgency(answers)];

  const candidates = itemsForPackage(packageId, projectType, answerItems, config);
  const designSurcharge = fixedDesign?.[designLevel];
  if (designSurcharge && designSurcharge.price > 0) {
    candidates.push({
      id: `design.${designLevel}`,
      label: designSurcharge.label,
      description: designSurcharge.description,
      category: "design",
      essential: true,
      hours: 0,
      fixedPrice: designSurcharge.price,
      source: "answer",
    });
  }

  const items: LineItem[] = candidates.map((item) => {
    if (item.fixedPrice !== undefined) {
      return {
        id: item.id,
        label: item.label,
        description: item.description,
        category: item.category,
        source: item.source,
        // Effective hours for scheduling only.
        hours: roundHalf(item.fixedPrice / config.hourlyRate),
        price: item.fixedPrice,
        group: "surcharge",
        review: item.review,
      };
    }
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
      group: "base",
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const hours = roundHalf(items.reduce((sum, item) => sum + item.hours, 0));

  // Schedule: a slider-chosen deadline (deadlineWeeks) overrides the categorical deadline answer.
  const normalWeeks = Math.max(1, Math.ceil(hours / config.weeklyCapacityHours)) + config.feedbackWeeks;
  const range = scheduleRange(normalWeeks, config.flexibility);
  const requestedWeeks = typeof answers.deadlineWeeks === "string" ? Number(answers.deadlineWeeks) : NaN;
  const chosenWeeks = Number.isInteger(requestedWeeks) ? Math.min(range.latestWeeks, Math.max(range.fastestWeeks, requestedWeeks)) : null;
  const priceMultiplier = chosenWeeks === null ? urgency.priceMultiplier : flexibilityMultiplier(chosenWeeks, normalWeeks, config.flexibility);
  const scheduleLabel = chosenWeeks === null ? urgency.label : `Választott határidő: ${chosenWeeks} hét`;

  const urgencyAdjustment = roundTo(subtotal * (priceMultiplier - 1), config.roundTo);
  const listPrice = roundTo(subtotal + urgencyAdjustment, config.roundTo);
  const discounts = applyDiscounts(listPrice, packageId, config, quickPercent);
  const savings = discounts.reduce((sum, discount) => sum + discount.amount, 0);
  const buildWeeks = Math.max(1, Math.ceil((hours / config.weeklyCapacityHours) * urgency.timeMultiplier));
  const minWeeks = chosenWeeks ?? buildWeeks + config.feedbackWeeks;

  return {
    id: packageId,
    ...config.packages[packageId],
    design: { level: designLevel, label: (config.design.labelsByType?.[projectType] ?? config.design.labels)[designLevel], multiplier: designMultiplier },
    items,
    subtotal,
    urgencyAdjustment,
    schedule: { ...range, chosenWeeks, multiplier: priceMultiplier, label: scheduleLabel },
    listPrice,
    discounts,
    finalPrice: listPrice - savings,
    savings,
    hours,
    timeline: chosenWeeks === null ? { minWeeks, maxWeeks: Math.max(minWeeks + 1, Math.ceil(minWeeks * 1.3)) } : { minWeeks: chosenWeeks, maxWeeks: chosenWeeks },
    maintenance: estimateMaintenance(projectType, packageId, config),
  };
}

/**
 * A higher tier must cost visibly more than a lower one, even after tier-specific discounts:
 * at least `minTierStepPercent` more (as far as its discounts allow).
 */
function enforceTierOrder(packages: PackageQuote[], config: PricingConfig): PackageQuote[] {
  return packages.reduce<PackageQuote[]>((result, current) => {
    const previous = result.at(-1);
    if (!previous) return [current];
    const step = Math.max(config.roundTo, roundTo((previous.finalPrice * config.discounts.minTierStepPercent) / 100, config.roundTo));
    const floor = previous.finalPrice + step;
    if (current.finalPrice >= floor) return [...result, current];

    const shortfall = floor - current.finalPrice;
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

const DESIGN_ORDER: DesignLevel[] = ["template", "tailored", "custom"];

/**
 * What the visitor asked for, and the cheapest package that has all of it.
 * Design items are package-driven (Premium may add one unasked), so design is compared by level instead.
 */
function coverage(packages: PackageQuote[], answers: Answers, config: PricingConfig): { recommended: PackageId; requested: Quote["requested"] } {
  const requested = new Map<string, string>();
  for (const pkg of packages) {
    for (const item of pkg.items) if (item.source === "answer" && !item.id.startsWith("design.")) requested.set(item.id, item.label);
  }
  const wantedDesign = chosenDesign(answers, config);
  const missing = Object.fromEntries(
    packages.map((pkg) => {
      const has = new Set(pkg.items.map((item) => item.id));
      const labels = [...requested].filter(([id]) => !has.has(id)).map(([, label]) => label);
      if (DESIGN_ORDER.indexOf(pkg.design.level) < DESIGN_ORDER.indexOf(wantedDesign)) labels.unshift("A választott design");
      return [pkg.id, labels];
    }),
  ) as Record<PackageId, string[]>;
  const recommended = packages.find((pkg) => missing[pkg.id].length === 0)?.id ?? "premium";
  return { recommended, requested: { ids: [...requested.keys()], missing } };
}

/**
 * Pure and deterministic: the same answers + config always give the same quote.
 * Returns null until the project type is known.
 */
export interface QuoteOptions {
  /** Minutes since the visitor first opened the offer (server-verified). Unknown = first tier. */
  offerAgeMinutes?: number;
}

export function calculateQuote(rawAnswers: Answers, config: PricingConfig = pricingConfig, options: QuoteOptions = {}): Quote | null {
  const answers = pruneAnswers(rawAnswers);
  const projectType = getEffectiveProjectType(answers);
  if (!projectType) return null;

  const answerItems = collectAnswerItems(answers, config);
  const extraLanguages = config.languages.extraByAnswer[String(answers.languages ?? "1")] ?? 0;
  const languageMultiplier = 1 + extraLanguages * config.languages.multiplierPerExtra;
  const urgencyLevel = resolveUrgency(answers);
  const quickDecision = resolveQuickDecision(config.discounts.quickDecision, options.offerAgeMinutes);

  const ordered = enforceTierOrder(
    PACKAGE_IDS.map((id) => buildPackage(id, projectType, answers, answerItems, languageMultiplier, config, quickDecision.percent)),
    config,
  );

  const reasons = [
    ...new Set([
      ...ordered.flatMap((pkg) => pkg.items.map((item) => item.review).filter((reason): reason is string => Boolean(reason))),
      // "Egyéb" free-text requests are not priced automatically: they are agreed on the call.
      ...otherRequests(answers).map((request) => `Egyedi kérés („${request.text}”): egyeztetés után árazzuk.`),
    ]),
  ];
  const notes = config.offerNotes.filter((note) => matchesCondition(answers, note.when));

  const { recommended, requested } = coverage(ordered, answers, config);

  return {
    projectType,
    currency: config.currency,
    hourlyRate: config.hourlyRate,
    urgency: { level: urgencyLevel, label: config.urgency[urgencyLevel].label, priceMultiplier: config.urgency[urgencyLevel].priceMultiplier },
    languageMultiplier,
    recommended,
    requested,
    quickDecision,
    packages: Object.fromEntries(ordered.map((pkg) => [pkg.id, pkg])) as Record<PackageId, PackageQuote>,
    review: { required: reasons.length > 0, reasons },
    requirements: notes.filter((note) => note.kind === "requirement").map((note) => note.text),
    exclusions: notes.filter((note) => note.kind === "exclusion").map((note) => note.text),
  };
}
