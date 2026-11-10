import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { WaveDivider } from "@/components/WaveDivider";
import { palette } from "@/theme/tokens";
import { SiteFooter } from "@/components/SiteFooter";
import { defaultOgImage, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Adatkezelési tájékoztató",
  description: `${siteConfig.company.legalName} adatkezelési tájékoztatója az ajánlatkérésekhez.`,
  alternates: { canonical: "/adatkezeles" },
  openGraph: {
    title: "Adatkezelési tájékoztató",
    description: `${siteConfig.company.legalName} adatkezelési tájékoztatója az ajánlatkérésekhez.`,
    url: "/adatkezeles",
    images: [defaultOgImage],
  },
};

const { company, privacy } = siteConfig;

const sections: { title: string; id?: string; body: string[] }[] = [
  {
    title: "1. Az adatkezelő",
    body: [
      `${company.legalName}, székhely: ${company.address}, EUID / cégjegyzékszám: ${company.registrationNumber}, adószám (CUI): ${company.taxId}.`,
      ...(company.email || company.phone ? [`Kapcsolat: ${[company.email, company.phone].filter(Boolean).join(", ")}.`] : []),
    ],
  },
  {
    title: "2. Milyen adatokat kezelünk?",
    body: [
      "A kérdőívre adott válaszaidat a saját böngésződben (localStorage) tároljuk, hogy később folytathasd a kitöltést. Ezek a szervereinkre csak akkor jutnak el, ha az ajánlatot elküldöd.",
      "Az ajánlat elküldésekor: a kérdőívre adott válaszokat, a választott csomagot, valamint az általad önkéntesen megadott nevet, e-mail-címet, telefonszámot, cégnevet és megjegyzést. Visszaélések megelőzése érdekében a kérés IP-címét rövid ideig, csak a memóriában kezeljük.",
      "A főoldali „Kérdezz tőlem” űrlapon megadott telefonszámot vagy e-mail-címet és az üzenetet e-mailben továbbítjuk nekem, kizárólag a válaszadáshoz.",
      "Az ingyenes weboldal-átvilágításnál a megadott weboldal-címet a Google PageSpeed Insights szolgáltatásnak továbbítjuk mérésre. Ha a teljes jelentést kéred, az e-mail-címedet a jelentés elküldésére és a személyes javaslatunkhoz használjuk.",
      "A gyors döntés kedvezmény ismételt igénylésének kiszűrésére a megadott telefonszámból, illetve e-mail-címből titkos kulccsal képzett, visszafejthetetlen lenyomatot és az ajánlat első megnyitásának időpontját tároljuk. Magát a telefonszámot vagy e-mail-címet ebben a tárolóban nem őrizzük.",
      "Utánkövető levelek: ha ajánlatkéréskor vagy az átvilágítás jelentéséhez e-mail-címet adsz meg, legfeljebb 3 rövid, az ajánlatodhoz vagy az átvilágításodhoz kapcsolódó levelet küldünk (ajánlatnál 7, átvilágításnál 28 napon belül). Minden levél alján egy kattintással leiratkozhatsz, ekkor a még el nem küldött leveleket töröljük. Hírlevelet nem küldünk.",
    ],
  },
  {
    title: "3. Az adatkezelés célja és jogalapja",
    body: [
      "Cél: az ajánlatkérésed megválaszolása, a kapcsolatfelvétel, és – kérésedre – az ajánlat másolatának megküldése.",
      "Jogalap: a hozzájárulásod (GDPR 6. cikk (1) a) pont), illetve a szerződés megkötését megelőző lépések megtétele a kérésedre (GDPR 6. cikk (1) b) pont).",
      "Az utánkövető levelek jogalapja a jogos érdekünk (GDPR 6. cikk (1) f) pont): a kért ajánlattal vagy átvilágítással kapcsolatos, rövid ideig tartó tájékoztatás. Ez ellen bármikor tiltakozhatsz a levelek alján lévő leiratkozó linkkel.",
    ],
  },
  {
    title: "4. Meddig őrizzük az adatokat?",
    body: [
      `Az ajánlatkéréseket legfeljebb ${privacy.retentionMonths} hónapig őrizzük, vagy addig, amíg vissza nem vonod a hozzájárulásodat. Ha szerződés jön létre, a jogszabályban előírt ideig őrizzük.`,
      "A böngésződben tárolt válaszokat bármikor törölheted az „Újrakezdem” gombbal vagy a böngésző adatainak törlésével.",
      "A kedvezmény-ellenőrzéshez tárolt lenyomat és időpont 30 nap után automatikusan törlődik.",
      "Az átvilágítás eredményét (a weboldal címével, személyes adat nélkül) 24 óráig tároljuk, hogy ne kelljen újra lefuttatni.",
      "Az ajánlat-kódhoz (pl. nutooka.tech/a/K7M3QX) a kérdőívre adott válaszaidat és a választott csomagot 180 napig tároljuk, elérhetőségek nélkül. Aki ismeri a kódot, megnyithatja ezt az ajánlatot.",
      "Hogy a gyors döntés kedvezmény ne induljon újra privát ablakban, az ajánlat első megnyitásának időpontját az IP-címed és a böngésződ típusának visszafejthetetlen lenyomatához (hash) kötve 7 napig tároljuk. Magát az IP-címet nem tároljuk.",
    ],
  },
  {
    title: "5. Adatfeldolgozók",
    body: [
      "E-mail-küldés: Resend (Resend, Inc.) – az ajánlatkérést e-mailben továbbítja, és az ütemezett utánkövető leveleket a küldésig tárolja.",
      "Tárhely: Vercel (Vercel Inc.) – a weboldal üzemeltetése.",
      "Weboldal-mérés: Google PageSpeed Insights (Google LLC) – az átvilágításhoz megadott weboldal-cím mérése.",
      "Látogatottsági statisztika: Vercel Web Analytics – süti nélkül, összesített, névtelen adatokat gyűjt (pl. megtekintett oldalak, ország, eszköztípus); személy azonosítására nem alkalmas.",
      "Kulcs-érték tároló: Upstash (Upstash, Inc.) – a kedvezmény-ellenőrzéshez használt lenyomatok 30 napos tárolása, illetve az ütemezett utánkövető levelek azonosítóinak (e-mail-cím nélkül) legfeljebb 30 napos tárolása a leiratkozáshoz.",
      "Az adatfeldolgozók az EU-n kívül is kezelhetnek adatot; ilyenkor az Európai Bizottság általános szerződési feltételei biztosítják a megfelelő védelmet.",
    ],
  },
  {
    title: "6. A jogaid",
    body: [
      "Kérheted az adataidhoz való hozzáférést, azok helyesbítését, törlését, az adatkezelés korlátozását, tiltakozhatsz az adatkezelés ellen, kérheted az adathordozhatóságot, és bármikor visszavonhatod a hozzájárulásodat (ez nem érinti a korábbi adatkezelés jogszerűségét).",
      `${company.email ? `Kérésedet a(z) ${company.email} címen vagy` : "Kérésedet"} a székhelyünkre küldött levélben jelezheted. Panasszal a romániai adatvédelmi hatósághoz (ANSPDCP, www.dataprotection.ro) fordulhatsz.`,
    ],
  },
  {
    title: "7. Sütik",
    id: "sutik",
    body: [
      "Ez az oldal nem használ követő vagy marketing sütiket. A kitöltés mentéséhez a böngésző helyi tárolóját (localStorage) használjuk.",
      "Egyetlen, a szolgáltatáshoz szükséges sütit állítunk be (nutooka_offer_clock): ez rögzíti, mikor nyitottad meg először az ajánlatodat, hogy a gyors döntés kedvezményt helyesen számoljuk. Személyes adatot nem tartalmaz, 7 nap után lejár, és bármikor törölheted.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <WaveDivider from={palette.ink} to={palette.paper} height={48} />
      <Container component="main" maxWidth="md" sx={{ flex: 1, py: { xs: 4, md: 8 } }}>
        <Typography variant="h2" component="h1" sx={{ mb: 1 }}>
          Adatkezelési tájékoztató
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 6 }}>
          Utolsó frissítés: {privacy.lastUpdated}
        </Typography>
        {sections.map((section) => (
          <Box component="section" key={section.title} id={section.id} sx={{ mb: 5, scrollMarginTop: 96 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
              {section.title}
            </Typography>
            {section.body.map((paragraph) => (
              <Typography key={paragraph} sx={{ mb: 1.5 }} color="text.secondary">
                {paragraph}
              </Typography>
            ))}
          </Box>
        ))}
      </Container>
      <SiteFooter />
    </Box>
  );
}
