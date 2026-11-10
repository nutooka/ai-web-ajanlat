/**
 * What PageSpeed does not tell a small business: contact, trust/legal, Google basics, measurement.
 * Pure: works on the fetched HTML (+ a few side facts), so it is fully testable.
 */

export type CheckGroup = "contact" | "trust" | "google" | "measure";
export type CheckStatus = "ok" | "warn" | "fail";

export interface Check {
  id: string;
  group: CheckGroup;
  status: CheckStatus;
  title: string;
  detail?: string;
}

export interface Preview {
  host: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  favicon: string | null;
}

export interface SiteFacts {
  platform: string | null;
  isShop: boolean;
  imagesWithoutAlt: number;
  images: number;
}

export interface Inspection {
  checks: Check[];
  preview: Preview;
  facts: SiteFacts;
}

const GENERIC_SCHEMA = new Set([
  "WebSite",
  "WebPage",
  "CollectionPage",
  "BreadcrumbList",
  "ListItem",
  "ItemList",
  "ImageObject",
  "VideoObject",
  "SearchAction",
  "EntryPoint",
  "PropertyValueSpecification",
  "ReadAction",
  "SiteNavigationElement",
  "WPHeader",
  "WPFooter",
  "Article",
  "BlogPosting",
  "NewsArticle",
  "FAQPage",
  "Question",
  "Answer",
  "Person",
  "Thing",
  "Offer",
  "AggregateOffer",
  "Product",
  "Review",
  "Rating",
  "AggregateRating",
  "HowTo",
]);

export const GROUP_LABELS: Record<CheckGroup, string> = {
  contact: "Elérhetőség és ügyfélszerzés",
  trust: "Bizalom és jogi minimum",
  google: "Google-alapok",
  measure: "Mérés",
};

const decode = (text: string) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/\s+/g, " ")
    .trim();

function meta(html: string, key: string): string {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:name|property)=["']${key}["'][^>]*content=["']([^"']*)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${key}["']`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decode(match[1]);
  }
  return "";
}

const absolute = (href: string | undefined, base: string) => {
  if (!href) return null;
  try {
    return new URL(decode(href), base).toString();
  } catch {
    return null;
  }
};

export interface InspectInput {
  html: string;
  finalUrl: string;
  /** Did http:// end up on https://? null = unknown. */
  httpRedirectsToHttps: boolean | null;
  sitemapFound: boolean | null;
  robotsTxt: string | null;
  /** Injectable for tests. */
  currentYear?: number;
}

