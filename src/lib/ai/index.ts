import { ruleBasedProvider } from "./ruleBased";
import type { InsightProvider } from "./types";

/**
 * Returns the active insight provider.
 * Later: return a Claude-backed provider when e.g. ANTHROPIC_API_KEY is set (server only).
 */
export function getInsightProvider(): InsightProvider {
  return ruleBasedProvider;
}

export type { InsightProvider, TechRecommendation, FollowUpQuestion } from "./types";
