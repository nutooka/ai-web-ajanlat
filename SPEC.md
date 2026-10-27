# Spec: Interaktív webfejlesztési ajánlatkészítő (MVP)

> Státusz: **JÓVÁHAGYVA** (2026-10-27)
> Dátum: 2026-10-27

## 0. Feltételezések (javíts, ha valamelyik rossz)

1. **Nyelv:** a felület csak magyar. Minden szöveg egy helyen (`src/content/`) van, így később román/angol bővítés egyszerű.
2. **Pénznem:** RON, nettó árak (ÁFA nélkül), 50 RON-ra kerekítve.
3. **Kezdeti óradíj:** 200 RON/óra. Minden ár egyetlen config fájlban módosítható.
4. **Kérdéssorok:** a prompt két helyen csonka ("Hz rá:", "Technológiai javd ki:"). A céges weboldal kérdéssorát én tervezem meg; az alatta lévő lista (fő cél, felhasználók, bejelentkezés, admin, adatbázis, fizetés, API, funkciók, szerepkörök) az **egyedi webalkalmazás** kérdéssora. A felsorolt "kimarad" lista (regisztráció, admin, DB, fizetés, SaaS, AI-chat, CRM) az MVP-ből kimaradó funkciók.
5. **Nincs adatbázis:** a válaszok `localStorage`-ban, beküldéskor csak e-mail megy ki (Resend).
6. **Ár szerveroldalon újraszámolva:** a beküldéskor a szerver a nyers válaszokból újraszámolja az ajánlatot; a kliens által küldött árat nem fogadja el.
7. **Spamvédelem új függőség nélkül:** honeypot mező + minimális kitöltési idő + memóriabeli IP-alapú rate limit (serverless-en best-effort).
8. **Tesztek:** Vitest (egyetlen új dev-függőség a teszteléshez). E2E-t böngészőben kézzel/automatizálva ellenőrzök, Playwright nem kerül a projektbe.
9. **Resend kulcs nélkül** az app működik; a küldés gomb ilyenkor érthető hibaüzenetet ad, fejlesztésben a szerver logolja a levelet.

## 1. Cél

Potenciális ügyfelek egy lépésenként haladó, egyszerre egy kérdést mutató "digitális tanácsadón" keresztül leírják a projektjüket, és regisztráció nélkül azonnal kapnak egy részletes, tételes, becsült árajánlatot három csomagban (Basic / Standard / Premium). Opcionálisan elküldhetik az ajánlatot a tulajdonosnak (és maguknak másolatban).

**Siker:** egy látogató 3–5 perc alatt végigér a kérdőíven mobilon is, és érthető, hihető, tételes ajánlatot lát; a tulajdonos strukturált e-mailt kap a válaszokkal és az ajánlattal.

## 2. Képességtérkép (modulok)

Egy alkalmazás, egy spec, de belül jól elválasztott modulok. A függőség csak egy irányba mutat.

| Modul id | Felelősség | Függ tőle |
|---|---|---|
| `questionnaire-config` | Kérdések, opciók, feltételek, projekttípus-ágak (tiszta adat + típusok) | — |
| `questionnaire-engine` | Látható lépések kiszámítása válaszokból, navigáció, validáció (tiszta TS) | `questionnaire-config` |
| `pricing` | Árazási config + engine: válaszok → tételek, csomagok, idő, fenntartás (tiszta TS) | `questionnaire-config` |
| `offer` | Ajánlat-modell összeállítása (összefoglaló, tech javaslat, benne van / nincs benne, következő lépések) | `pricing`, `questionnaire-config` |
| `wizard-ui` | Kérdőív felület, animációk, autosave | `questionnaire-engine` |
| `offer-ui` | Ajánlatoldal, csomagválasztó | `offer` |
| `contact` | Kapcsolati űrlap, API route, Zod, spamvédelem, Resend e-mailek | `offer` |
| `ai` | AI-bővítési pont (interfész + no-op implementáció) | `questionnaire-config` |

