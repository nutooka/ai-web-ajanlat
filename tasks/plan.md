# Megvalósítási terv (SPEC.md alapján)

## Sorrend (függőségek szerint)
1. **Váz** – create-next-app (TS, App Router, src/), függőségek, Vitest, MUI téma, layout.
2. **Kérdőív config + engine** – típusok, ágak, `getVisibleSteps`, validáció. Tesztek.
3. **Pricing** – `config/pricing.ts` + `calculateQuote` kedvezményekkel. Tesztek.
4. **Offer** – `buildOffer` (összefoglaló, tech, benne van/nincs, lépések) + AI interfész szabályalapú provideral. Tesztek.
5. **Wizard UI** – kezdőlap, `/tervezo`, autosave, animációk, billentyűzet.
6. **Ajánlatoldal** – `/ajanlat`, csomagválasztó, tételes tábla, nyomtatás.
7. **Kapcsolat** – űrlap, `/api/offer`, Zod, spam, Resend sablonok, `/adatkezeles`. Tesztek.
8. **Ellenőrzés** – build/lint/typecheck/test, böngészős végigkattintás 6 útvonalon, 390px + 1440px.

## Kockázatok
- MUI + App Router SSR stílus: `@mui/material-nextjs` AppRouterCacheProvider.
- Hydration eltérés a localStorage miatt: állapot betöltése csak mount után, addig skeleton.
- Rate limit serverless-en csak best-effort (memória) – SPEC-ben elfogadva.

## Ellenőrzőpontok
- 3. után: minden engine teszt zöld.
- 6. után: teljes útvonal böngészőben.
- 8. után: sikerkritériumok (SPEC §10).
