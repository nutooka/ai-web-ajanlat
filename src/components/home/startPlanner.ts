"use client";

import { track } from "@vercel/analytics";
import { trackStep } from "@/features/funnel/track";
import { getVisibleQuestions } from "@/features/questionnaire/engine";
import { wizardStore } from "@/lib/storage";

/** Starts a fresh planner with the project type already chosen (skips the first question). */
export function startPlanner(projectType: string, push: (href: string) => void): void {
  const answers = { projectType };
  wizardStore.reset();
  wizardStore.update({ answers, currentId: getVisibleQuestions(answers)[1]?.id ?? null });
  trackStep("home_type_pick");
  // Starting here skips the first question, so the wizard would not log the start.
  track("Kérdőív elkezdve", { projectType, source: "home" });
  push("/tervezo");
}
