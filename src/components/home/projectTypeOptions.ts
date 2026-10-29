import type { QuestionOption } from "@/features/questionnaire/types";

/** Project type choices as plain data – built on the server, so the home page ships no questionnaire config. */
export type ProjectTypeOption = Pick<QuestionOption, "id" | "label" | "description" | "icon">;
