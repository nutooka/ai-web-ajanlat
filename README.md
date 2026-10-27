# Nutooka Projekttervező

Interaktív ajánlatkészítő: a látogató egy lépésenként haladó kérdőíven leírja a projektjét, és azonnal tételes, becsült árajánlatot kap három csomagban (Basic / Standard / Premium). A specifikáció: [SPEC.md](SPEC.md).

## Indítás

```bash
npm install
cp .env.example .env.local   # Resend kulcs és címek
npm run dev                  # http://localhost:3000
```

## Parancsok

| Parancs | Mit csinál |
|---|---|
| `npm run dev` | Fejlesztői szerver |
| `npm run build` / `npm start` | Production build és futtatás |
| `npm test` | Unit tesztek (Vitest) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |

## Hol mit módosíts

| Mit | Fájl |
|---|---|
| Árak, óradíj, szorzók, **kedvezmények**, fenntartás, rejtett `productivityFactor` | `src/config/pricing.ts` |
| Cégadatok, oldalnév | `src/config/site.ts` |
| Kérdések és opciók | `src/features/questionnaire/config/` |
| Színek, betűk | `src/theme/theme.ts` |

Az árazó motor (`src/features/pricing/engine.ts`) tiszta, determinisztikus függvény; a szerver beküldéskor mindig újraszámolja az árat a válaszokból.

## E-mail (Resend)

1. Regisztrálj a resend.com-on, hozz létre API kulcsot → `RESEND_API_KEY`.
2. `OFFER_OWNER_EMAIL` = ide jönnek az ajánlatkérések.
3. Saját domain nélkül az `onboarding@resend.dev` feladó **csak a Resend-fiókod saját címére** tud küldeni, így az ügyfélmásolat csak a domain hitelesítése után működik.

Kulcs nélkül az app működik, a küldés gomb érthető hibaüzenetet ad.

## Későbbi AI-bővítés

`src/lib/ai/` – `InsightProvider` interfész, jelenleg szabályalapú implementációval. Egy Claude-alapú provider ide köthető be, az árazás érintése nélkül.
