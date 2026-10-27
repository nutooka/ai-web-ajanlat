import type { Answers, Question } from "../types";

/** Project type after the "not sure" step is resolved (kept local to avoid an import cycle). */
const effectiveType = (answers: Answers) => (answers.projectType === "unsure" ? answers.resolvedType : answers.projectType) as string | undefined;

/** Asked once, after every branch, so no branch repeats them. */
export const commonQuestions: Question[] = [
  {
    id: "languages",
    kind: "single",
    required: true,
    title: "Hány nyelven jelenjen meg az oldal?",
    options: [
      { id: "1", label: "Egy nyelven", icon: "language" },
      { id: "2", label: "Két nyelven", description: "Pl. magyar és román", icon: "language" },
      { id: "3+", label: "Három vagy több nyelven", icon: "public" },
    ],
  },
  {
    id: "domain",
    kind: "single",
    required: true,
    // An existing website means an existing domain.
    showIf: (answers) => effectiveType(answers) !== "redesign" && answers.unsure_hasSite !== "yes",
    title: "Van már domain neved?",
    hint: "A domain a weboldal címe, pl. cegnev.ro.",
    options: [
      { id: "has", label: "Igen, van", icon: "check" },
      { id: "need", label: "Még nincs", description: "Segítünk kiválasztani és regisztrálni", icon: "public" },
    ],
  },
  {
    id: "branding",
    kind: "single",
    required: true,
    // Redesign: "keep the logo" already answers this.
    showIf: (answers) => !(Array.isArray(answers.redesign_keep) && answers.redesign_keep.includes("logo")),
    title: "Van már arculatod és logód?",
    options: [
      { id: "full", label: "Igen, teljes arculat", description: "Logó, színek, betűtípusok", icon: "palette" },
      { id: "logo_only", label: "Csak logó van", icon: "brush" },
      { id: "none", label: "Még nincs", description: "Ebben is segítünk", icon: "auto" },
    ],
  },
  {
    id: "design",
    kind: "single",
    required: true,
    title: "Milyen designt szeretnél?",
    hint: "Az egyedi design drágább, de jobban megkülönböztet a versenytársaktól.",
    options: [
      { id: "template", label: "Sablonalapú", description: "Gyors és költséghatékony", icon: "layers" },
      { id: "tailored", label: "Testreszabott", description: "Sablonból kiindulva, a márkádra szabva", icon: "brush" },
      { id: "custom", label: "Teljesen egyedi", description: "Nulláról, csak neked tervezve", icon: "star" },
    ],
  },
  {
    id: "contentUpload",
    kind: "single",
    required: true,
    // Web apps have no content pages; company and landing pages already ask about their texts.
    showIf: (answers) => !["webapp", "company", "landing"].includes(effectiveType(answers) ?? ""),
    title: "Ki tölti fel az oldalak tartalmát?",
    options: [
      { id: "self", label: "Én magam", description: "Könnyen szerkeszthető rendszert kapsz", icon: "person" },
      { id: "assisted", label: "Ti, az általam adott anyagból", icon: "upload" },
      { id: "full", label: "Ti, képszerkesztéssel és optimalizálással", icon: "auto" },
    ],
  },
  {
    id: "deadline",
    kind: "single",
    required: true,
    title: "Milyen határidővel szeretnéd elkészíttetni?",
    options: [
      { id: "flexible", label: "Rugalmas", description: "Nem sürgős – ezt jutalmazzuk", icon: "schedule" },
      { id: "normal", label: "Normál", description: "Szokásos ütemezés", icon: "calendar" },
      { id: "fast", label: "Gyors", description: "Prioritást kap a projekt", icon: "bolt" },
      { id: "urgent", label: "Sürgős", description: "Minden más elé kerül", icon: "flash" },
    ],
  },
  {
    id: "budget",
    kind: "single",
    required: true,
    title: "Mekkora keretben gondolkodsz?",
    hint: "Nem a kereted alapján árazunk – csak segít a megfelelő csomagot ajánlani.",
    options: [
      { id: "under5k", label: "5 000 RON alatt", icon: "cash" },
      { id: "5-10k", label: "5 000 – 10 000 RON", icon: "cash" },
      { id: "10-20k", label: "10 000 – 20 000 RON", icon: "payments" },
      { id: "20-40k", label: "20 000 – 40 000 RON", icon: "payments" },
      { id: "40k+", label: "40 000 RON felett", icon: "trend" },
      { id: "unsure", label: "Még nem tudom", icon: "question" },
    ],
  },
  {
    id: "notes",
    kind: "text",
    required: false,
    maxLength: 2000,
    multiline: true,
    title: "Van még valami, amit tudnunk kell?",
    subtitle: "Egy weboldal, ami tetszik, egy ötlet vagy kérés. Ki is hagyhatod.",
    placeholder: "Pl. tetszik a www.pelda.ro letisztultsága; fontos, hogy a szezon kezdetére elkészüljön…",
  },
];
