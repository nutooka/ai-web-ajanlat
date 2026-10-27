import type { Answers, ResolvedProjectType } from "@/features/questionnaire/types";

export interface TechRecommendation {
  title: string;
  description: string;
  stack: string[];
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  reason: string;
}

/**
 * Extension point for AI features (e.g. a Claude-backed provider later).
 * The MVP uses the rule-based implementation; swapping providers must not
 * change the pricing engine, which stays deterministic.
 */
export interface InsightProvider {
  /** Turn free-text answers into structured hints (e.g. detected features). */
  interpretFreeText(answers: Answers): Promise<string[]>;
  /** Information that is still missing for an accurate quote. */
  findMissingInfo(answers: Answers): Promise<string[]>;
  /** Extra, personalised questions to ask. */
  suggestFollowUps(answers: Answers): Promise<FollowUpQuestion[]>;
  /** Human-readable project summary. */
  writeSummary(answers: Answers, projectType: ResolvedProjectType): Promise<string>;
  /** Suggested technology stack. */
  recommendTech(answers: Answers, projectType: ResolvedProjectType): Promise<TechRecommendation>;
}
