import { branchQuestions, projectTypeQuestion, unsureQuestions } from "../config/branches";
import { commonQuestions } from "../config/common";
import {
  RESOLVED_PROJECT_TYPES,
  type AnswerValue,
  type Answers,
  type ChoiceQuestion,
  type Question,
  type ResolvedProjectType,
} from "../types";
import { migrateLegacyAnswers } from "./legacy";

const ALL_QUESTIONS: Question[] = [
  projectTypeQuestion,
  ...unsureQuestions,
  ...Object.values(branchQuestions).flat(),
  ...commonQuestions,
];
const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map((question) => [question.id, question]));

export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BY_ID.get(id);
}

export function isResolvedProjectType(value: unknown): value is ResolvedProjectType {
  return typeof value === "string" && (RESOLVED_PROJECT_TYPES as readonly string[]).includes(value);
}

/**
 * Rule-based recommendation for visitors who picked "unsure".
 * Kept deterministic; an AI provider can replace it later (see src/lib/ai).
 */
export function recommendProjectType(answers: Answers): ResolvedProjectType {
  switch (answers.unsure_goal) {
    case "sell":
      return "webshop";
    case "process":
      return "webapp";
    case "leads":
      return "landing";
    default:
      return answers.unsure_hasSite === "yes" ? "redesign" : "company";
  }
}

/** Option we suggest (and preselect) for a question, if any. */
export function getRecommendedOption(questionId: string, answers: Answers): string | undefined {
  return questionId === "resolvedType" ? recommendProjectType(answers) : undefined;
}

export function getEffectiveProjectType(answers: Answers): ResolvedProjectType | undefined {
  if (answers.projectType === "unsure") {
    return isResolvedProjectType(answers.resolvedType) ? answers.resolvedType : undefined;
  }
  return isResolvedProjectType(answers.projectType) ? answers.projectType : undefined;
}

/** The ordered list of questions the visitor should see, given their answers so far. */
export function getVisibleQuestions(answers: Answers): Question[] {
  const sequence: Question[] = [projectTypeQuestion];
  if (answers.projectType === undefined) return sequence;

  if (answers.projectType === "unsure") sequence.push(...unsureQuestions);

  const projectType = getEffectiveProjectType(answers);
  if (projectType) sequence.push(...branchQuestions[projectType], ...commonQuestions);

  return sequence.filter((question) => question.showIf?.(answers) ?? true);
}

export function isQuestionAnswered(question: Question, value: AnswerValue | undefined): boolean {
  if (value === undefined) return false;
  if (question.kind === "multi") return Array.isArray(value) && value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

/** Returns a Hungarian error message, or null when the answer is acceptable. */
export function validateAnswer(question: Question, value: AnswerValue | undefined): string | null {
  if (!isQuestionAnswered(question, value)) {
    return question.required ? "Kérjük, válassz egy lehetőséget a továbblépéshez." : null;
  }
  if (question.kind === "text") {
    return typeof value === "string" && value.length <= question.maxLength
      ? null
      : `Legfeljebb ${question.maxLength} karakter adható meg.`;
  }
  const values = Array.isArray(value) ? value : [value];
  const known = new Set(question.options.map((option) => option.id));
  return values.every((item) => typeof item === "string" && known.has(item)) ? null : "Érvénytelen válasz.";
}

/** Toggle an option in a multi-select, respecting exclusive options like "none". */
export function toggleMultiOption(question: ChoiceQuestion, current: string[], optionId: string): string[] {
  if (current.includes(optionId)) return current.filter((id) => id !== optionId);
  const option = question.options.find((item) => item.id === optionId);
  if (!option) return current;
  if (option.exclusive) return [optionId];
  const exclusiveIds = new Set(question.options.filter((item) => item.exclusive).map((item) => item.id));
  return [...current.filter((id) => !exclusiveIds.has(id)), optionId];
}

function sanitizeValue(question: Question, value: unknown): AnswerValue | undefined {
  if (question.kind === "text") {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim().slice(0, question.maxLength);
    return trimmed.length > 0 ? trimmed : undefined;
  }
  const known = new Set(question.options.map((option) => option.id));
  if (question.kind === "single") {
    return typeof value === "string" && known.has(value) ? value : undefined;
  }
  if (!Array.isArray(value)) return undefined;
  const unique = [...new Set(value.filter((item): item is string => typeof item === "string" && known.has(item)))];
  return unique.length > 0 ? unique : undefined;
}

/**
 * Answers set outside the questionnaire (e.g. the deadline slider on the offer page).
 * Stored as strings like every other answer and validated here.
 */
const EXTRA_ANSWERS: Record<string, (value: unknown) => string | undefined> = {
  deadlineWeeks: (value) => {
    const weeks = Number(value);
    return Number.isInteger(weeks) && weeks >= 1 && weeks <= 52 ? String(weeks) : undefined;
  },
};

function sanitizeExtra(id: string, value: unknown): string | undefined {
  return EXTRA_ANSWERS[id]?.(value);
}

/**
 * Keep only answers that belong to currently visible questions and are valid.
 * Answers left behind on an abandoned branch are dropped, so they never affect pricing.
 * Safe to run on untrusted input (used by the API route).
 */
export function pruneAnswers(rawInput: Record<string, unknown>): Answers {
  const input = migrateLegacyAnswers(rawInput);
  let current: Answers = {};
  for (const [id, value] of Object.entries(input)) {
    const question = QUESTION_BY_ID.get(id);
    const clean = question ? sanitizeValue(question, value) : sanitizeExtra(id, value);
    if (clean !== undefined) current[id] = clean;
  }

  // Visibility depends on answers, so repeat until nothing else drops out.
  for (let pass = 0; pass < 5; pass += 1) {
    const visibleIds = new Set(getVisibleQuestions(current).map((question) => question.id));
    const next = Object.fromEntries(Object.entries(current).filter(([id]) => visibleIds.has(id) || id in EXTRA_ANSWERS));
    if (Object.keys(next).length === Object.keys(current).length) return next;
    current = next;
  }
  return current;
}

/** True when every required visible question has a valid answer. */
export function isComplete(answers: Answers): boolean {
  if (!getEffectiveProjectType(answers)) return false;
  return getVisibleQuestions(answers).every((question) => validateAnswer(question, answers[question.id]) === null);
}

export function getAnswerLabel(question: Question, value: AnswerValue | undefined): string {
  if (value === undefined) return "–";
  if (question.kind === "text") return String(value);
  const labels = (Array.isArray(value) ? value : [value]).map(
    (id) => question.options.find((option) => option.id === id)?.label ?? id,
  );
  return labels.join(", ");
}
