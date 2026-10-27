import type { PricingConfig } from "@/features/pricing/types";

/**
 * ⚙️ MINDEN ÁR ITT ÁLLÍTHATÓ.
 * Az összegek nettó RON-ban, az órák munkaórában értendők.
 * A kulcsok a kérdőív kérdés- és opcióazonosítói (src/features/questionnaire/config).
 */
export const pricingConfig: PricingConfig = {
  currency: "RON",
  hourlyRate: 160,
  roundTo: 50,
  weeklyCapacityHours: 25,
  // BELSŐ: AI-asszisztált fejlesztési szorzó. Az alábbi órák "hagyományos" becslések,
  // ezzel a szorzóval lesznek a ténylegesen számlázott órák. Az ügyfél nem látja.
  productivityFactor: 0.3,
  feedbackWeeks: 1,

  packages: {
    basic: { name: "Basic", tagline: "Az alapok, kedvezőbb áron" },
    standard: { name: "Standard", tagline: "Pontosan az, amit kértél" },
    premium: { name: "Premium", tagline: "Egyedi design és kiemelt szolgáltatások" },
  },

  baseItems: {
    company: [
      { id: "base.planning", label: "Konzultáció és oldaltérkép", hours: 3, category: "planning", essential: true },
      { id: "base.design", label: "UI design (főoldal + aloldal-sablonok)", hours: 8, category: "design", essential: true },
      { id: "base.dev", label: "Reszponzív fejlesztés (5 oldalig)", hours: 11, category: "development", essential: true },
      { id: "base.cms", label: "Tartalomkezelő rendszer beállítása", hours: 4, category: "backend", essential: true },
      { id: "base.launch", label: "Tesztelés, alap SEO, élesítés", hours: 4, category: "quality", essential: true },
    ],
    webshop: [
      { id: "base.planning", label: "Konzultáció, webshop-struktúra", hours: 5, category: "planning", essential: true },
      { id: "base.design", label: "UI design (főoldal, kategória, termék, kosár)", hours: 12, category: "design", essential: true },
      { id: "base.dev", label: "Reszponzív frontend fejlesztés", hours: 19, category: "development", essential: true },
      { id: "base.engine", label: "Webshop-motor: kosár, rendelés, e-mail értesítők", hours: 16, category: "backend", essential: true },
      { id: "base.legal", label: "Jogi oldalak (ÁSZF, GDPR, ANPC), tesztelés, élesítés", hours: 6, category: "quality", essential: true },
    ],
    webapp: [
      { id: "base.planning", label: "Követelményfeltárás és specifikáció", hours: 10, category: "planning", essential: true },
      { id: "base.design", label: "UX/UI tervezés", hours: 16, category: "design", essential: true },
      { id: "base.dev", label: "Frontend fejlesztés", hours: 28, category: "development", essential: true },
      { id: "base.backend", label: "Backend architektúra és alapok", hours: 22, category: "backend", essential: true },
      { id: "base.launch", label: "Tesztelés, dokumentáció, élesítés", hours: 8, category: "quality", essential: true },
    ],
    landing: [
      { id: "base.planning", label: "Üzenet- és konverziótervezés", hours: 2, category: "planning", essential: true },
      { id: "base.design", label: "Landing page design", hours: 5, category: "design", essential: true },
      { id: "base.dev", label: "Reszponzív fejlesztés (5 szekcióig)", hours: 6, category: "development", essential: true },
      { id: "base.launch", label: "Tesztelés, mérőkódok, élesítés", hours: 2, category: "quality", essential: true },
    ],
    redesign: [
      { id: "base.audit", label: "Jelenlegi oldal auditja és tervezés", hours: 5, category: "planning", essential: true },
      { id: "base.design", label: "Új UI design", hours: 8, category: "design", essential: true },
      { id: "base.dev", label: "Reszponzív fejlesztés (5 oldalig)", hours: 9, category: "development", essential: true },
      { id: "base.launch", label: "Átirányítások, tesztelés, élesítés", hours: 4, category: "quality", essential: true },
    ],
  },

  answerItems: {
    // Céges weboldal
    company_pages: {
      "6-10": { label: "További oldalak (6–10)", hours: 14, category: "development", essential: true },
      "11-20": { label: "További oldalak (11–20)", hours: 30, category: "development", essential: true },
      "20+": { label: "További oldalak (20+)", hours: 52, category: "development", essential: true },
    },
    company_features: {
      contact_form: { label: "Kapcsolati űrlap spamvédelemmel", hours: 3, category: "development", essential: true },
      blog: { label: "Blog / hírek modul", hours: 10, category: "development", essential: false },
      gallery: { label: "Galéria / portfólió", hours: 5, category: "development", essential: false },
      testimonials: { label: "Vélemények, referenciák szekció", hours: 3, category: "development", essential: false },
      booking: { label: "Online időpontfoglalás", hours: 12, category: "integration", essential: false },
      faq: { label: "GYIK szekció", hours: 2, category: "development", essential: false },
      map: { label: "Térkép és elérhetőség", hours: 1, category: "development", essential: true },
      newsletter: { label: "Hírlevél-feliratkozás integráció", hours: 4, category: "integration", essential: false },
      pricing: { label: "Árlista / csomagok oldal", hours: 3, category: "development", essential: true },
      team: { label: "Csapatbemutató szekció", hours: 2, category: "development", essential: false },
      reviews: { label: "Google-értékelések beépítése", hours: 3, category: "integration", essential: false },
      social: { label: "Közösségimédia-hírfolyam", hours: 3, category: "integration", essential: false },
      chat: { label: "WhatsApp / Messenger gomb", hours: 1, category: "integration", essential: true },
      downloads: { label: "Letölthető dokumentumok", hours: 2, category: "development", essential: false },
      careers: { label: "Állásajánlatok és jelentkezés", hours: 6, category: "development", essential: false },
    },
    company_content: {
      partial: { label: "Szövegírási segítség", hours: 6, category: "content", essential: false },
      needs_copy: { label: "Teljes szövegírás", hours: 16, category: "content", essential: false },
    },
    company_seo: {
      advanced: { label: "Kiemelt SEO (kulcsszókutatás, on-page optimalizálás)", hours: 14, category: "content", essential: false },
    },

    // Webshop
    shop_current: {
      existing: { label: "Költözés a régi webshopból (termékek, vásárlók)", hours: 10, category: "content", essential: true },
    },
    shop_accounts: {
      optional: { label: "Vásárlói fiók (opcionális regisztráció)", hours: 4, category: "backend", essential: true },
      required: { label: "Kötelező vásárlói fiók, zárt bolt", hours: 6, category: "backend", essential: true },
    },
    shop_wholesale: {
      yes: { label: "Viszonteladói / nagykereskedelmi árak", hours: 10, category: "backend", essential: false },
    },
    shop_promotions: {
      sale_prices: { label: "Akciós árak", hours: 2, category: "backend", essential: true },
      coupons: { label: "Kuponkódok", hours: 4, category: "backend", essential: false },
      volume: { label: "Mennyiségi kedvezmény", hours: 4, category: "backend", essential: false },
      loyalty: { label: "Hűségpont-rendszer", hours: 12, category: "backend", essential: false },
    },
    shop_marketing: {
      reviews: { label: "Termékértékelések", hours: 4, category: "development", essential: false },
      newsletter: { label: "Hírlevél-integráció", hours: 4, category: "integration", essential: false },
      abandoned_cart: { label: "Elhagyott kosár e-mail", hours: 5, category: "integration", essential: false },
      related: { label: "Kapcsolódó termékek ajánlása", hours: 3, category: "development", essential: false },
    },
    shop_count: {
      "51-200": { label: "Kategóriarendszer és szűrők (51–200 termék)", hours: 6, category: "backend", essential: true },
      "201-1000": { label: "Kategóriák, szűrők, tömeges import (201–1000 termék)", hours: 14, category: "backend", essential: true },
      "1000+": { label: "Nagy katalógus: import, keresés, szűrők (1000+ termék)", hours: 26, category: "backend", essential: true },
    },
    shop_variants: {
      yes: { label: "Termékváltozatok (méret, szín, kiszerelés)", hours: 10, category: "backend", essential: true },
    },
    shop_onlinePayment: {
      yes: { label: "Online bankkártyás fizetés integráció", hours: 12, category: "integration", essential: true },
    },
    shop_cod: {
      yes: { label: "Utánvétes fizetés", hours: 2, category: "backend", essential: true },
    },
    shop_shipping: {
      courier: { label: "Futárszolgálat integráció", hours: 6, category: "integration", essential: true },
      locker: { label: "Csomagautomata integráció", hours: 6, category: "integration", essential: true },
      pickup: { label: "Személyes átvétel", hours: 1, category: "backend", essential: true },
      international: { label: "Nemzetközi szállítás, zónák és díjak", hours: 10, category: "integration", essential: false },
    },
    shop_inventory: {
      yes: { label: "Készletkezelés", hours: 8, category: "backend", essential: false },
    },
    shop_invoicing: {
      yes: { label: "Számlázó-integráció (SmartBill / Oblio / FGO)", hours: 12, category: "integration", essential: false },
    },

    // Webalkalmazás
    app_users: {
      customers: { label: "Ügyfél-hozzáférés, meghívásos fiókok", hours: 8, category: "backend", essential: true },
      public: { label: "Nyilvános regisztráció, biztonsági megerősítés", hours: 16, category: "backend", essential: true },
    },
    app_scale: {
      medium: { label: "Teljesítmény-optimalizálás (50–1000 felhasználó)", hours: 6, category: "backend", essential: true },
      large: { label: "Skálázható architektúra (1000+ felhasználó)", hours: 18, category: "backend", essential: true },
    },
    app_platform: {
      responsive: { label: "Teljesen mobilbarát felület", hours: 10, category: "development", essential: true },
      pwa: { label: "Telepíthető alkalmazás (PWA)", hours: 18, category: "development", essential: false },
    },
    app_migration: {
      excel: { label: "Adatimport Excelből / CSV-ből", hours: 8, category: "backend", essential: true },
      system: { label: "Adatmigráció meglévő rendszerből", hours: 20, category: "backend", essential: true },
    },
    app_security: {
      two_factor: { label: "Kétlépcsős azonosítás", hours: 8, category: "backend", essential: false },
      audit_log: { label: "Tevékenységnapló", hours: 10, category: "backend", essential: false },
      gdpr_export: { label: "GDPR-adatexport és -törlés", hours: 6, category: "backend", essential: false },
      sensitive: { label: "Érzékeny adatok védelme (titkosítás, hozzáférés)", hours: 16, category: "backend", essential: true },
    },
    app_auth: {
      yes: { label: "Bejelentkezés és fiókkezelés", hours: 24, category: "backend", essential: true },
    },
    app_roles: {
      "2-3": { label: "Jogosultságkezelés (2–3 szerepkör)", hours: 10, category: "backend", essential: true },
      "4+": { label: "Összetett jogosultságkezelés (4+ szerepkör)", hours: 22, category: "backend", essential: true },
    },
    app_admin: {
      yes: { label: "Adminfelület", hours: 30, category: "development", essential: true },
    },
    app_database: {
      yes: { label: "Adatbázis-tervezés és -kezelés", hours: 16, category: "backend", essential: true },
      unsure: { label: "Adatmodell-felmérés", hours: 8, category: "planning", essential: true },
    },
    app_payment: {
      one_time: { label: "Online fizetés (egyszeri)", hours: 16, category: "integration", essential: true },
      subscription: { label: "Előfizetéses fizetés és számlázás", hours: 32, category: "integration", essential: true },
    },
    app_integrations: {
      email_sms: { label: "E-mail / SMS értesítő integráció", hours: 8, category: "integration", essential: true },
      maps: { label: "Térkép és helymeghatározás", hours: 8, category: "integration", essential: true },
      accounting: { label: "Számlázó / könyvelő integráció", hours: 14, category: "integration", essential: true },
      crm: { label: "CRM / ERP integráció", hours: 20, category: "integration", essential: true },
      ai: { label: "AI-funkciók integrációja", hours: 20, category: "integration", essential: false },
      other_api: { label: "Egyéb külső API integráció", hours: 14, category: "integration", essential: true },
    },
    app_features: {
      dashboard: { label: "Áttekintő dashboard", hours: 16, category: "development", essential: true },
      file_upload: { label: "Fájlfeltöltés és -kezelés", hours: 10, category: "backend", essential: true },
      notifications: { label: "Értesítési rendszer", hours: 10, category: "backend", essential: false },
      reports: { label: "Riportok és exportálás", hours: 14, category: "development", essential: false },
      search: { label: "Keresés és szűrés", hours: 10, category: "development", essential: true },
      calendar: { label: "Naptár és foglalások", hours: 16, category: "development", essential: true },
    },

    // Landing page
    landing_sections: {
      "6-8": { label: "További szekciók (6–8)", hours: 6, category: "development", essential: true },
      "9+": { label: "További szekciók (9+)", hours: 14, category: "development", essential: true },
    },
    landing_copy: {
      partial: { label: "Szöveg csiszolása, konverziós átírás", hours: 4, category: "content", essential: false },
      needs_copy: { label: "Konverziós szövegírás", hours: 8, category: "content", essential: false },
    },
    landing_visuals: {
      stock: { label: "Stockfotók válogatása", hours: 2, category: "design", essential: false },
      illustrations: { label: "Egyedi illusztrációk", hours: 10, category: "design", essential: false },
      video: { label: "Videó beágyazása", hours: 1, category: "development", essential: true },
      animations: { label: "Görgetési animációk", hours: 6, category: "development", essential: false },
    },
    landing_leadMagnet: {
      yes: { label: "Letölthető anyag automatikus kiküldéssel", hours: 4, category: "integration", essential: false },
    },
    landing_forms: {
      form: { label: "Jelentkezési / kapcsolati űrlap", hours: 3, category: "development", essential: true },
      newsletter: { label: "Hírlevélrendszer-integráció", hours: 4, category: "integration", essential: false },
      booking: { label: "Időpontfoglalás-integráció", hours: 6, category: "integration", essential: false },
    },
    landing_analytics: {
      yes: { label: "Konverziómérés és A/B tesztelés", hours: 8, category: "integration", essential: false },
    },
    landing_ads: {
      yes: { label: "Hirdetési követőkódok (Meta, Google Ads)", hours: 4, category: "integration", essential: false },
    },

    // Felújítás
    redesign_problems: {
      slow: { label: "Sebességoptimalizálás", hours: 6, category: "quality", essential: true },
      hard_to_edit: { label: "Könnyen szerkeszthető tartalomkezelő", hours: 6, category: "backend", essential: true },
      low_conversion: { label: "Konverzióoptimalizálás (CTA-k, űrlapok)", hours: 6, category: "design", essential: false },
    },
    redesign_platform: {
      builder: { label: "Kiköltözés oldalépítő rendszerből", hours: 4, category: "development", essential: true },
      unknown: { label: "Technikai felmérés", hours: 2, category: "planning", essential: true },
    },
    redesign_seo: {
      yes: { label: "SEO-megőrzés: átirányítási terv, helyezéskövetés", hours: 6, category: "quality", essential: true },
    },
    redesign_migration: {
      all: { label: "Teljes tartalommigráció", hours: 12, category: "content", essential: false },
      partial: { label: "Részleges tartalommigráció", hours: 6, category: "content", essential: false },
    },
    redesign_pages: {
      "6-10": { label: "További oldalak (6–10)", hours: 14, category: "development", essential: true },
      "11-20": { label: "További oldalak (11–20)", hours: 30, category: "development", essential: true },
      "20+": { label: "További oldalak (20+)", hours: 52, category: "development", essential: true },
    },
    redesign_newFeatures: {
      contact_form: { label: "Kapcsolati űrlap spamvédelemmel", hours: 3, category: "development", essential: true },
      blog: { label: "Blog / hírek modul", hours: 10, category: "development", essential: false },
      gallery: { label: "Galéria / portfólió", hours: 5, category: "development", essential: false },
      booking: { label: "Online időpontfoglalás", hours: 12, category: "integration", essential: false },
      newsletter: { label: "Hírlevél-feliratkozás integráció", hours: 4, category: "integration", essential: false },
    },

    // Közös kérdések
    domain: {
      need: { label: "Domain kiválasztása, regisztrációja és beállítása", hours: 1, category: "planning", essential: true },
    },
    branding: {
      logo_only: { label: "Arculati elemek kiegészítése", hours: 4, category: "branding", essential: true },
      none: { label: "Alap arculat (logó, színpaletta, tipográfia)", hours: 14, category: "branding", essential: false },
    },
    contentUpload: {
      assisted: { label: "Tartalomfeltöltés a kapott anyagokból", hours: 6, category: "content", essential: false },
      full: { label: "Tartalomfeltöltés képszerkesztéssel, optimalizálással", hours: 14, category: "content", essential: false },
    },
  },

  productUpload: {
    label: "Termékfeltöltés (képek, leírások)",
    category: "content",
    essential: false,
    hoursByCount: { upto50: 6, "51-200": 16, "201-1000": 40, "1000+": 80 },
  },

  design: {
    multipliers: { template: 1, tailored: 1.3, custom: 1.7 },
    labels: { template: "Sablonalapú design", tailored: "Testreszabott design", custom: "Teljesen egyedi design" },
    basic: "template",
    premium: "custom",
  },

  languages: {
    extraByAnswer: { "1": 0, "2": 1, "3+": 2 },
    multiplierPerExtra: 0.2,
    setupHoursPerExtra: 4,
  },

  urgency: {
    flexible: { label: "Rugalmas határidő", priceMultiplier: 0.95, timeMultiplier: 1.3 },
    normal: { label: "Normál határidő", priceMultiplier: 1, timeMultiplier: 1 },
    fast: { label: "Gyorsított határidő", priceMultiplier: 1.2, timeMultiplier: 0.75 },
    urgent: { label: "Sürgős határidő", priceMultiplier: 1.4, timeMultiplier: 0.6 },
  },

  // Határidő-csúszka: minél több időt adsz, annál olcsóbb (a normál ütemezéshez képest).
  flexibility: {
    fastestRatio: 0.6, // leggyorsabb: a normál idő 60%-a
    maxMultiplier: 1.4, // ...+40% áron
    relaxedRatio: 2.5, // a normál idő 2,5-szereséig nő a kedvezmény
    minMultiplier: 0.8, // ...legfeljebb −20%
    maxWeeks: 26,
  },

  // Extrák: a fromPackage: "standard" tételek már a Standardban is benne vannak, a többi csak Premiumban.
  premiumExtras: [
    { id: "premium.seo", label: "Kiemelt SEO-csomag", hours: 12, category: "content", essential: false, skipIfSelected: ["company_seo.advanced"] },
    { id: "premium.analytics", label: "Analitika és konverziómérés (GA4)", hours: 6, fromPackage: "standard", category: "integration", essential: false, skipIfSelected: ["landing_analytics.yes"] },
    { id: "premium.performance", label: "Teljesítmény-finomhangolás (Core Web Vitals)", hours: 6, fromPackage: "standard", category: "quality", essential: false, skipIfSelected: ["redesign_problems.slow"] },
    { id: "premium.qa", label: "Bővített tesztelés (eszközök, akadálymentesség)", hours: 6, category: "quality", essential: false },
    { id: "premium.support", label: "3 hónap kiemelt támogatás és apró módosítások", hours: 10, category: "quality", essential: false },
  ],

  premiumExtrasScale: { landing: 0.4, company: 0.7, redesign: 0.7, webshop: 1, webapp: 1.2 },

  budgetCeilings: {
    under5k: 5000,
    "5-10k": 10000,
    "10-20k": 20000,
    "20-40k": 40000,
    "40k+": null,
  },

  discounts: {
    // Indulási kedvezmény: kapcsold ki (enabled: false), vagy csökkentsd, ha már nem kell.
    // Gyors döntés kedvezmény: az ajánlat első megnyitásától számítva.
    // 2 óra után teljes ár. A szerver ellenőrzi (aláírt cookie), így nem lehet visszaállítani az órát.
    quickDecision: {
      enabled: true,
      label: "Gyors döntés kedvezmény",
      tiers: [
        { withinMinutes: 60, percent: 25 },
        { withinMinutes: 120, percent: 15 },
      ],
    },
    perPackage: {
      standard: { enabled: true, percent: 5, label: "Standard csomag extra kedvezmény" },
    },
    maxTotalPercent: 30,
    // Egy magasabb csomag legalább ennyivel (%) drágább, hogy a csomagok ne legyenek egyforma árúak.
    minTierStepPercent: 10,
  },

  maintenance: {
    hostingMonthly: { company: 40, webshop: 120, webapp: 200, landing: 25, redesign: 40 },
    domainYearly: 80,
    support: {
      basic: { label: "Alap karbantartás (frissítések, mentések)", monthly: 90 },
      standard: { label: "Standard karbantartás (+ havi 1 óra módosítás)", monthly: 190 },
      premium: { label: "Premium karbantartás (+ havi 3 óra módosítás, prioritás)", monthly: 390 },
    },
  },
};
