/** Every concrete project type the offer can be priced for. */
export const RESOLVED_PROJECT_TYPES = ["company", "webshop", "webapp", "landing", "redesign"] as const;
export type ResolvedProjectType = (typeof RESOLVED_PROJECT_TYPES)[number];

/** What the visitor can pick on the first step ("unsure" is resolved later). */
export type ProjectType = ResolvedProjectType | "unsure";

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue | undefined>;

/** Icon keys are plain strings so the config stays free of React. */
export type IconKey =
  | "business" | "store" | "apps" | "rocket" | "refresh" | "help"
  | "check" | "close" | "question" | "language" | "palette" | "brush" | "auto"
  | "upload" | "schedule" | "bolt" | "flash" | "calendar" | "mail" | "photo"
  | "article" | "star" | "faq" | "map" | "newsletter" | "search" | "seo"
  | "payments" | "cash" | "truck" | "locker" | "pickup" | "public" | "inventory"
  | "receipt" | "group" | "lock" | "admin" | "database" | "api" | "dashboard"
  | "file" | "notifications" | "chart" | "shield" | "speed" | "phone" | "edit"
  | "trend" | "campaign" | "event" | "download" | "ab" | "layers" | "person"
  | "people" | "sell" | "flag";

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: IconKey;
  /** Mutually exclusive with every other option in a multi-select question. */
  exclusive?: boolean;
  /** "Egyéb": when chosen, a short free-text field appears (stored under `otherAnswerKey(questionId)`). */
  other?: boolean;
}

/** Where the free text of an "Egyéb" option is stored. */
export const otherAnswerKey = (questionId: string) => `${questionId}__other`;
export const OTHER_TEXT_MAX = 200;

interface QuestionBase {
  id: string;
  title: string;
  subtitle?: string;
  /** Short "consultant tip" explaining why we ask. */
  hint?: string;
  required: boolean;
  /** Extra visibility rule on top of the branch the question belongs to. */
  showIf?: (answers: Answers) => boolean;
}

export interface ChoiceQuestion extends QuestionBase {
  kind: "single" | "multi";
  options: QuestionOption[];
}

export interface TextQuestion extends QuestionBase {
  kind: "text";
  placeholder?: string;
  multiline?: boolean;
  maxLength: number;
}

export type Question = ChoiceQuestion | TextQuestion;
