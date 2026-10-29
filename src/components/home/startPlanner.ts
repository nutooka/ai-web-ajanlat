"use client";

import { track } from "@vercel/analytics";
import { trackStep } from "@/features/funnel/track";
import { wizardStore } from "@/lib/storage";

/** Starts a fresh planner with the project type already chosen (skips the first question). */
export function startPlanner(projectType: string, push: (href: string) => void): void {
  const answers = { projectType };
  wizardStore.reset();
  // currentId null: the planner opens at the first unanswered question (the one after the project type).
  wizardStore.update({ answers, currentId: null });
  trackStep("home_type_pick");
  // Starting here skips the first question, so the wizard would not log the start.
  track("Kérdőív elkezdve", { projectType, source: "home" });
  push("/tervezo");
}
