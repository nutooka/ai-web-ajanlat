import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Adatkezelési tájékoztató",
  description: `${siteConfig.company.legalName} adatkezelési tájékoztatója az ajánlatkérésekhez.`,
};

const { company, privacy } = siteConfig;

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Az adatkezelő",
    body: [
      `${company.legalName}, székhely: ${company.address}, cégjegyzékszám: ${company.registrationNumber}, adószám (CUI): ${company.taxId}.`,
      `Kapcsolat: ${company.email}, ${company.phone}.`,
    ],
  },
  {
    title: "2. Milyen adatokat kezelünk?",
    body: [
      "A kérdőívre adott válaszaidat a saját böngésződben (localStorage) tároljuk, hogy később folytathasd a kitöltést. Ezek a szervereinkre csak akkor jutnak el, ha az ajánlatot elküldöd.",
      "Az ajánlat elküldésekor: a kérdőívre adott válaszokat, a választott csomagot, valamint az általad önkéntesen megadott nevet, e-mail-címet, telefonszámot, cégnevet és megjegyzést. Visszaélések megelőzése érdekében a kérés IP-címét rövid ideig, csak a memóriában kezeljük.",
    ],
  },
  {
    title: "3. Az adatkezelés célja és jogalapja",
    body: [
      "Cél: az ajánlatkérésed megválaszolása, a kapcsolatfelvétel, és – kérésedre – az ajánlat másolatának megküldése.",
      "Jogalap: a hozzájárulásod (GDPR 6. cikk (1) a) pont), illetve a szerződés megkötését megelőző lépések megtétele a kérésedre (GDPR 6. cikk (1) b) pont).",
    ],
  },
  {
    title: "4. Meddig őrizzük az adatokat?",
    body: [
      `Az ajánlatkéréseket legfeljebb ${privacy.retentionMonths} hónapig őrizzük, vagy addig, amíg vissza nem vonod a hozzájárulásodat. Ha szerződés jön létre, a jogszabályban előírt ideig őrizzük.`,
      "A böngésződben tárolt válaszokat bármikor törölheted az „Újrakezdem” gombbal vagy a böngésző adatainak törlésével.",
    ],
  },
  {
    title: "5. Adatfeldolgozók",
    body: [
      "E-mail-küldés: Resend (Resend, Inc.) – az ajánlatkérést e-mailben továbbítja.",
      "Tárhely: Vercel (Vercel Inc.) – a weboldal üzemeltetése.",
      "Az adatfeldolgozók az EU-n kívül is kezelhetnek adatot; ilyenkor az Európai Bizottság általános szerződési feltételei biztosítják a megfelelő védelmet.",
    ],
  },
  {
    title: "6. A jogaid",
    body: [
      "Kérheted az adataidhoz való hozzáférést, azok helyesbítését, törlését, az adatkezelés korlátozását, tiltakozhatsz az adatkezelés ellen, kérheted az adathordozhatóságot, és bármikor visszavonhatod a hozzájárulásodat (ez nem érinti a korábbi adatkezelés jogszerűségét).",
      `Kérésedet a(z) ${company.email} címen jelezheted. Panasszal a romániai adatvédelmi hatósághoz (ANSPDCP, www.dataprotection.ro) fordulhatsz.`,
    ],
  },
  {
    title: "7. Sütik",
    body: ["Ez az oldal nem használ követő vagy marketing sütiket. A kitöltés mentéséhez kizárólag a böngésző helyi tárolóját (localStorage) használjuk."],
  },
];

export default function PrivacyPage() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Container maxWidth="lg" component="header" sx={{ py: 3 }}>
        <Logo />
      </Container>
      <Container component="main" maxWidth="md" sx={{ flex: 1, py: { xs: 4, md: 8 } }}>
        <Typography variant="h2" component="h1" sx={{ mb: 1 }}>
          Adatkezelési tájékoztató
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 6 }}>
          Utolsó frissítés: {privacy.lastUpdated}
        </Typography>
        {sections.map((section) => (
          <Box component="section" key={section.title} sx={{ mb: 5 }}>
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
