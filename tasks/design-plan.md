# Design-terv: egységes vizuális rendszer (gradiens + liquid) érthető UX-szel

Dátum: 2026-10-27 · Állapot: MEGVALÓSÍTVA (19/19 döntés, 12/12 feladat)

## Kérés (felhasználó)
"Legyen egységes a design a többi színnel és liquid forma vonallal, de UX/UI szempontból legyen érthető, egyértelmű, könnyen követhető."
Hatókör: teljes oldal – kezdőlap (`/`), kérdőív (`/tervezo`), ajánlat (`/ajanlat`), adatkezelés (`/adatkezeles`). E-mail sablonok nem.

## Jelenlegi állapot (kiindulás)
- Tokenek: `src/theme/tokens.ts` – ink #0E0F12, paper #F5F5F0, lime #D4FF3A, cardBody #1C1B2E / cardBodyDeep #121124, packageThemes.
- Fontok: Bricolage Grotesque (display), Instrument Sans (body).
- Kezdőlap: sötét hero lime kiemelővel + FluidBlobs, auto-forgó OfferPreview, gradiens PricingCards, projekttípus-lista, ígéret-blokk, GYIK, lime CTA.
- Kérdőív: sötét fejléc, fehér OptionCard-ok, sötét oldalsáv, liquid elem nincs.
- Ajánlat: hero → QuickDecisionBanner → figyelmeztetés → PricingCards → 7 egyforma fehér kártya → űrlap → ragadós CTA.
- Adatkezelés: sima szöveg, nincs közös keret.

## Jóváhagyott döntések