Építési sorrend: `questionnaire-config` → `questionnaire-engine`, `pricing` → `offer` → `wizard-ui`, `offer-ui` → `contact` → `ai`

## 3. Funkcionális követelmények és elfogadási feltételek

### 3.1 Kezdőoldal (`/`)
- Rövid hero: érték-ígéret, "Kezdjük el" CTA, 3 lépéses "hogyan működik".
- Ha van mentett, félbehagyott kitöltés: "Folytatás" és "Újrakezdés" gomb.

### 3.2 Kérdőív (`/tervezo`)
- Egyszerre **egy kérdés**. Minden lépésen: haladási sáv (`x / n` + százalék), Vissza, Tovább, kártyás opciók ikonnal és rövid leírással.
- Kérdéstípusok: `single` (kártyák, választás után automatikusan továbblép), `multi` (kártyák, pipával), `scale`/`range` (pl. oldalszám, termékszám sávok), `text` (szabad szöveg, opcionális).
- Billentyűzettel is használható (Enter = tovább, számbillentyűk = opció), fókuszkezelés lépésváltáskor.
- **Autosave:** minden válasz azonnal `localStorage`-ba kerül (verziózott kulccsal); újratöltés után ugyanott folytatódik.
- **Feltételes logika:** az első kérdés (projekttípus) ágat választ; minden kérdésnek lehet `showIf` feltétele korábbi válaszokra. Ha a felhasználó visszamegy és ágat vált, a már nem látható ágak válaszai nem számítanak bele az árba.
- **Ne kérdezzen kétszer:** a közös kérdések (arculat, design, többnyelvűség, határidő, tartalomfeltöltés) egyszer szerepelnek, az ágak nem ismétlik őket.
- Minden ág végén szabad szöveges "Van még valami, amit tudnunk kell?" mező.

**Első kérdés:** Milyen projektet szeretnél megvalósítani?
`company` Bemutatkozó/céges weboldal · `webshop` Webshop · `webapp` Egyedi webalkalmazás · `landing` Landing page · `redesign` Meglévő oldal felújítása · `unsure` Még nem tudom pontosan

**Ágak (rövidítve, a végleges szövegezés a configban):**

| Ág | Kérdések |
|---|---|
| `webshop` | termékkategória · termékszám (≤50 / 51–200 / 201–1000 / 1000+) · termékváltozatok · online fizetés · utánvét · szállítási módok (multi: futár, csomagautomata, személyes átvétel, nemzetközi) · készletkezelés · számlázó-integráció · termékfeltöltést mi végezzük? |
| `company` | tevékenység (szöveg) · oldalak száma (1–5 / 6–10 / 11–20 / 20+) · funkciók (multi: kapcsolati űrlap, blog/hírek, galéria/portfólió, referenciák, időpontfoglalás, GYIK, térkép, hírlevél-feliratkozás) · megvannak-e a szövegek és képek? · SEO alapcsomag kell? |
| `webapp` | fő cél (szöveg) · kik használják (belső csapat / ügyfelek / nyilvános) · bejelentkezés · adminfelület · adatbázis · online fizetés · külső API-integrációk (multi) · fő funkciók (szöveg + multi: dashboard, fájlfeltöltés, értesítések, riportok, keresés) · felhasználói szerepkörök (1 / 2–3 / 4+) |
| `landing` | fő cél (lead gyűjtés / termékbevezetés / esemény / app letöltés) · szekciók száma · űrlap / hírlevél-integráció · A/B teszt és analitika · hirdetési kampányhoz készül? |
| `redesign` | jelenlegi oldal URL · mi a fő probléma (multi: elavult design, lassú, nem mobilbarát, nehéz szerkeszteni, kevés konverzió) · jelenlegi platform (WordPress / egyedi / Wix-szerű / nem tudom) · tartalom-migráció · oldalak száma · új funkciók kellenek? |
| `unsure` | mi a vállalkozás célja (szöveg) · van-e most weboldal · el kell-e adni online · kell-e foglalás/ügyfélkapu → a válaszok alapján **ajánlott projekttípust** mutat, és átirányít a megfelelő ágra (a már megválaszolt kérdéseket nem kérdezi újra) |
| közös (minden ág után) | többnyelvűség (1 / 2 / 3+ nyelv) · van-e arculat/logó · design (sablon / testreszabott / teljesen egyedi) · tartalomfeltöltés · határidő (rugalmas / normál / gyors / sürgős) · szabad szöveg |

