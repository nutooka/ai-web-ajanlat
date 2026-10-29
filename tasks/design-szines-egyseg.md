# Terv: egységes, színes-formás design (a lime és a borostyán kivezetése)

Cél: a főoldal, a kérdőív és az ajánlatoldal **egy** vizuális nyelvet beszéljen – a színes, gömbös irányt –, sima (egyszínű) lime és borostyán foltok nélkül.

Kiinduló állapot (audit, 2026-10-29): két nyelv keveredik.
- **Színes-formás:** hero gömbök (`FluidBlobs`), csomagkártyák gradiens fejléce buborékokkal és hullámmal (`PricingCards`), szivárványos hullám-elválasztó (`WaveDivider`).
- **Monokróm:** „Mintha egy tanácsadóval…” lépések, projektlista (`ProjectTypeGrid`), „Prémium minőség” sáv, kérdőív (`OptionCard`, `WaveProgress`), űrlapok (`ContactForm`, `SaveOffer`), ajánlat-részletek. Kiemelőszín: sima lime `#D4FF3A` (22 fájl, a MUI `primary`), kedvezmény: sima borostyán `#FFB547`.

## Elfogadott döntések

| # | Döntés | Választás |
|---|---|---|
| D1 | Hatókör | Mindhárom felület: főoldal, kérdőív, ajánlatoldal (+ `/a/[code]`, adatkezelés fejléce) |
| D2 | A lime helyett | **Márka-gradiens** a három csomagszínből: fő gomb, kiemelő, kijelölés, pipák, haladáscsík |
| D3 | A borostyán helyett | **Meleg kedvezmény-gradiens** (a meglévő kedvezménygömbé): címkék, visszaszámláló |
| D4 | Formák | **Szekciónként egy forma** (szélen levágva); lépésszámok mögött kék/narancs/zöld kis gömb; projektsorok gradiens ikonpontja |
| D5 | Állapotok | Teljes állapotkészlet (lásd táblázat) |
| D6 | Gradiens szöveg | **Tilos.** Gradiens csak kitöltés, rajta mindig tinta szöveg |
| D7 | Premium gradiens | Lime nélkül: smaragd-zöld |
| D8 | Mobil | Szekció-gömb 50% méretben, jobb felső sarokból, cím fölött; telefonon nem mozog |
| D9 | Logó | Logó, favicon, apple-icon és OG-kép a márka-gradiensre |

## Tokenek (új / módosuló) – `src/theme/tokens.ts`, `DESIGN.md`

```ts
gradients: {
  brand:    "linear-gradient(120deg, #2BD2C9 0%, #3A7BFF 35%, #FF5E7E 70%, #FFB547 100%)", // akció + kijelölés
  discount: "linear-gradient(135deg, #FFD27A 0%, #FFB547 55%, #FF9447 100%)",            // kedvezmény + idő
  basic:    "linear-gradient(135deg, #2BD2C9 0%, #3A7BFF 100%)",   // változatlan
  standard: "linear-gradient(135deg, #FFB547 0%, #FF5E7E 100%)",   // változatlan
  premium:  "linear-gradient(135deg, #5BE38A 0%, #10A37F 100%)",   // ÚJ (volt: #D4FF3A → #2BD98A)
}
brandTint: "#EEF4FF"   // kijelölt kártya halvány háttere (a lime-tint helyett)
// Kivezetve: lime, limeHover, limeTint, amber (mint felületszín), check (sima zöld pipa)
```

- MUI `primary.main`: a márka-gradiens középszíne (`#3A7BFF`) csak fallbacknek; a `contained` gomb `background: gradients.brand`, szövege `ink`.
- Kontraszt: tinta (`#0E0F12`) a gradiensek legsötétebb pontján is ≥ 4,5:1 (kék `#3A7BFF` ≈ 5:1, smaragd `#10A37F` ≈ 6:1). **Fehér szöveg gradiensen tilos.**

## Felületek

**Főoldal**
- Hero: a „weboldalad.” kiemelő = márka-gradiens sáv, tinta szöveg. A projekttípus-csempék hover/fókusz = márka-gradiens kitöltés. Hero gömbök változatlanok (csomagjelentés).
- „Mintha egy tanácsadóval…”: a nagy számok (1., 2., 3.) mögött kis gömb – kék, narancs, smaragd sorrendben (a három lépés = a három szín). A lime pont a szám után megszűnik.
- „Milyen projektben gondolkodsz?”: minden sor elején kis gradiens pont (a márka-gradiens egy-egy szakasza); hover = márka-gradiens sáv balról (a lime helyett).
- „Prémium minőség” (sötét): egy nagy, szélen levágott márka-gradiens gömb jobb alsó sarokban; a lime pipa-négyzetek → márka-gradiens négyzet tinta pipával.
- Csomag-szekció: változatlan; a kártyák „Legnépszerűbb” címkéje tinta marad.

