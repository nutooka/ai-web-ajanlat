---
name: Nutooka Projekttervező
colors:
  ink: "#0E0F12"
  inkSoft: "#1A1C21"
  paper: "#F5F5F0"
  surface: "#FFFFFF"
  line: "#E4E4DD"
  muted: "#5B5F68"
  brandTint: "#EEF4FF"
  brandOnDark: "#9CC1FF"
  success: "#127A4B"
  cross: "#FF6B81"
gradients:
  brand: "linear-gradient(120deg, #2BD2C9 0%, #3A7BFF 35%, #FF5E7E 70%, #FFB547 100%)"
  discount: "linear-gradient(135deg, #FFD27A 0%, #FFB547 55%, #FF9447 100%)"
  basic: "linear-gradient(135deg, #2BD2C9 0%, #3A7BFF 100%)"
  standard: "linear-gradient(135deg, #FFB547 0%, #FF5E7E 100%)"
  premium: "linear-gradient(135deg, #5BE38A 0%, #10A37F 100%)"
typography:
  display: "Bricolage Grotesque, 650–800"
  body: "Instrument Sans, 400–650"
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  button: 10px
  pill: 999px
shadow:
  raised: "0 18px 40px -24px rgba(14,15,18,.35)"
  raisedOnDark: "0 24px 48px -28px rgba(0,0,0,.7)"
---

# DESIGN.md

A forrás a kódban: `src/theme/tokens.ts` (tokenek) és `src/theme/theme.ts` (MUI téma). Ha itt változtatsz, ott is kell.

## Színszerepek – minden színnek egy jelentése van

Egy nyelv: színes, formás. **Nincs sima (egyszínű) lime vagy borostyán** – a kiemelés mindig gradiens. A gradiens **csak kitöltés**: rajta mindig ink szöveg, soha gradiens szöveg, soha fehér szöveg.

| Szín | Jelentés | Soha |
|---|---|---|
| **Ink** `{colors.ink}` / `{colors.inkSoft}` | Szerkezet: fejléc, hero, sávok. Másodlagos gomb (pl. WhatsApp). | Más sötét árnyalat. |
| **Márka-gradiens** `{gradients.brand}` | A képernyő **egyetlen** fő gombja; „a te választásod” (2 px gradiens keret + `{colors.brandTint}` háttér, gradiens pipa); kiemelő a főcímben; haladáscsík; logó. | Szöveg színe; egy képernyőn két fő gomb. |
| **Csomag-gradiensek** `{gradients.basic/standard/premium}` | Csomagidentitás (kártyafejléc, csomaggömb) + a 3 lépés (kék → narancs → smaragd). | Nem csomag-jelentésű gomb. |
| **Kedvezmény-gradiens** `{gradients.discount}` | Kedvezmény és idő: címkék, visszaszámláló, kedvezménypanel kerete. | Gomb vagy akció. |
| **brandOnDark** `{colors.brandOnDark}` | Apró ikon sötét háttéren (pipa az oldalsávban). | Folyó szöveg. |
| **Paper / surface / line / muted** | Tartalom, info-jegyzetek. | — |

Gradiens keret: `border: 2px solid transparent; background: linear-gradient(<háttér>, <háttér>) padding-box, <gradiens> border-box`.

## Liquid motívum

- **Hullámvonal** (`WaveDivider`): ugyanaz a görbe minden sötét ↔ világos határon; a vonal a márka-gradiens.
- **Folyékony formák** (`Blob`, `FluidBlobs`, `SectionBlob`):
  | Tónus | Jelentés | Hol |
  |---|---|---|
  | kék / narancs / smaragd | Basic / Standard / Premium (és a 3 lépés) | kezdőlap hero, lépésszámok, ajánlat hero sarka, egyeztetés-űrlap címkéje |
  | `discount` | kedvezmény és idő | kedvezménypanel fejléce (zsugorodik), sticky sáv |
  | `neutral` | még formálódik | kérdőív oldalsáv → végül az ajánlott csomag színe |
  | `brand` | díszítés | **szekciónként legfeljebb egy** `SectionBlob`, a szélen levágva; projektsorok kis pontja |
- **Soha** szöveg, ár, űrlapmező vagy válaszkártya mögött. Képernyőnként max. **egy mozgó** forma; a szekció-formák állnak.
- Telefonon (`xs`) a szekció-forma 50%-os, a jobb felső sarokból lóg be a cím fölött. `prefers-reduced-motion`: semmi nem mozog.

## Állapotok

| Elem | Alap | Hover | Fókusz | Letiltva (`disabled` vagy `aria-disabled`) |
|---|---|---|---|---|
| Fő gomb | márka-gradiens, ink szöveg | a gradiens elcsúszik | 2 px ink, 3 px eltolás | paper háttér, muted szöveg, gradiens nélkül |
| Válaszkártya | fehér, line keret | ink keret, emelés | 2 px ink | – |
| Válaszkártya kijelölve | 2 px gradiens keret, brandTint, gradiens pipa | emelés | + ink fókusz | – |
| Kedvezménycímke | kedvezmény-gradiens, ink szöveg | – | – | lejárt: paper, áthúzva |

## Kiemelések

- Kezdőlap: Standard „Legnépszerűbb”.
- Ajánlatoldal: „Neked ajánlott” címke + a választott kártya 4 px-es márka-gradiens kerete és gradiens „Kiválasztva” gomb. Nincs nagyítás, nincs színes glow.

## Mozgás

- Egy szerzői pillanat oldalanként (kezdőlap: márka-gradiens kiemelő a főcím mögött).
- Görgetésre megjelenés (`.reveal`) csak CSS scroll-timeline-nal; támogatás nélkül a tartalom látszik.
- Automatikus váltás (előnézet) legfeljebb egy kör, érintés/fókusz megállítja.

## Akadálymentesség

- Minden kattintható ≥ 44 px; minden szöveg ≥ 4,5:1 kontraszt.
- Fókuszgyűrű: 2 px ink, 3 px eltolás; gradiens gombon is látható. Tinta szöveg minden gradiensen ≥ 4,5:1.
- Űrlap: kötelező mezők előre jelezve, hibánál fókusz az első hibás mezőre.
- Árváltozás és mentés `aria-live`-val bejelentve.

## Komponensek

`SiteHeader` · `SiteFooter` · `WaveDivider` · `Blob` · `FluidBlobs` · `SectionBlob` · `DiscountsPanel` · `PricingCards` · `OptionCard` · `StickyCta` · `OfferDetails`