### 3.3 Árazás (`src/features/pricing`)
- **Tiszta, determinisztikus TS függvény:** `calculateQuote(answers, config) → Quote`. Nincs `Date.now()`, nincs véletlen, nincs React.
- **Központi config** (`src/config/pricing.ts`): óradíj, projekttípusonkénti alapórák, funkciónkénti órák, design-szorzók, nyelvi felár, tartalomfeltöltés, sürgősségi szorzók, fenntartási díjak, kerekítés, heti kapacitás.
- **Modell:**
  - Tétel = `{ id, label, hours, category, packages: ('basic'|'standard'|'premium')[] }`
  - Ár = Σ(órák) × óradíj × design-szorzó (csak a design/frontend tételekre) × nyelvi szorzó (tartalom/frontend tételekre) × sürgősségi szorzó, majd kerekítés.
  - Kezdeti értékek (példa): óradíj 200 RON; alapórák: landing 20, company 40, webshop 80, webapp 120, redesign 35; design: sablon ×1.0, testreszabott ×1.3, egyedi ×1.7; plusz nyelvenként +20% a tartalom/frontend órákra; sürgősség: rugalmas ×0.95, normál ×1.0, gyors ×1.2, sürgős ×1.4.
- **Csomagok a valós igényekből:**
  - **Basic:** az alapórák + a kötelezőként jelölt kiválasztott funkciók, sablon design, opcionális extrák nélkül.
  - **Standard (ajánlott):** pontosan az, amit a felhasználó kiválasztott.
  - **Premium:** Standard + prémium kiegészítők (egyedi design, haladó SEO, analitika, teljesítmény-optimalizálás, 3 hónap kiemelt támogatás).
- **Kimenet:** tételes lista csomagonként, nettó összeg, becsült munkaóra, becsült fejlesztési idő hetekben (órák ÷ heti kapacitás, sürgősségnél tömörítve), havi és éves fenntartási becslés (tárhely/domain/karbantartás).
- Minden kimeneti szám visszavezethető a configra (tétel-szinten látszik az óra és az alkalmazott szorzó).
- **Kedvezmények (configból kapcsolható):**
  - `launchDiscount`: indulási kedvezmény (kezdetben **25%**, címkével, pl. „Indulási kedvezmény”), be/ki kapcsolható.
  - `packageDiscounts`: csomagonkénti extra kedvezmény (pl. Standardra +5%, hogy az legyen a vonzó választás).
  - A kedvezmény a sürgősségi felár **után**, a kerekítés **előtt** számít; összesen legfeljebb `maxDiscountPercent` (alap: 30%).
  - A kedvezmény a fejlesztési díjra vonatkozik, a fenntartásra nem.
- **Premium extrák méretarányosan:** `premiumExtrasScale` projekttípusonként (pl. landing ×0.4, webalkalmazás ×1.2).
- **Keret alapú ajánlás:** a `budget` válasz nem módosítja az árat, csak az ajánlott csomagot (a legbővebb, ami belefér; keret nélkül Standard).
  - Kimenet: `listPrice` (eredeti), `discounts[]` (címke + összeg), `finalPrice`. Az ajánlaton az eredeti ár áthúzva, a kedvezmény külön sorban látszik.