**Kérdőív**
- Haladáscsík (`WaveProgress`): márka-gradiens hullám.
- Válaszkártya kijelölve: 2 px márka-gradiens keret (`border-image` vagy pseudo-elem), `brandTint` háttér, gradiens pipa. Ikonnégyzet kijelölve: márka-gradiens.
- „Neked ajánljuk” címke: márka-gradiens kitöltés, tinta szöveg.
- Árnövelő jelvények: változatlanok (semleges); „Jelentősen növeli” sötét marad.
- Oldalsáv gömbje: változatlan (semleges → ajánlott csomag színe). Telefonon csak a fejlécben.

**Ajánlatoldal (+ `/a/[code]`)**
- Fő gomb („Egyeztetést kérek”), sticky CTA gombja: márka-gradiens.
- Kedvezménypanel: borostyán szöveg → meleg kedvezmény-gradiens címkék tinta szöveggel; visszaszámláló címke ugyanígy.
- Csomagkártyák: kijelölt kártya keret = márka-gradiens (a lime glow helyett), „A te választásod” címke márka-gradiens; pipák = gradiens körvonal; „Kérted” címke = márka-gradiens kitöltés.
- „Még gondolkodsz?” panel: egy kis márka-gradiens gömb a jobb felső sarokban (asztali), WhatsApp-gomb márka-gradiens helyett **tinta** gomb (képernyőnként egy fő gomb szabály).
- Megosztás-sáv (`/a/[code]`): lime → márka-gradiens.

**Logó és ikonok:** `Logo.tsx`, `icon.svg`, `apple-icon.tsx`, `opengraph-image.tsx` → márka-gradiens négyzet, tinta „n”; OG-kép címkéi: márka-gradiens és kedvezmény-gradiens.

## Formák szabályai (DESIGN.md „Liquid motívum” frissítés)

- Csomagszín (kék/narancs/smaragd) = csomag, mint eddig; **márka-gradiens forma** = díszítő, de szekciónként legfeljebb **egy**, mindig a szélen levágva.
- Soha szöveg, ár, űrlapmező vagy válaszkártya mögött. Képernyőnként max. egy **mozgó** forma; a többi áll.
- Telefonon (`xs`): 50% méret, jobb felső sarok, a cím fölötti üres sávban; nem mozog. `prefers-reduced-motion`: semmi nem mozog.

## Állapotok (D5)

| Elem | Alap | Hover | Fókusz | Letiltva | Betöltés | Hiba |
|---|---|---|---|---|---|---|
| Fő gomb | márka-gradiens, tinta szöveg | gradiens elcsúszik (`background-position`, 300 ms ease-out) | 2 px tinta keret, 3 px eltolás | papír `#F5F5F0` háttér, `muted` szöveg, gradiens nélkül | kis tinta pörgettyű a szöveg előtt, gomb letiltva | gomb visszaáll, hibaüzenet alatta (piros, nem gradiens) |
| Válaszkártya | fehér, `line` keret | tinta keret, 1 px emelés | 2 px tinta keret | – | – | – |
| Válaszkártya kijelölve | 2 px márka-gradiens keret, `brandTint` háttér, gradiens pipa | ugyanaz | + 2 px tinta fókuszkeret | – | – | – |
| Kedvezménycímke | kedvezmény-gradiens, tinta szöveg | – | – | lejárt: papír háttér, `muted`, áthúzott % | – | – |
| Projekt-csempe (hero) | áttetsző, vonalkeret | márka-gradiens kitöltés, tinta szöveg | ugyanaz + fehér 2 px keret | – | – | – |

## Felhasználói út

| Lépés | Mit csinál | Mit érez | Mit ad a design |
|---|---|---|---|
| 1 | Megérkezik (FB, telefon) | „Ez igényes és barátságos” | hero gömbök + gradiens kiemelő, egy nyelv az első képernyőtől |
| 2 | Görget | „Értem, hogyan megy” | lépések színes gömbjei = 3 lépés, 3 szín |
| 3 | Választ projekttípust | „Könnyű” | gradiens hover, azonnal indul |
| 4 | Kérdőív | „Haladok” | gradiens haladáscsík, gradiens kijelölés |
| 5 | Ajánlat | „Ez az enyém, és megéri” | választott csomag színe, meleg kedvezmény-címke |
| 6 | Dönt vagy elmenti | „Nincs nyomás” | egy fő gradiens gomb + csendes alternatívák |

## NOT in scope
- Új betűtípus vagy tipográfiai skála – a Bricolage + Instrument Sans marad.
- Szövegek átírása – csak vizuális egységesítés.
- A csomagkártyák szerkezete – csak színek és kijelölés.
- Sötét mód – nincs, az oldal világos/sötét szekciói maradnak.
- Új mockupok – a generátor 429-et adott; implementáció után `/gstack-design-review` vizuális QA.

