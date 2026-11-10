import { branchQuestions } from "./config/branches";
import { commonQuestions } from "./config/common";
import type { Question, ResolvedProjectType } from "./types";

/** Average time a visitor spends on one question, measured roughly on a phone. */
const SECONDS_PER_QUESTION = 14;

/** Conditional questions show up for about half of the visitors. */
const expectedCount = (questions: Question[]) => questions.reduce((sum, question) => sum + (question.showIf ? 0.5 : 1), 0);

/** Expected minutes to finish the questionnaire for one project type (project type question + branch + common). */
export function estimatedMinutes(type: ResolvedProjectType): number {
  const count = 1 + expectedCount(branchQuestions[type]) + expectedCount(commonQuestions);
  return Math.max(2, Math.round((count * SECONDS_PER_QUESTION) / 60));
}