### 3.4 Ajánlatoldal (`/ajanlat`)
- Projekt-összefoglaló (szabályalapú szöveg a válaszokból), javasolt technológia (projekttípus szerint: pl. Next.js + headless CMS, webshop: Next.js + Shopify/WooCommerce headless vagy egyedi), kiválasztott funkciók chipekként.
- Három csomag kártyán, Standard kiemelve; csomagváltáskor animáltan frissül a tételes táblázat.
- Teljes ár (kedvezmény esetén eredeti ár áthúzva + megtakarítás), fejlesztési idő, fenntartás, "Mit tartalmaz", "Mit nem tartalmaz", "Következő lépések".
- **Kötelező figyelmeztetés minden ajánlaton:** "Az ár tájékoztató jellegű, a végleges ajánlat személyes egyeztetés után készül."
- "Válaszok módosítása" link vissza a kérdőívre (a válaszok megmaradnak).
- Nyomtatható nézet (`@media print`) – PDF-et a böngésző nyomtatásával.
- Ha nincs kitöltött kérdőív, egy „Kérdőív indítása / folytatása” képernyőt mutat (átirányítás helyett).

### 3.5 Kapcsolatfelvétel és küldés
- Opcionális mezők: név, e-mail, telefon, cégnév, megjegyzés + "Kérek másolatot" jelölő + **kötelező adatkezelési hozzájárulás** (ha bármilyen személyes adat van megadva) link az `/adatkezeles` oldalra.
- Ha másolatot kér, az e-mail kötelező.
- `POST /api/offer`: Zod validáció a szerveren (válaszok + kapcsolati adatok), honeypot, minimális kitöltési idő (>3 mp az űrlap megjelenése óta), rate limit (5 kérés / 10 perc / IP), ár újraszámolása a szerveren.
- Két e-mail Resenddel: (1) tulajdonosnak: strukturált HTML + szöveges verzió, minden válasz, választott csomag, tételes ár; `reply-to` = ügyfél e-mail; (2) ügyfélnek: másolat, ha kérte.
- Hibakezelés: érthető magyar hibaüzenetek, sikeres küldés után köszönőképernyő; a kliens nem lát belső hibarészleteket.

### 3.6 AI-bővítési pont
- `src/lib/ai/types.ts`: `InsightProvider` interfész (`interpretFreeText`, `findMissingInfo`, `suggestFollowUps`, `writeSummary`, `recommendTech`).
- `src/lib/ai/rule-based-provider.ts`: alapértelmezett, AI nélküli implementáció (ezt használja az összefoglaló és a tech javaslat).
- Később egy `claude-provider.ts` cserélhető be env változóval; az MVP-ben nincs AI-hívás és nincs AI-függőség.

### 3.7 Adatkezelési tájékoztató (`/adatkezeles`)
- Statikus oldal: milyen adatot, milyen célból, meddig, kinek (Resend mint adatfeldolgozó), jogok, kapcsolat. Adatkezelő: **NUTOOKA SOLUTIONS S.R.L.** (`src/config/site.ts`; az e-mail és a telefonszám még helykitöltő).

## 4. Tech stack

- Next.js (App Router, `create-next-app@latest` aktuális stabil), React, TypeScript strict
- MUI (`@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`, `@emotion/react`, `@emotion/styled`)
- `react-hook-form`, `@hookform/resolvers`, `zod`
- `motion` (Framer Motion utódja)
- `resend`
- Dev: `vitest`
- Node 24, Vercel (Node runtime, nincs Edge)

Más futásidejű függőség nem kerül be engedély nélkül.

## 5. Parancsok

```bash
npm run dev          # fejlesztői szerver (http://localhost:3000)
npm run build        # production build
npm run start        # production szerver lokálisan
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest
```

Környezeti változók (`.env.local`, minta: `.env.example`):

