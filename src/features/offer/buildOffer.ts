import { calculateQuote, type QuoteOptions } from "@/features/pricing/engine";
import { pricingConfig } from "@/config/pricing";
import { PACKAGE_IDS, type PackageId, type Quote } from "@/features/pricing/types";
import { getAnswerLabel, getVisibleQuestions, pruneAnswers } from "@/features/questionnaire/engine";
import type { Answers, ResolvedProjectType } from "@/features/questionnaire/types";
import { recommendTechnology, summarizeProject } from "@/lib/ai/ruleBased";
import type { TechRecommendation } from "@/lib/ai/types";

export const OFFER_DISCLAIMER =
  "Az ár tájékoztató jellegű, nem minősül hivatalos ajánlattételnek. A végleges ajánlat személyes egyeztetés után készül.";

export const PROJECT_TYPE_LABELS: Record<ResolvedProjectType, string> = {
  company: "Bemutatkozó / céges weboldal",
  webshop: "Webshop",
  webapp: "Egyedi webalkalmazás",
  landing: "Landing page",
  redesign: "Weboldal-felújítás",
};

export interface AnswerRow {
  questionId: string;
  question: string;
  answer: string;
}

export interface Offer {
  projectType: ResolvedProjectType;
  projectTypeLabel: string;
  summary: string;
  tech: TechRecommendation;
  selectedFeatures: string[];
  quote: Quote;
  includes: Record<PackageId, string[]>;
  excludes: Record<PackageId, string[]>;
  nextSteps: string[];
  disclaimer: string;
  answerRows: AnswerRow[];
}

const ALWAYS_INCLUDED = [
  "Reszponzív, mobilra optimalizált megjelenés",
  "SSL-tanúsítvány és biztonságos beállítások",
  "Technikai SEO-alapok (meta adatok, sitemap, gyors betöltés)",
  "GDPR-kompatibilis süti-tájékoztató",
  "Betanítás a tartalom kezeléséhez",
  "30 nap garanciális hibajavítás az átadás után",
];

const ALWAYS_EXCLUDED = [
  "Harmadik féltől származó díjak (fizetési szolgáltató jutaléka, számlázóprogram, futárszolgálat előfizetése)",
  "Fizetős képek, betűtípusok, bővítmények licencdíja",
  "Hirdetési költségkeret és marketingkampányok kezelése",
  "Az egyeztetett terjedelmen túli új funkciók",
];

function buildIncludes(quote: Quote, packageId: PackageId): string[] {
  const pkg = quote.packages[packageId];
  const premiumExtras = pkg.items.filter((item) => item.source === "premium").map((item) => item.label);
  return [pkg.design.label, ...ALWAYS_INCLUDED, ...premiumExtras];
}

function buildExcludes(quote: Quote, packageId: PackageId, answers: Answers): string[] {
  const included = new Set(quote.packages[packageId].items.map((item) => item.id));
  const missingSelections = quote.packages.standard.items
    .filter((item) => item.source === "answer" && !included.has(item.id))
    .map((item) => `${item.label} (a Standard csomagban elérhető)`);

  const contextual: string[] = [];
  if (answers.contentUpload === "self" || answers.contentUpload === undefined) contextual.push("Tartalomfeltöltés (te töltöd fel, mi megmutatjuk, hogyan)");
  if (answers.company_content === "ready") contextual.push("Szövegírás");
  if (answers.shop_productUpload === "self") contextual.push("Termékfeltöltés");

  return [...missingSelections, ...contextual, ...ALWAYS_EXCLUDED];
}

const NEXT_STEPS = [
  "Elküldöd az ajánlatot – 1 munkanapon belül jelentkezünk.",
  "30 perces ingyenes online egyeztetés a részletekről.",
  "Végleges, fix áras ajánlat és ütemterv.",
  "Szerződés, előleg, és indulhat a munka.",
];

/** Everything the offer page and the e-mails need. Returns null for incomplete answers. */
export function buildOffer(rawAnswers: Answers, options: QuoteOptions = {}): Offer | null {
  const answers = pruneAnswers(rawAnswers);
  const quote = calculateQuote(answers, pricingConfig, options);
  if (!quote) return null;

  const answerRows: AnswerRow[] = getVisibleQuestions(answers)
    .filter((question) => answers[question.id] !== undefined)
    .map((question) => ({ questionId: question.id, question: question.title, answer: getAnswerLabel(question, answers[question.id]) }));

  return {
    projectType: quote.projectType,
    projectTypeLabel: PROJECT_TYPE_LABELS[quote.projectType],
    summary: summarizeProject(answers, quote.projectType),
    tech: recommendTechnology(answers, quote.projectType),
    selectedFeatures: quote.packages.standard.items.filter((item) => item.source === "answer").map((item) => item.label),
    quote,
    includes: Object.fromEntries(PACKAGE_IDS.map((id) => [id, buildIncludes(quote, id)])) as Record<PackageId, string[]>,
    excludes: Object.fromEntries(PACKAGE_IDS.map((id) => [id, buildExcludes(quote, id, answers)])) as Record<PackageId, string[]>,
    nextSteps: NEXT_STEPS,
    disclaimer: OFFER_DISCLAIMER,
    answerRows,
  };
}
