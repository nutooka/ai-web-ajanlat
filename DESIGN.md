---
name: Nutooka Projekttervező
colors:
  ink: "#0E0F12"
  inkSoft: "#1A1C21"
  paper: "#F5F5F0"
  surface: "#FFFFFF"
  line: "#E4E4DD"
  muted: "#5B5F68"
  lime: "#D4FF3A"
  limeHover: "#C6F22B"
  limeTint: "#F3FBD6"
  amber: "#FFB547"
  success: "#127A4B"
  check: "#7BE495"
  cross: "#FF6B81"
gradients:
  basic: "linear-gradient(135deg, #2BD2C9 0%, #3A7BFF 100%)"
  standard: "linear-gradient(135deg, #FFB547 0%, #FF5E7E 100%)"
  premium: "linear-gradient(135deg, #D4FF3A 0%, #2BD98A 100%)"
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

| Szín | Jelentés | Soha |
|---|---|---|
| **Ink** `{colors.ink}` / `{colors.inkSoft}` | Szerkezet: fejléc, hero, sávok, kiválasztott keret. `inkSoft` = emelt felület sötéten. | Más sötét árnyalat (nincs lilás fekete). |
| **Lime** `{colors.lime}` | A képernyő **egyetlen** fő gombja + „a te választásod” (kijelölés kitöltése, pipa). | Szöveg fehér háttéren; info/figyelmeztetés; szekcióháttér kiemelésként. |
| **Csomag-gradiensek** `{gradients.*}` | Csak csomagidentitás: kártyafejléc, csomagcímke/pötty, + a liquid formák. Mindig **ink szöveg** rajtuk. | Címszöveg gradienssel; gradiensek keverése; nem csomag-specifikus gomb. |
| **Borostyán** `{colors.amber}` | Kedvezmény és idő (visszaszámláló, kedvezménycímke). | Gomb vagy akció. |
| **Paper / surface / line / muted** | Tartalom, info-jegyzetek (semleges + ikon). | — |

## Liquid motívum

- **Hullámvonal** (`WaveDivider`): ugyanaz a görbe minden sötét ↔ világos szekcióhatáron (kezdőlap hero, ajánlat hero, kérdőív fejléc, adatkezelés fejléc, csomag-szekció). Csomagkártya-fejléc alja hullámos.
- **Folyékony formák** (`Blob`, `FluidBlobs`): egyetlen közös komponens. **A színe mindig jelent valamit**, különben nem kerül oda:
  | Szín | Jelentés | Hol |
  |---|---|---|
  | kék / narancs / zöld | Basic / Standard / Premium csomag | kezdőlap hero (a kártyán látható csomag gömbje nő és előre jön), ajánlat hero sarka (a választott csomag), egyeztetés-űrlap címkéje |
  | borostyán (`discount`) | kedvezmény és idő | kedvezménypanel fejléce (a gyors döntés idejével együtt zsugorodik), ragadós sáv kedvezmény-jele |
  | áttetsző fehér (`neutral`) | még formálódik | kérdőív oldalsáv: a kitöltéssel nő, a végén az ajánlott csomag színét veszi fel |
  - Nincs gömb a referencia-, GYIK- és szöveges részekben. Méret = érték (haladás, hátralévő idő, kiemelés). Színváltáskor áttűnés. `prefers-reduced-motion` esetén nincs lebegés.
- **Soha** szöveg, ár, űrlapmező vagy válaszkártya mögött. Képernyőnként max. **egy** mozgó forma. `prefers-reduced-motion`: áll.
- Kérdőív haladás: hullámos lime vonal.

## Kiemelések

- Kezdőlap: Standard „Legnépszerűbb”.
- Ajánlatoldal: csak „Neked ajánlott” címke + kiválasztott lime keret és „Kiválasztva” gomb. Nincs nagyítás, nincs színes glow.

## Mozgás

- Egy szerzői pillanat oldalanként (kezdőlap: lime kiemelő a főcím mögött).
- Görgetésre megjelenés (`.reveal`) csak CSS scroll-timeline-nal; támogatás nélkül a tartalom látszik.
- Automatikus váltás (előnézet) legfeljebb egy kör, érintés/fókusz megállítja.

## Akadálymentesség

- Minden kattintható ≥ 44 px; minden szöveg ≥ 4,5:1 kontraszt.
- Fókuszgyűrű: 2 px ink, 3 px eltolás; lime gombon is látható.
- Űrlap: kötelező mezők előre jelezve, hibánál fókusz az első hibás mezőre.
- Árváltozás és mentés `aria-live`-val bejelentve.

## Komponensek

`SiteHeader` · `SiteFooter` · `WaveDivider` · `Blob` · `FluidBlobs` · `DiscountsPanel` · `PricingCards` · `OptionCard` · `StickyCta` · `OfferDetails`