```
RESEND_API_KEY=
OFFER_FROM_EMAIL="Nutooka Solutions <onboarding@resend.dev>"  # amíg nincs saját domain
OFFER_OWNER_EMAIL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 6. Projektstruktúra

```
src/
  app/
    layout.tsx, page.tsx            → gyökér layout (MUI provider), kezdőlap
    tervezo/page.tsx                → kérdőív
    ajanlat/page.tsx                → ajánlat
    adatkezeles/page.tsx            → adatkezelési tájékoztató
    api/offer/route.ts              → beküldés (validáció, spam, e-mail)
  config/
    pricing.ts                      → MINDEN ár és szorzó
    site.ts                         → cégadatok, kapcsolat, adatkezelő
  features/
    questionnaire/
      config/                       → kérdések ágonként (common.ts, webshop.ts, ...)
      engine/                       → getVisibleSteps, navigáció, validáció (+ *.test.ts)
      schema.ts                     → Answers Zod séma
      components/                   → Wizard, QuestionCard, OptionCard, ProgressBar
      hooks/useWizardState.ts       → állapot + localStorage autosave
    pricing/
      engine.ts, types.ts           → calculateQuote (+ engine.test.ts)
    offer/
      buildOffer.ts                 → összefoglaló, tech, benne van / nincs benne (+ teszt)
      components/                   → PackageSelector, LineItemTable, OfferSections
    contact/
      schema.ts                     → kapcsolati Zod séma (kliens + szerver közös)
      spam.ts                       → honeypot, időzítés, rate limit (+ teszt)
      email/                        → e-mail sablonok (HTML + szöveg)
      components/ContactForm.tsx
  lib/
    ai/                             → InsightProvider interfész + szabályalapú implementáció
    format.ts                       → RON formázás (Intl, hu-HU)
    storage.ts                      → biztonságos localStorage wrapper
  theme/theme.ts                    → MUI téma (paletta, tipográfia, komponens-felülírások)
  content/                          → statikus szövegek (hu)