| # | Terület | Döntés |
|---|---------|--------|
| 1A | Ajánlat sorrend | Hero (ár + „Ingyenes egyeztetést kérek” + figyelmeztetés apró betűvel) → csomagválasztás → űrlap → egyetlen „Részletek” blokk fülekkel: *Kalkuláció* / *Mit tartalmaz* / *Technológia és fenntartás*. A visszaszámláló a hero alatt, a csomagok előtt. |
| 2A | Elküldve állapot | `submittedAt` mentése a wizardStore-ba. Utána: felső „Kérésed megérkezett – {dátum}, 1 munkanapon belül jelentkezünk” sáv, visszaszámláló és ragadós sáv elrejtve, űrlap helyett megerősítés + „Mi következik” 3 lépés. Újratöltés után is így marad. |
| 3A | Óra-állapotok | Amíg az óra nem ismert: ár-skeleton (hero, kártyák, ragadós sáv). Sávváltáskor látható + `aria-live` üzenet: „A kedvezmény −25%-ról −15%-ra csökkent.” Óra-hiba: „A kedvezményt az elküldéskor rögzítjük.” |
| 4A | Kezdőlapi kedvezményszöveg | „−25% kedvezmény, ha az ajánlatod elkészülte után 1 órán belül egyeztetést kérsz.” (hero alatt és záró sávban) |
| 5A | Javasolt opció | „Neked ajánljuk” címke, de nincs előre kijelölve; amíg nincs választás, a Tovább gomb „Válassz egyet” és inaktív-stílusú. |
| 6A | Haladás | Projekttípus előtt „1. kérdés / kb. 15” és a sáv azonnal mozdul (`(index+1)/total`); utolsó kérdés: 100% + „Utolsó kérdés”. |
| 7A | Hero előnézet | Egy kör (Basic→Standard→Premium), Standardon megáll; érintés/fókusz azonnal leállítja; reduced-motion esetén nem forog; 44px fülek; `tab`/`tabpanel` kapcsolat. |
| 8A | Árnyék | Egyetlen semleges árnyék token: `0 18px 40px -24px rgba(14,15,18,.35)`. Színes glow (kártya, gradiens gomb, lime hover) megszűnik. |
| 9A | Színszerepek | **Ink** = szerkezet (fejléc, hero, sávok, kiválasztott keret). **Lime** = a képernyő egyetlen fő gombja + „a te választásod” (kijelölés kitöltés, pipa). **Csomag-gradiensek** = csak csomagidentitás (kártyafejléc, csomagcímke, ragadós sáv csomag-pötty) + liquid formák. **Borostyán** (#FFB547 körvonal/szöveg sötéten) = kedvezmény és idő. **Info** = semleges paper + ikon. Gradiens szöveg címben megszűnik; gradiensek nem keverednek egymással. |
| 10A | Kontraszt | Minden gradiensen ink szöveg (≥4,5:1). Gradiens gombok szövege ink. |
| 11A | Liquid szabályok | Közös `WaveDivider` komponens ugyanazzal a görbével minden sötét↔világos határon (kezdőlap hero alja, ajánlat hero alja, kérdőív fejléc alja, adatkezelés fejléc alja, csomag-szekció). Csomagkártya-fejléc hullámos marad. Folyékony formák csak sötét felületen, a széleken (kezdőlap hero, ajánlat hero, kérdőív oldalsáv sarka). Soha szöveg/ár/űrlapmező/válaszkártya mögött. Képernyőnként max. egy mozgó forma; reduced-motion: áll. Kérdőív progress: hullámos lime vonal. |
| 12A | Sötét felületek | Alap #0E0F12, emelt #1A1C21. A lilás #1C1B2E/#121124 megszűnik. |
| 13A | Kiemelések | Kezdőlap: Standard „Legnépszerűbb”. Ajánlatoldal: csak „Neked ajánlott” címke + kiválasztott lime keret és „Kiválasztva” gomb; nincs nagyítás. |
| 14A | DESIGN.md | Projektgyökérben, tokenekkel; a fenti döntések a forrás. |
| 15A | Mobil csomagválasztás | <md: felül 3 részes kapcsoló (név + ár), alatta csak a kiválasztott kártya. ≥md: három kártya egymás mellett. |
| 16A | Akadálymentesség | Minden kattintható ≥44px; minden szöveg ≥4,5:1 (lejárt lépcsők nem 35% átlátszóak, hanem muted + áthúzás); mobil mentve-jelzés `aria-label`-lel; fül/tabpanel szerepek; fókusz az első hibás mezőre. |
| 17A | Űrlap | Mezők felett: „Add meg az e-mail-címed vagy a telefonszámod – a többi nem kötelező.” Hozzájárulás jelölve kötelezőként; hibánál fókusz az első hibás mezőre. |
| 18A | Közös keret | `SiteHeader` (sötét, logó + „Ajánlatkérés”, hullám alj) és `SiteFooter` minden oldalon; üres ajánlat-állapot lime „Kérdőív indítása” gombbal. |
| 19A | Kártyasorok | 6 sor után „+N további tétel – lásd: Részletek / Kalkuláció” link. |

## Képernyőszerkezet (információs hierarchia)

```
KEZDŐLAP                         KÉRDŐÍV                          AJÁNLAT
┌ SiteHeader (ink) ─────────┐    ┌ fejléc (ink) + hullám-progress┐ ┌ SiteHeader (ink) ─────────────┐
│ 1 Főcím + lime marker     │    │ 1 „6. kérdés / kb. 15”         │ │ 1 Projekt + ÁR + [Egyeztetést │
│ 2 Egy mondat + [lime CTA] │    │ 2 Kérdés (h1) + tipp           │ │   kérek] (lime) + apró betű   │
│ 3 Előnézet (1 kör) + forma│    │ 3 Válaszkártyák (fehér, tiszta)│ │ ~ hullám ~                    │
│ ~ hullám ~                │    │   oldalsáv: „A projekted” (ink)│ │ 2 Visszaszámláló (borostyán)  │
│ Lépések 1-2-3             │    │ ── alsó sáv: Vissza | [lime]   │ │ 3 Csomagválasztás (mobil:     │
│ Csomagok (ink + hullám)   │    └────────────────────────────────┘ │   kapcsoló + 1 kártya)       │
│ Projekttípusok + árak     │                                       │ 4 Űrlap / „Elküldve” állapot  │
│ Ígéretek (ink)            │                                       │ 5 Részletek [Kalk|Tartalom|Tech]│
│ GYIK                      │                                       │ ── ragadós sáv (ink)          │
│ Záró CTA                  │                                       │ SiteFooter                    │
│ SiteFooter                │                                       └───────────────────────────────┘
```

## Interakciós állapotok

| Funkció | Betöltés | Üres | Hiba | Siker | Részleges |
|---|---|---|---|---|---|
| Kérdőív | skeleton kártyák | — | — | → ajánlat | mentett állapot, „Folytatom” a kezdőlapon |
| Ajánlat ár / óra | ár-skeleton | „Még nincs ajánlatod” + lime „Kérdőív indítása” (közös fejléccel) | „A kedvezményt az elküldéskor rögzítjük” | ár + aktív sáv | sávváltás-üzenet (aria-live) |
| Csomagkártyák | skeleton | — | — | kiválasztott: lime keret + „Kiválasztva” | 6 sor + „+N további tétel” |
| Űrlap | gomb: „Küldés…” + spinner | — | mező alatti hiba + fókusz az első hibára; szerver: piros sáv a gomb felett | „Elküldve” állapot (2A), mentve | — |
| Visszaszámláló | „1 órán belül” szöveg skeleton számmal | kikapcsolt konfig → nem jelenik meg | ld. óra hiba | — | lejárt: „A gyors döntés kedvezmény lejárt” |

## Felhasználói út

| Lépés | A felhasználó teszi | Érzi | Amit a terv biztosít |
|---|---|---|---|
| 1 | Megnyitja a kezdőlapot | kíváncsi, óvatos az ár miatt | valódi „már X RON-tól” árak, egy lime CTA, pontos kedvezményszöveg (4A) |
| 2 | Elindítja a kérdőívet | „mennyi ideig tart?” | „1. kérdés / kb. 15”, mozduló hullám-progress (6A) |
| 3 | Válaszol | magabiztos, ha érti | tiszta háttér, egyértelmű kijelölés, javaslat nem előre bejelölve (5A) |
| 4 | Ajánlatot lát | izgatott / árérzékeny | ár + CTA az első képernyőn (1A), nincs ugráló ár (3A) |
| 5 | Csomagot választ | döntésképtelen lehet | egy jel oldalanként (13A), mobil kapcsoló (15A) |
| 6 | Egyeztetést kér | tart a kötelezettségtől | előre jelzett kötelező mezők (17A), „nincs kötelezettség” |
| 7 | Elküldte | „megérkezett?” | tartós „Elküldve” állapot + mi következik (2A) |

## NOT in scope
- E-mail sablonok újratervezése – külön kör.
- Sötét mód (dark mode) – az oldal egy fix, márkás téma.
- Mockup-alapú vizuális iteráció – a gstack designer OpenAI 429 miatt nem futott; a döntések szövegesek.
- Új kérdések / árazás – nem dizájnkérdés.

## What already exists (újrahasznosítandó)
- `src/theme/tokens.ts` (palette, packageThemes, ease), `theme.ts` (MUI téma, `.reveal`), `Logo`, `SiteFooter`, `LinkButton`.
- `PricingCards` (hullámos fejléc, buborékok) → bővül mobil kapcsolóval, ink szöveggel, „+N” sorral.
- `FluidBlobs` → paraméterezhető lesz (méret/hely), reduced-motion már kezelve.
- `useOfferClock`, `resolveQuickDecision`, `QuickDecisionBanner`, `StickyCta` → állapotokkal bővülnek.
- `wizardStore` → `submittedAt` mező.

## TODOS.md
Nincs elhalasztott dizájnadósság: minden jóváhagyott javítás ebben a körben készül el.

## Implementation Tasks

- [x] **T1 (P1, human: ~2h / CC: ~10min)** — Tokenek — színszerepek, egy sötét + emelt, borostyán, info, árnyék token; lilás sötétek törlése
  - Surfaced by: Pass 5 — 9A, 12A, 8A
  - Files: `src/theme/tokens.ts`, `src/theme/theme.ts`
  - Verify: `npm run typecheck`, nincs több `cardBody`/`#121124` hivatkozás
- [x] **T2 (P1, human: ~2h / CC: ~10min)** — DESIGN.md megírása a döntésekből
  - Surfaced by: Pass 5 — 14A
  - Files: `DESIGN.md`
  - Verify: fájl létezik, tokenek egyeznek a `tokens.ts`-sel
- [x] **T3 (P1, human: ~3h / CC: ~15min)** — WaveDivider + SiteHeader + liquid szabályok minden oldalon
  - Surfaced by: Pass 5 — 11A; Pass 6 — 18A
  - Files: `src/components/WaveDivider.tsx`, `src/components/SiteHeader.tsx`, `src/components/home/FluidBlobs.tsx`, `src/app/page.tsx`, `src/app/adatkezeles/page.tsx`, `Wizard.tsx`, `WizardSidebar.tsx`, `OfferView.tsx`
  - Verify: böngésző – minden oldalon azonos fejléc és hullám, forma soha nem szöveg mögött
- [x] **T4 (P1, human: ~3h / CC: ~15min)** — PricingCards: ink szöveg, egy jel oldalanként, semleges árnyék, mobil kapcsoló, „+N további”
  - Surfaced by: 10A, 13A, 8A, 15A, 19A
  - Files: `src/features/offer/components/PricingCards.tsx`, `HomePricing.tsx`
  - Verify: kontraszt ≥4,5:1; 390px-en kapcsoló + 1 kártya
- [x] **T5 (P1, human: ~4h / CC: ~20min)** — Ajánlatoldal új sorrend + Részletek fülek
  - Surfaced by: Pass 1 — 1A
  - Files: `OfferView.tsx`, új `OfferDetails.tsx`
  - Verify: első képernyőn ár + CTA; űrlap a csomagok után
- [x] **T6 (P1, human: ~3h / CC: ~15min)** — Elküldve állapot (mentett)
  - Surfaced by: Pass 2 — 2A
  - Files: `src/lib/storage.ts`, `ContactForm.tsx`, `OfferView.tsx`, `StickyCta.tsx`, `QuickDecisionBanner.tsx`
  - Verify: elküldés után újratöltve is „Elküldve”, sáv és időzítő nincs
- [x] **T7 (P1, human: ~2h / CC: ~10min)** — Óra betöltés/hiba/sávváltás állapotok
  - Surfaced by: Pass 2 — 3A
  - Files: `useOfferClock.ts`, `OfferView.tsx`, `QuickDecisionBanner.tsx`, `StickyCta.tsx`
  - Verify: betöltéskor skeleton; hálózati hiba esetén üzenet
- [x] **T8 (P2, human: ~1h / CC: ~5min)** — Kezdőlapi kedvezményszöveg
  - Surfaced by: Pass 3 — 4A
  - Files: `HeroActions.tsx`, `src/app/page.tsx`
- [x] **T9 (P2, human: ~1h / CC: ~10min)** — Javasolt opció nem előre kijelölt + haladás
  - Surfaced by: Pass 3 — 5A, 6A
  - Files: `Wizard.tsx`, `QuestionStep.tsx`, `OptionCard.tsx`
  - Verify: unit tesztek zöldek; 1. kérdésnél a sáv >0%, utolsónál 100%
- [x] **T10 (P2, human: ~1h / CC: ~5min)** — Hero előnézet: egy kör, fókusz/érintés stop, 44px fülek, tabpanel
  - Surfaced by: Pass 4 — 7A
  - Files: `src/components/home/OfferPreview.tsx`
- [x] **T11 (P2, human: ~2h / CC: ~10min)** — Akadálymentesség és űrlap
  - Surfaced by: Pass 6 — 16A, 17A
  - Files: `QuickDecisionBanner.tsx`, `Wizard.tsx`, `ContactForm.tsx`
  - Verify: érintési célok ≥44px, kontraszt, fókusz az első hibára
- [x] **T12 (P1, human: ~1h / CC: ~10min)** — Ellenőrzés: tesztek, build, böngésző 1440 + 390, `/design-review`
  - Verify: `npm test`, `npm run build`, nincs vízszintes görgetés

## Completion Summary

```
  +====================================================================+
  |         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
  +====================================================================+
  | System Audit         | nincs DESIGN.md; UI: 4 oldal                |
  | Step 0               | 5/10; mind a 7 szempont                     |
  | Pass 1  (Info Arch)  | 4/10 → 8/10 after fixes                     |
  | Pass 2  (States)     | 3/10 → 8/10 after fixes                     |
  | Pass 3  (Journey)    | 5/10 → 8/10 after fixes                     |
  | Pass 4  (AI Slop)    | 5/10 → 8/10 after fixes                     |
  | Pass 5  (Design Sys) | 3/10 → 9/10 after fixes                     |
  | Pass 6  (Responsive) | 5/10 → 9/10 after fixes                     |
  | Pass 7  (Decisions)  | 1 resolved, 0 deferred                      |
  +--------------------------------------------------------------------+
  | NOT in scope         | written (4 items)                           |
  | What already exists  | written                                     |
  | TODOS.md updates     | 0 items proposed                            |
  | Approved Mockups     | 0 generated (OpenAI 429), 0 approved        |
  | Decisions made       | 19 added to plan                            |
  | Decisions deferred   | 0                                           |
  | Overall design score | 3/10 → 8/10                                 |
  +====================================================================+
```

## Unresolved Decisions
Nincs.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Outside Review | Claude subagent (in-host), Codex not installed | Independent 2nd opinion | 1 | completed (native only) | 2 critical, 5 high, 10 medium |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | clean | score: 3/10 → 8/10, 19 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **OUTSIDE COVERAGE:** design phase – Codex: unavailable (not installed); Claude subagent (in-host): completed, findings merged into Passes 1–7.
- **VERDICT:** DESIGN REVIEW CLEAR (PLAN) — eng review required.

NO UNRESOLVED DECISIONS
