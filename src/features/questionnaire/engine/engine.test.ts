import { describe, expect, it } from "vitest";
import { branchQuestions } from "../config/branches";
import { commonQuestions } from "../config/common";
import type { ChoiceQuestion } from "../types";
import {
  getEffectiveProjectType,
  getQuestionById,
  getVisibleQuestions,
  isComplete,
  pruneAnswers,
  recommendProjectType,
  toggleMultiOption,
  validateAnswer,
} from ".";

const ids = (answers: Parameters<typeof getVisibleQuestions>[0]) => getVisibleQuestions(answers).map((q) => q.id);

describe("getVisibleQuestions", () => {
  it("starts with only the project type question", () => {
    expect(ids({})).toEqual(["projectType"]);
  });

  it.each(Object.keys(branchQuestions))("shows the %s branch followed by the common questions", (type) => {
    const visible = ids({ projectType: type, app_auth: "yes" });
    expect(visible[0]).toBe("projectType");
    for (const question of branchQuestions[type as keyof typeof branchQuestions]) {
      expect(visible).toContain(question.id);
    }
    expect(visible.at(-1)).toBe("notes");
  });

  it("never shows the same question twice", () => {
    for (const type of Object.keys(branchQuestions)) {
      const visible = ids({ projectType: type, app_auth: "yes" });
      expect(new Set(visible).size).toBe(visible.length);
    }
  });

  it("hides the roles question until login is required", () => {
    expect(ids({ projectType: "webapp", app_auth: "no" })).not.toContain("app_roles");
    expect(ids({ projectType: "webapp", app_auth: "yes" })).toContain("app_roles");
  });

  it("asks who uploads content only where no other question covers it", () => {
    expect(ids({ projectType: "webapp" })).not.toContain("contentUpload");
    expect(ids({ projectType: "company" })).not.toContain("contentUpload");
    expect(ids({ projectType: "landing" })).not.toContain("contentUpload");
    expect(ids({ projectType: "webshop" })).toContain("contentUpload");
    expect(ids({ projectType: "redesign" })).toContain("contentUpload");
  });

  it("does not ask the goal twice on the 'not sure' path", () => {
    const visible = ids({ projectType: "unsure", unsure_goal: "present", unsure_hasSite: "no", resolvedType: "company" });
    expect(visible).toContain("unsure_goal");
    expect(visible).not.toContain("company_goal");
    expect(ids({ projectType: "company" })).toContain("company_goal");
  });

  it("does not ask about a domain when there is already a website", () => {
    expect(ids({ projectType: "redesign" })).not.toContain("domain");
    expect(ids({ projectType: "unsure", unsure_goal: "present", unsure_hasSite: "yes", resolvedType: "company" })).not.toContain("domain");
    expect(ids({ projectType: "company" })).toContain("domain");
  });

  it("does not ask about the logo when the visitor keeps the old one", () => {
    expect(ids({ projectType: "redesign", redesign_keep: ["logo"] })).not.toContain("branding");
    expect(ids({ projectType: "redesign", redesign_keep: ["colors"] })).toContain("branding");
  });

  it("has a single free-text question at the end", () => {
    for (const type of Object.keys(branchQuestions)) {
      const common = getVisibleQuestions({ projectType: type }).filter((q) => q.kind === "text" && commonQuestions.includes(q));
      expect(common.map((q) => q.id)).toEqual(["notes"]);
    }
  });

  it("never shows two questions with the same title", () => {
    for (const type of Object.keys(branchQuestions)) {
      const titles = getVisibleQuestions({ projectType: type, app_auth: "yes" }).map((q) => q.title);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it("asks unsure questions first, then the branch chosen on the recommendation step", () => {
    expect(ids({ projectType: "unsure" })).toEqual(["projectType", "unsure_goal", "unsure_hasSite", "resolvedType"]);
    const visible = ids({ projectType: "unsure", unsure_goal: "sell", unsure_hasSite: "no", resolvedType: "webshop" });
    expect(visible).toContain("shop_count");
    expect(visible.indexOf("resolvedType")).toBeLessThan(visible.indexOf("shop_count"));
  });
});

describe("recommendProjectType", () => {
  it.each([
    [{ unsure_goal: "sell" }, "webshop"],
    [{ unsure_goal: "process" }, "webapp"],
    [{ unsure_goal: "leads" }, "landing"],
    [{ unsure_goal: "present", unsure_hasSite: "yes" }, "redesign"],
    [{ unsure_goal: "present", unsure_hasSite: "no" }, "company"],
  ])("maps %o to %s", (answers, expected) => {
    expect(recommendProjectType(answers)).toBe(expected);
  });
});

describe("pruneAnswers", () => {
  it("drops answers from an abandoned branch", () => {
    const pruned = pruneAnswers({ projectType: "company", shop_count: "1000+", company_pages: "6-10" });
    expect(pruned).toEqual({ projectType: "company", company_pages: "6-10" });
  });

  it("drops answers whose visibility condition no longer holds", () => {
    const pruned = pruneAnswers({ projectType: "webapp", app_auth: "no", app_roles: "4+" });
    expect(pruned.app_roles).toBeUndefined();
  });

  it("removes unknown questions, unknown options and trims text", () => {
    const pruned = pruneAnswers({
      projectType: "company",
      company_pages: "999",
      company_features: ["blog", "hack", "blog"],
      company_activity: "  fogászat  ",
      evil: "<script>",
    });
    expect(pruned).toEqual({ projectType: "company", company_features: ["blog"], company_activity: "fogászat" });
  });

  it("clears the recommendation answer when the visitor switches away from unsure", () => {
    const pruned = pruneAnswers({ projectType: "landing", unsure_goal: "sell", resolvedType: "webshop" });
    expect(pruned).toEqual({ projectType: "landing" });
    expect(getEffectiveProjectType(pruned)).toBe("landing");
  });
});

describe("validation helpers", () => {
  it("requires an answer for required questions only", () => {
    const pages = getQuestionById("company_pages")!;
    const activity = getQuestionById("company_activity")!;
    expect(validateAnswer(pages, undefined)).not.toBeNull();
    expect(validateAnswer(pages, "6-10")).toBeNull();
    expect(validateAnswer(activity, undefined)).toBeNull();
  });

  it("keeps exclusive options exclusive", () => {
    const question = getQuestionById("app_integrations") as ChoiceQuestion;
    expect(toggleMultiOption(question, ["maps", "crm"], "none")).toEqual(["none"]);
    expect(toggleMultiOption(question, ["none"], "maps")).toEqual(["maps"]);
    expect(toggleMultiOption(question, ["maps"], "maps")).toEqual([]);
  });

  it("detects completeness", () => {
    const answers = {
      projectType: "landing",
      landing_goal: "leads",
      landing_sections: "3-5",
      landing_copy: "ready",
      landing_leadMagnet: "no",
      landing_analytics: "no",
      landing_ads: "no",
      languages: "1",
      domain: "has",
      branding: "full",
      design: "template",
      contentUpload: "self",
      deadline: "normal",
      budget: "unsure",
    };
    expect(isComplete(answers)).toBe(true);
    expect(isComplete({ ...answers, deadline: undefined })).toBe(false);
    expect(commonQuestions.length).toBeGreaterThan(0);
  });
});
