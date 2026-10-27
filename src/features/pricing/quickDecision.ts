export interface QuickDecisionTier {
  /** The tier lasts until this many minutes after the offer was first opened. */
  withinMinutes: number;
  percent: number;
}

export interface QuickDecisionConfig {
  enabled: boolean;
  label: string;
  /** Ordered by time; after the last tier the full price applies. */
  tiers: QuickDecisionTier[];
}

export interface QuickDecisionState {
  percent: number;
  /** Index of the active tier, or -1 once every tier has expired. */
  tierIndex: number;
  /** Minutes left in the active tier; null when the clock is not known yet. */
  minutesLeft: number | null;
  /** Discount after the active tier ends (0 = full price). */
  nextPercent: number;
  expired: boolean;
}

/**
 * Which "quick decision" tier applies `offerAgeMinutes` after the offer was opened.
 * Without a known age (home page, before the clock loads) we show the first tier.
 */
export function resolveQuickDecision(config: QuickDecisionConfig, offerAgeMinutes?: number): QuickDecisionState {
  if (!config.enabled || config.tiers.length === 0) {
    return { percent: 0, tierIndex: -1, minutesLeft: null, nextPercent: 0, expired: true };
  }
  if (offerAgeMinutes === undefined || !Number.isFinite(offerAgeMinutes)) {
    return { percent: config.tiers[0].percent, tierIndex: 0, minutesLeft: null, nextPercent: config.tiers[1]?.percent ?? 0, expired: false };
  }
  const age = Math.max(0, offerAgeMinutes);
  const tierIndex = config.tiers.findIndex((tier) => age < tier.withinMinutes);
  if (tierIndex === -1) return { percent: 0, tierIndex: -1, minutesLeft: null, nextPercent: 0, expired: true };
  const tier = config.tiers[tierIndex];
  return {
    percent: tier.percent,
    tierIndex,
    minutesLeft: tier.withinMinutes - age,
    nextPercent: config.tiers[tierIndex + 1]?.percent ?? 0,
    expired: false,
  };
}