export function inspectHtml({
  html,
  finalUrl,
  httpRedirectsToHttps,
  sitemapFound,
  robotsTxt,
  currentYear = new Date().getFullYear(),
}: InspectInput): Inspection {
  const lower = html.toLowerCase();
  const text = decode(
    lower
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " "),
  );
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((match) =>
    match[1].toLowerCase(),
  );
  const has = (pattern: RegExp) => pattern.test(lower);
  const linkTo = (pattern: RegExp) => hrefs.some((href) => pattern.test(href));
  const checks: Check[] = [];
  const add = (
    group: CheckGroup,
    id: string,
    ok: boolean,
    okTitle: string,
    badTitle: string,
    detail: string,
    bad: CheckStatus = "warn",
  ) =>
    checks.push(
      ok
        ? { id, group, status: "ok", title: okTitle }
        : { id, group, status: bad, title: badTitle, detail },
    );

  // --- Facts ---------------------------------------------------------------
  const generator = meta(html, "generator");
  const platform =
    (/wordpress/i.test(generator) || has(/wp-content\//)
      ? `WordPress${generator.match(/\d+(\.\d+)*/) ? ` ${generator.match(/\d+(\.\d+)*/)![0]}` : ""}`
      : null) ??
    (has(/cdn\.shopify\.com|shopify\.theme/) ? "Shopify" : null) ??
    (has(/static\.wixstatic\.com|wix\.com/) ? "Wix" : null) ??
    (has(/squarespace\.com/) ? "Squarespace" : null) ??
    (has(/webflow\.com|data-wf-page/) ? "Webflow" : null) ??
    (has(/joomla/i) || /joomla/i.test(generator) ? "Joomla" : null) ??
    (has(/__next|_next\/static/) ? "Next.js" : null) ??
    (generator || null);
  // Only strong shop signals: a "/cart" link or the word "kosár" alone also shows up on blogs and docs.
  const isShop = has(
    /wp-content\/plugins\/woocommerce|class="[^"]*\bwoocommerce\b|cdn\.shopify\.com|add[-_]to[-_]cart|addtocart|kosárba|adaugă în coș|adauga in cos|"@type"\s*:\s*"Product"/,
  );
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const imagesWithoutAlt = images.filter(
    (tag) => !/\balt=["'][^"']+["']/i.test(tag),
  ).length;

  // --- Contact -------------------------------------------------------------
  add(
    "contact",
    "phone",
    linkTo(/^tel:/),
    "Kattintható telefonszám",
    "Nincs kattintható telefonszám",
    "Telefonon egy érintéssel hívhatnának – most be kell gépelniük vagy kimásolniuk a számot.",
  );
  add(
    "contact",
    "chat",
    linkTo(/^mailto:|wa\.me|api\.whatsapp|m\.me\/|messenger\.com/),
    "E-mail vagy chat egy kattintással",
    "Nincs gyors e-mail- vagy chat-link",
    "Sokan inkább írnak, mint telefonálnak – egy WhatsApp- vagy e-mail-gomb több megkeresést hoz.",
  );
  add(
    "contact",
    "form",
    /<form[\s\S]*?(type=["'](?:email|tel)["']|<textarea)[\s\S]*?<\/form>/i.test(
      html,
    ),
    "Van kapcsolati űrlap",
    "Nincs kapcsolati űrlap",
    "Este 11-kor senki nem telefonál – egy űrlapon akkor is ajánlatot kérhetnek, amikor nem vagy elérhető.",
  );
  add(
    "contact",
    "location",
    linkTo(
      /google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|waze\.com/,
    ) ||
      has(/<iframe[^>]+google\.[a-z.]+\/maps|"postaladdress"|"streetaddress"/),
    "Cím vagy térkép megtalálható",
    "Nincs térkép vagy cím-link",
    "Helyi keresésnél („… a közelemben”) a Google a címet keresi – és a vevő is tudni akarja, hova menjen.",
  );
  add(
    "contact",
    "social",
    linkTo(
      /facebook\.com\/|instagram\.com\/|tiktok\.com\/|linkedin\.com\/company/,
    ),
    "Közösségi oldalak linkelve",
    "Nincsenek közösségi linkek",
    "A Facebook- és Instagram-oldal a bizalmat erősíti: látszik, hogy élő vállalkozás.",
  );

  // --- Trust & legal ---------------------------------------------------------
  const https = finalUrl.startsWith("https://");
  add(
    "trust",
    "https",
    https,
    "Biztonságos kapcsolat (HTTPS)",
    "Nincs HTTPS",
    "A böngésző „nem biztonságos” figyelmeztetést mutat – ez elriasztja a látogatókat, és a Google is hátrébb sorolja.",
    "fail",
  );
  if (https && httpRedirectsToHttps === false) {
    checks.push({
      id: "http-redirect",
      group: "trust",
      status: "warn",
      title: "A http:// cím nem irányít át a biztonságosra",
      detail: "Aki régi linken jön, a nem biztonságos változatot látja.",
    });
  }
  add(
    "trust",
    "privacy",
    has(
      /adatvédel|adatkezel|privacy|gdpr|confidențialitate|confidentialitate|prelucrarea datelor/,
    ),
    "Van adatvédelmi tájékoztató",
    "Nem található adatvédelmi tájékoztató",
    "Kapcsolati űrlap vagy mérés mellett a GDPR szerint kötelező.",
    "fail",
  );
  add(
    "trust",
    "cookies",
    has(
      /cookiebot|cookieyes|onetrust|complianz|iubenda|cookie-law-info|cookie-notice|cookieconsent|süti|sütik|cookie/,
    ),
    "Van süti-tájékoztató",
    "Nem található süti-tájékoztató",
    "Ha az oldal mér (pl. Google Analytics, Facebook-pixel), a süti-hozzájárulás kötelező.",
  );
  add(
    "trust",
    "company",
    /\bcui\b|\bcif\b|\bro ?\d{6,10}\b|\bj ?\d{1,2} ?\/ ?\d+ ?\/ ?\d{4}\b|cégjegyzék|adószám|nr\. ?reg\. ?com/.test(
      text,
    ),
    "Cégadatok feltüntetve",
    "Nem találhatók cégadatok (CUI, cégjegyzékszám)",
    "A cégadatok a bizalmat erősítik – webshopnál pedig kötelezőek.",
  );
  if (isShop) {
    add(
      "trust",
      "anpc",
      // The EU online dispute platform (SOL/ODR) closed in July 2025; the ANPC (SAL) link is what remains required.
      linkTo(/anpc\.ro/),
      "ANPC (SAL) link megvan",
      "Hiányzik az ANPC (SAL) link",
      "Romániában a webshopoknak kötelező – hiánya bírságot vonhat maga után.",
      "fail",
    );
  }
  const years = [
    ...text.matchAll(/(?:©|copyright|\(c\))\s*(?:\d{4}\s*[-–]\s*)?(20\d{2})/g),
  ].map((match) => Number(match[1]));
  if (years.length > 0 && Math.max(...years) < currentYear - 1) {
    checks.push({
      id: "copyright",
      group: "trust",
      status: "warn",
      title: `A lábléc szerint „© ${Math.max(...years)}”`,
      detail:
        "Régi évszám alapján a látogató azt hiheti, hogy a vállalkozás már nem működik.",
    });
  }

  // --- Google basics ---------------------------------------------------------
  const title = decode(
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
  );
  const description = meta(html, "description");
  const h1 = (html.match(/<h1\b/gi) ?? []).length;
  if (!title)
    checks.push({
      id: "title",
      group: "google",
      status: "fail",
      title: "Nincs oldalcím",
      detail: "A Google-találatban ez a kék, kattintható cím.",
    });
  else
    add(
      "google",
      "title",
      title.length >= 15 && title.length <= 65,
      "Jó hosszúságú oldalcím",
      title.length < 15
        ? "Túl rövid oldalcím"
        : "Túl hosszú oldalcím – a Google levágja",
      "Az ideális cím 30–60 karakter, benne a fő kulcsszó és a város.",
    );
  if (!description)
    checks.push({
      id: "description",
      group: "google",
      status: "fail",
      title: "Nincs Google-leírás",
      detail:
        "A találat alatti szürke szöveg – nélküle a Google véletlenszerű részletet mutat.",
    });
  else
    add(
      "google",
      "description",
      description.length >= 70 && description.length <= 170,
      "Jó Google-leírás",
      "A Google-leírás túl rövid vagy túl hosszú",
      "Az ideális hossz 120–160 karakter, egy hívogató mondattal.",
    );
  add(
    "google",
    "h1",
    h1 === 1,
    "Egy fő címsor (H1)",
    h1 === 0 ? "Nincs fő címsor (H1)" : `${h1} fő címsor (H1) – egy kellene`,
    "A Google a fő címsorból érti meg, miről szól az oldal.",
  );
  add(
    "google",
    "lang",
    /<html[^>]+lang=["'][a-z]/i.test(html),
    "Megadott nyelv",
    "Nincs megadva az oldal nyelve",
    "A Google és a felolvasóprogramok így tudják, milyen nyelvű az oldal.",
  );
  const noindex = /noindex/.test(meta(html, "robots").toLowerCase());
  add(
    "google",
    "indexable",
    !noindex,
    "A Google indexelheti",
    "Az oldal tiltja a Google-t (noindex)",
    "Így egyáltalán nem jelenik meg a keresőben – ez sokszor egy elfelejtett fejlesztői beállítás.",
    "fail",
  );
  if (robotsTxt !== null) {
    const blocksAll = robotsBlocksEveryone(robotsTxt);
    add(
      "google",
      "robots",
      !blocksAll,
      "A robots.txt nem tiltja a keresőket",
      "A robots.txt kitiltja a keresőket",
      "A teljes oldal el van zárva a Google elől.",
      "fail",
    );
  }
  if (sitemapFound !== null)
    add(
      "google",
      "sitemap",
      sitemapFound,
      "Van oldaltérkép (sitemap)",
      "Nincs oldaltérkép (sitemap.xml)",
      "Az oldaltérkép segít, hogy a Google minden aloldalt megtaláljon.",
    );
  const schemaTypes = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map(
    (match) => match[1],
  );
  add(
    "google",
    "schema",
    // Any business type counts (LocalBusiness has hundreds of subtypes: Bakery, Dentist…); generic page markup does not.
    schemaTypes.some((type) => !GENERIC_SCHEMA.has(type)),
    "Cégadatok jelölve a Google-nek",
    "Nincsenek cégadatok jelölve a Google-nek",
    "Ezzel jelenhet meg a nyitvatartás, a cím és az értékelés közvetlenül a keresőben.",
  );
  const ogImage = absolute(meta(html, "og:image"), finalUrl);
  add(
    "google",
    "og-image",
    Boolean(ogImage),
    "Van megosztási kép (Facebook)",
    "Facebookon kép nélkül jelenik meg a megosztott link",
    "A megosztott link így szürke, üres kártya – sokkal kevesebben kattintanak rá.",
  );
  const favicon = absolute(
    html.match(
      /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i,
    )?.[1] ??
      html.match(
        /<link[^>]+href=["']([^"']+)["'][^>]*rel=["'][^"']*icon[^"']*["']/i,
      )?.[1],
    finalUrl,
  );
  add(
    "google",
    "favicon",
    Boolean(favicon),
    "Van böngészőikon (favicon)",
    "Nincs böngészőikon (favicon)",
    "A böngészőfülön és a Google mobiltalálatában is ez a kis logó látszik.",
  );
  if (images.length > 0) {
    add(
      "google",
      "alt",
      imagesWithoutAlt === 0,
      "Minden képnek van leírása",
      `${imagesWithoutAlt} képnek nincs leírása (alt)`,
      "A Google a leírásból érti, mit ábrázol a kép – a képkeresésben is így talál meg.",
    );
  }

  // --- Measurement ---------------------------------------------------------
  add(
    "measure",
    "analytics",
    has(
      /googletagmanager\.com|google-analytics\.com|gtag\(|plausible\.io|_vercel\/insights|matomo|clarity\.ms|umami/,
    ),
    "Méri a látogatókat",
    "Nem látunk látogatómérést",
    "Ha nincs mérés (pl. Google Analytics), nem tudod, hányan jönnek, honnan, és hányan kérnek ajánlatot.",
  );
  add(
    "measure",
    "pixel",
    has(/connect\.facebook\.net|fbq\(/),
    "Facebook-pixel telepítve",
    "Nincs Facebook-pixel",
    "Facebook-hirdetésnél a pixel nélkül nem látod, hozott-e vevőt a hirdetés.",
  );

  return {
    checks,
    preview: {
      host: new URL(finalUrl).hostname,
      title,
      description,
      ogTitle: meta(html, "og:title") || title,
      ogDescription: meta(html, "og:description") || description,
      ogImage,
      favicon,
    },
    facts: { platform, isShop, imagesWithoutAlt, images: images.length },
  };
}

/** True only when the "User-agent: *" group itself says "Disallow: /" (other bots' rules do not count). */
export function robotsBlocksEveryone(robotsTxt: string): boolean {
  let groupAgents: string[] = [];
  let inRules = false;
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const match = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!match) continue;
    const field = match[1].toLowerCase();
    const value = match[2].trim();
    if (field === "user-agent") {
      if (inRules) groupAgents = [];
      inRules = false;
      groupAgents.push(value);
    } else if (field === "allow" || field === "disallow") {
      inRules = true;
      if (field === "disallow" && value === "/" && groupAgents.includes("*")) return true;
    }
  }
  return false;
}
