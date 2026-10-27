import type { Answers, QuestionOption } from "../types";

export const yesNo = (yes: string, no: string): QuestionOption[] => [
  { id: "yes", label: "Igen", description: yes, icon: "check" },
  { id: "no", label: "Nem", description: no, icon: "close" },
];

export const pageRangeOptions: QuestionOption[] = [
  { id: "1-5", label: "1–5 oldal", description: "Kompakt, lényegre törő oldal", icon: "article" },
  { id: "6-10", label: "6–10 oldal", description: "Szolgáltatások külön aloldalakon", icon: "layers" },
  { id: "11-20", label: "11–20 oldal", description: "Bővebb tartalom, több témakör", icon: "layers" },
  { id: "20+", label: "20+ oldal", description: "Nagy, összetett tartalomstruktúra", icon: "layers" },
];

export const answerIs = (questionId: string, value: string) => (answers: Answers) =>
  answers[questionId] === value;