```

## 7. Kódstílus

- TypeScript strict, nincs `any`; típusok Zod sémákból (`z.infer`).
- Üzleti logika tiszta függvényekben, React-mentesen; komponensek csak megjelenítenek és eseményt adnak tovább.
- Fájlnevek: komponens `PascalCase.tsx`, minden más `camelCase.ts`. Azonosítók (`id`-k) angolul, felhasználói szöveg magyarul.
- Server Component az alapértelmezés; `"use client"` csak ahol interakció kell.

```ts
// src/features/pricing/engine.ts
export function calculateQuote(answers: Answers, config: PricingConfig = pricingConfig): Quote {
  const items = collectLineItems(answers, config);
  const multipliers = resolveMultipliers(answers, config);

  const packages = PACKAGE_IDS.map((id) =>
    buildPackage(id, items.filter((item) => item.packages.includes(id)), multipliers, config),
  );

  return { packages, multipliers, maintenance: estimateMaintenance(answers, config) };
}
```

## 8. Tesztelési stratégia

- **Vitest unit tesztek** az üzleti logikára, a forrásfájlok mellett (`*.test.ts`):
  - `questionnaire/engine`: ágválasztás, `showIf`, ágváltás utáni válasz-kizárás, "unsure" átirányítás, nincs duplikált kérdés.
  - `pricing/engine`: determinizmus, csomag-sorrend (Basic ≤ Standard ≤ Premium), szorzók, kerekítés, fenntartás, időbecslés, minden projekttípus snapshot-szerű fix esettel.
  - `offer/buildOffer`: kötelező szekciók és figyelmeztetés megléte.
  - `contact/schema` + `spam`: validáció, honeypot, időzítés, rate limit.
- **Route handler teszt** a `/api/offer`-re mockolt Resenddel (siker, validációs hiba, spam, Resend hiba).
- **Kézi / böngészős ellenőrzés:** mind a 6 útvonal végigkattintva 390 px (mobil) és 1440 px szélességen; konzolhiba nélkül.
- Cél: az üzleti logika (engine, pricing, offer, contact) lefedettsége ≥ 90%.

## 9. Határok

- **Mindig:** tesztek és `typecheck` futtatása lépésenként; árak csak a `pricing.ts`-ben; szerveroldali validáció és ár-újraszámolás; titkok csak env-ben; a "tájékoztató jellegű" figyelmeztetés minden ajánlaton; akadálymentes (fókusz, kontraszt, aria) komponensek.
- **Előbb kérdezek:** a 4. pontban felsoroltakon túli függőség; adatbázis vagy külső tároló; tényleges Vercel deploy; valódi e-mail küldése teszt közben a te címedre; az adatkezelési tájékoztató jogi szövegének véglegesítése.
- **Soha:** titkok commitolása; árak React-komponensbe írása; regisztráció/bejelentkezés, admin, fizetés, CRM, AI-chat az MVP-ben; kliens által küldött ár elfogadása; bukó tesztek törlése.

## 10. Sikerkritériumok

1. `npm run build`, `npm run lint`, `npm run typecheck`, `npm test` hiba nélkül fut.
2. Mind a 6 projekttípus végigjárható; az `unsure` ág a megfelelő ágra irányít.
3. Visszalépés és ágváltás működik; az elhagyott ág válaszai nem befolyásolják az árat.
4. Oldal-újratöltés után a kitöltés ott folytatódik, ahol abbamaradt.
5. Ugyanazokra a válaszokra mindig ugyanaz az ajánlat jön ki (teszt bizonyítja); Basic ≤ Standard ≤ Premium (kedvezmény előtt és után is).
10. A kedvezmény configból ki/be kapcsolható, és az ajánlaton áthúzott eredeti árként jelenik meg.
6. Az ajánlatoldal tartalmazza a 3.4 összes szekcióját és a figyelmeztetést.
7. Érvényes beküldés → tulajdonosi e-mail (+ másolat, ha kérte); érvénytelen / spam → 4xx és érthető üzenet.
8. 390 px szélességen nincs vízszintes görgetés, minden opció kényelmesen koppintható (≥ 44 px).
9. Lighthouse (mobil) Accessibility ≥ 95, Performance ≥ 85 a kezdőlapon.

## 11. Döntések és nyitott kérdések

**Eldöntve (2026-10-27):**
- 6. kör: karcsúbb alapcsomag (alapórák kb. ⅓-dal kevesebb), határidő-csúszka az ajánlatoldalon (gyorsabb: max. +40%, ráérek: max. −20%), ragadós sáv rejtve a lábléc fölött.
- 5. kör: ismétlődő kérdések kiszűrve; ár csak a kérdőív végén; gyors döntés kedvezmény (1 óra −25%, 2 óra −15%, utána teljes ár) aláírt httpOnly sütivel, szerveroldali rögzítéssel – a látott árnál soha nem számolunk többet.
- 4. kör: 160 RON/óra, productivityFactor 0.3, tételárak 50 RON-ra kerekítve, karbantartás 90/190/390 RON/hó. Design: ink + lime márkarendszer, Instrument Sans + Bricolage Grotesque, animált hero, valódi „már X RON-tól” árak, GYIK, ajánlatoldalon ragadós „Ingyenes egyeztetést kérek” sáv.
- 3. kör: rejtett `productivityFactor` (0.4) – a configban lévő órák hagyományos becslések, a számlázott órák AI-asszisztált szinten. Az óraszámok nem jelennek meg az ügyfélnek (oldal, ügyfél-e-mail), csak a tulajdonosi e-mailben. Az átfutáshoz +1 hét visszajelzési puffer.
- 2. kör: indulási kedvezmény 25% (+5% Standard), színesebb design (gradiens háttér, színes ikonok, sötét szekciók, oldalsáv), részletesebb kérdések (cél, célközönség, akciók, csatornák, skála, biztonság, domain, inspiráció, keret).
- Árak: 200 RON/óra és a 3.3 szerinti alapórák maradnak, plusz indulási kedvezmény.
- Cég / adatkezelő: NUTOOKA SOLUTIONS S.R.L., CUI 49185840, EUID ROONRC.J2023000539198, Odorheiu Secuiesc.
- Resend: még nincs fiók/domain → fejlesztéshez `onboarding@resend.dev`; kulcs nélkül az app működik, a küldés érthető hibát ad.
- Nyelv: csak magyar.

**Nyitott (nem blokkoló):**
1. Az oldal neve: munkanév a `src/config/site.ts`-ben, egy helyen cserélhető.
