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
      parts.push(`Egy Shopify-alapú ${typeName} készül${products}; a kínálat mérete: ${label(answers, "shop_count")}.`);
      if (Array.isArray(answers.shop_payments) && answers.shop_payments.includes("card")) parts.push("A vásárlók online, bankkártyával is fizethetnek.");
      if (answers.shop_courier === "yes") parts.push("A csomagokat futárszolgálat viszi ki.");
      if (answers.shop_current === "migrate") parts.push("A meglévő webshop adatait átköltöztetjük.");
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

  if (projectType === "webshop") {
    // The webshop asks its own language and design questions.
    const shopLanguages = answers.shop_languages === "2" || answers.shop_languages === "3+" ? ` ${label(answers, "shop_languages")},` : "";
    const look: Record<string, string> = {
      theme: "a márkádra szabott profi Shopify-témával",
      layouts: "egyedi oldalelrendezésekkel bővített témával",
      custom: "teljesen egyedi designnal",
    };
    const design = look[String(answers.shop_design)] ?? look.theme;
    parts.push(`A bolt${shopLanguages} ${design}, ${label(answers, "deadline")} ütemezéssel készül.`);
    return parts.join(" ");
  }
  const languages = answers.languages === "1" || answers.languages === undefined ? "" : ` ${label(answers, "languages")},`;
  parts.push(`Az oldal${languages} ${label(answers, "design")} megoldással, ${label(answers, "deadline")} ütemezéssel készül.`);
  return parts.join(" ");
}

export function recommendTechnology(answers: Answers, projectType: ResolvedProjectType): TechRecommendation {
  switch (projectType) {
    case "webshop":
      return {
        title: "Shopify-webáruház",
        description:
          "Megbízható, könnyen kezelhető Shopify bolt profi témával és bevált appokkal – a rendeléseket, készletet és termékeket egy helyen kezeled, programozói tudás nélkül.",
        stack: ["Shopify", "Shopify-téma", "Shopify Payments", "Futár- és számlázó-appok"],
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
