/**
 * "Time vs money" slider: the more time the visitor gives us, the cheaper the project.
 * Faster than normal costs more (we reshuffle other work); slower fills idle capacity.
 */
export interface FlexibilityConfig {
  /** Fastest possible delivery as a share of the normal schedule. */
  fastestRatio: number;
  /** Price multiplier at the fastest delivery. */
  maxMultiplier: number;
  /** From this share of the normal schedule the discount stops growing. */
  relaxedRatio: number;
  /** Price multiplier at (or beyond) the relaxed schedule. */
  minMultiplier: number;
  /** Longest selectable deadline. */
  maxWeeks: number;
}

export interface ScheduleRange {
  normalWeeks: number;
  fastestWeeks: number;
  latestWeeks: number;
}

export function scheduleRange(normalWeeks: number, config: FlexibilityConfig): ScheduleRange {
  const fastestWeeks = Math.max(1, Math.ceil(normalWeeks * config.fastestRatio));
  const latestWeeks = Math.min(config.maxWeeks, Math.max(normalWeeks + 4, Math.ceil(normalWeeks * config.relaxedRatio)));
  return { normalWeeks, fastestWeeks, latestWeeks: Math.max(latestWeeks, normalWeeks) };
}

/** Linear between the anchor points, flat outside them; rounded to 2 decimals so prices stay stable. */
export function flexibilityMultiplier(chosenWeeks: number, normalWeeks: number, config: FlexibilityConfig): number {
  const ratio = chosenWeeks / normalWeeks;
  let multiplier: number;
  if (ratio <= config.fastestRatio) multiplier = config.maxMultiplier;
  else if (ratio < 1) multiplier = config.maxMultiplier + ((ratio - config.fastestRatio) / (1 - config.fastestRatio)) * (1 - config.maxMultiplier);
  else if (ratio < config.relaxedRatio) multiplier = 1 + ((ratio - 1) / (config.relaxedRatio - 1)) * (config.minMultiplier - 1);
  else multiplier = config.minMultiplier;
  return Math.round(multiplier * 100) / 100;
}
