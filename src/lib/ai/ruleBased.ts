import { getAnswerLabel, getQuestionById } from "@/features/questionnaire/engine";
import type { Answers, ResolvedProjectType } from "@/features/questionnaire/types";
import type { InsightProvider, TechRecommendation } from "./types";

const TYPE_NAMES: Record<ResolvedProjectType, string> = {
  company: "bemutatkozó céges weboldal",
  webshop: "webshop",
  webapp: "egyedi webalkalmazás",
  landing: "landing page",
  redesign: "meglévő weboldal megújítása",
};

const label = (answers: Answers, questionId: string) => {
  const question = getQuestionById(questionId);
  return question ? getAnswerLabel(question, answers[questionId]).toLowerCase() : "";
};

/** Synchronous, deterministic project summary built from the answers. */
export function summarizeProject(answers: Answers, projectType: ResolvedProjectType): string {
  const parts: string[] = [];
  const typeName = TYPE_NAMES[projectType];

  switch (projectType) {
    case "company": {
      const activity = typeof answers.company_activity === "string" ? ` (${answers.company_activity})` : "";
      parts.push(`Egy ${label(answers, "company_pages")} terjedelmű ${typeName} készül a vállalkozásod${activity} számára.`);
      if (answers.company_goal) parts.push(`A legfontosabb cél: ${label(answers, "company_goal")}.`);
      break;
    }
    case "webshop": {
      const products = typeof answers.shop_products === "string" ? `, amelyben ${answers.shop_products} kerülnek értékesítésre` : "";
      parts.push(`Egy ${typeName} készül${products}; a kínálat mérete: ${label(answers, "shop_count")} termék.`);
      if (answers.shop_onlinePayment === "yes") parts.push("A vásárlók online, bankkártyával is fizethetnek.");
      if (answers.shop_current === "existing") parts.push("A meglévő webshop adatait átköltöztetjük.");
      break;
    }
    case "webapp": {
      const goal = typeof answers.app_goal === "string" ? ` Cél: ${answers.app_goal}` : "";
      parts.push(`Egy ${typeName} készül, amelyet elsősorban ${label(answers, "app_users")} használnak.${goal}`);
      if (answers.app_phase === "mvp") parts.push("Első lépésként egy gyorsan élesíthető MVP készül, amelyet a visszajelzések alapján bővítünk.");
      break;
    }
    case "landing":
      parts.push(`Egy konverzióra optimalizált ${typeName} készül, fő célja: ${label(answers, "landing_goal")}.`);
      break;
    case "redesign": {
      const url = typeof answers.redesign_url === "string" ? ` (${answers.redesign_url})` : "";
      parts.push(`A jelenlegi weboldal${url} megújítása, a fő problémák: ${label(answers, "redesign_problems")}.`);
      break;
    }
  }

  const languages = answers.languages === "1" || answers.languages === undefined ? "" : ` ${label(answers, "languages")},`;
  parts.push(`Az oldal${languages} ${label(answers, "design")} megoldással, ${label(answers, "deadline")} ütemezéssel készül.`);
  return parts.join(" ");
}

export function recommendTechnology(answers: Answers, projectType: ResolvedProjectType): TechRecommendation {
  switch (projectType) {
    case "webshop":
      return {
        title: "Gyors, skálázható webáruház",
        description:
          answers.shop_count === "1000+"
            ? "Nagy katalógushoz headless megoldást javaslunk: villámgyors kirakat, erős termékkezelő háttérrel."
            : "Modern, gyors kirakat és könnyen kezelhető termékadmin – webshop-motor és kirakat összehangolva.",
        stack: ["Next.js", "Shopify / WooCommerce (headless)", "Stripe vagy Netopia", "Vercel"],
      };
    case "webapp":
      return {
        title: "Egyedi, biztonságos webalkalmazás",
        description: "Típusbiztos, tesztelt kódbázis, amely együtt nő a vállalkozásoddal.",
        stack: [
          "Next.js + TypeScript",
          ...(answers.app_database === "no" ? [] : ["PostgreSQL"]),
          ...(answers.app_auth === "yes" ? ["Biztonságos hitelesítés"] : []),
          ...(answers.app_payment && answers.app_payment !== "none" ? ["Stripe"] : []),
          "Vercel",
        ],
      };
    case "landing":
      return {
        title: "Villámgyors, mérhető landing page",
        description: "Statikusan generált oldal, kiváló betöltési sebességgel és konverziómérésre előkészítve.",
        stack: ["Next.js", "Vercel", ...(answers.landing_analytics === "yes" ? ["GA4 + A/B tesztelés"] : ["Analitika"])],
      };
    default:
      return {
        title: "Modern, könnyen szerkeszthető weboldal",
        description: "Gyors, SEO-barát oldal, amelynek tartalmát programozói tudás nélkül is frissítheted.",
        stack: ["Next.js", "Headless CMS (pl. Sanity)", "Vercel"],
      };
  }
}

/** Default provider: no network calls, no AI. */
export const ruleBasedProvider: InsightProvider = {
  async interpretFreeText() {
    return [];
  },
  async findMissingInfo(answers) {
    const missing: string[] = [];
    if (answers.projectType === "company" && !answers.company_activity) missing.push("A vállalkozás tevékenysége");
    if (answers.projectType === "webapp" && !answers.app_goal) missing.push("A webalkalmazás fő célja");
    return missing;
  },
  async suggestFollowUps() {
    return [];
  },
  async writeSummary(answers, projectType) {
    return summarizeProject(answers, projectType);
  },
  async recommendTech(answers, projectType) {
    return recommendTechnology(answers, projectType);
  },
};