## What already exists (újrahasznosítandó)
- `Blob` / `FluidBlobs` (egyetlen forma-komponens, színátúszással, reduced-motion kezeléssel) – új `tone: "brand"` kell.
- `WaveDivider` (közös hullám), `packageThemes` (csomaggradiensek), `BLOB_GRADIENTS` (már van `discount`).
- `theme.ts` MUI téma: egy helyen cserélhető a `contained` gomb kinézete.

## Implementation Tasks

- [x] **T1 (P1, human: ~3h / CC: ~15min)** — tokenek + téma — márka-, kedvezmény- és új Premium-gradiens; lime/amber/check kivezetése; MUI `contained` gomb és állapotai
  - Surfaced by: D2, D3, D5, D7
  - Files: `src/theme/tokens.ts`, `src/theme/theme.ts`, `src/components/Blob.tsx`
  - Verify: `npm run typecheck && npm test`; grep: nincs `palette.lime` / `palette.amber` felületszínként
- [x] **T2 (P1, human: ~4h / CC: ~20min)** — főoldal — kiemelő, csempék, lépésgömbök, projektsor-pontok, ígéret-sáv gömbje és pipái
  - Surfaced by: D2, D4, D6, D8
  - Files: `src/components/home/*`, `src/app/page.tsx`
  - Verify: böngésző 1440 px és 390 px; nincs vízszintes görgetés; gömb nem takar szöveget
- [x] **T3 (P1, human: ~3h / CC: ~15min)** — kérdőív — haladáscsík, kijelölt kártya, ajánlott címke, oldalsáv
  - Surfaced by: D2, D5
  - Files: `src/features/questionnaire/components/*`
  - Verify: billentyűzettel végigmenni; fókusz látszik a gradiens kereten
- [x] **T4 (P1, human: ~4h / CC: ~20min)** — ajánlatoldal — gombok, kedvezménypanel, kártyák kijelölése, Kérted-címke, Még gondolkodsz gömb, WhatsApp tinta gomb, megosztás-sáv
  - Surfaced by: D2, D3, D4, D5, D6
  - Files: `src/features/offer/components/*`, `src/features/contact/components/*`, `src/app/a/[code]/page.tsx`
  - Verify: ajánlat + megosztott link 1440/390 px; kedvezmény lejárt állapota
- [x] **T5 (P2, human: ~1h / CC: ~10min)** — logó és ikonok — `Logo`, `icon.svg`, `apple-icon`, `opengraph-image`
  - Surfaced by: D9
  - Files: `src/components/Logo.tsx`, `src/app/icon.svg`, `src/app/apple-icon.tsx`, `src/app/opengraph-image.tsx`
  - Verify: `/icon.svg`, `/opengraph-image` megnyitva; FB Sharing Debugger újratöltés élesítés után
- [x] **T6 (P2, human: ~30min / CC: ~5min)** — DESIGN.md — színszerepek, gradiensek, formaszabályok, állapotok frissítése e terv szerint
  - Surfaced by: D2–D9
  - Files: `DESIGN.md`
  - Verify: a táblázat egyezik a `tokens.ts`-sel

## Completion Summary

```
  +====================================================================+
  |         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
  +====================================================================+
  | System Audit         | DESIGN.md van (lime-központú), 3 felület    |
  | Step 0               | 5/10, hatókör: mindhárom felület            |
  | Pass 1  (Info Arch)  | 8/10 → 8/10 (nincs teendő)                 |
  | Pass 2  (States)     | 5/10 → 9/10 after fixes                    |
  | Pass 3  (Journey)    | 8/10 → 9/10 (storyboard rögzítve)          |
  | Pass 4  (AI Slop)    | 6/10 → 8/10 after fixes                    |
  | Pass 5  (Design Sys) | 4/10 → 9/10 after fixes                    |
  | Pass 6  (Responsive) | 6/10 → 9/10 after fixes                    |
  | Pass 7  (Decisions)  | 1 resolved, 0 deferred                     |
  +--------------------------------------------------------------------+
  | NOT in scope         | written (5 items)                           |
  | What already exists  | written                                     |
  | TODOS.md updates     | 0 items proposed                            |
  | Approved Mockups     | 0 generated (OpenAI 429), 0 approved        |
  | Decisions made       | 9 added to plan                             |
  | Decisions deferred   | 0                                           |
  | Overall design score | 4/10 → 8/10                                 |
  +====================================================================+
```

Megjegyzés: a D2–D4 egy hívásban, három külön kérdésként ment ki (a skill szabálya szerint egyenként kellett volna); mindhármat külön megválaszoltad, ezért érvényesek.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Outside Review | — | Independent 2nd opinion | 0 | skipped | kimaradt: a külső hangot nem ajánlottam fel |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 2 | clean | score: 4/10 → 8/10, 9 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **OUTSIDE COVERAGE:** nincs – a külső design-hang lépése kimaradt (nem ajánlottam fel); a mockup-generátor OpenAI 429 miatt 0/3 képet mentett.
- **VERDICT:** DESIGN CLEARED — eng review required

NO UNRESOLVED DECISIONS
