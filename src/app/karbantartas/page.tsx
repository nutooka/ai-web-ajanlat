import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { LinkButton } from "@/components/LinkButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WaveDivider } from "@/components/WaveDivider";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { pricingConfig } from "@/config/pricing";
import { siteUrl, baseOpenGraph } from "@/config/site";
import { PACKAGE_IDS } from "@/features/pricing/types";
import { formatRon } from "@/lib/format";
import { packageThemes, palette } from "@/theme/tokens";

const { maintenance } = pricingConfig;
const from = formatRon(maintenance.support.basic.monthly);

const title = "Weboldal karbantartás havidíjjal";
const description = `Frissítések, mentések és módosítások havidíjjal, ${from}/hótól. Az első hónap ingyen, havonta lemondható.`;

export const metadata: Metadata = {
  title: { absolute: `${title} – ${from}/hótól | Nutooka` },
  description,
  alternates: { canonical: "/karbantartas" },
  openGraph: { ...baseOpenGraph, title, description, url: "/karbantartas" },
};

const hostingRows: { label: string; type: keyof typeof maintenance.hostingMonthly }[] = [
  { label: "Céges weboldal", type: "company" },
  { label: "Landing page", type: "landing" },
  { label: "Webshop (Shopify-előfizetés)", type: "webshop" },
  { label: "Webalkalmazás", type: "webapp" },
];

const why = [
  "Egy weboldal nem kész termék, amit egyszer leteszel és elfelejtesz. A mögötte futó rendszerek, könyvtárak és a tárhely folyamatosan frissülnek, a böngészők változnak, és ami ma hibátlanul működik, fél év múlva lassulhat vagy hibázhat.",
  "A frissítetlen oldal a leggyakoribb oka annak, hogy egy kisvállalkozás honlapja egyszer csak nem töltődik be, eltűnik egy űrlap, vagy a Google figyelmeztet, hogy az oldal nem biztonságos. Ilyenkor az ügyfél nem ír, hanem továbblép a versenytárshoz.",
  "A karbantartással ezt mi figyeljük helyetted: frissítjük a rendszert, mentést készítünk, és ha valami elromlik, nem neked kell fejlesztőt keresned. A módosítási kerettel pedig az árlista, a nyitvatartás vagy egy új szolgáltatás pár nap alatt kint van az oldalon, anélkül hogy külön ajánlatot kérnél.",
];

const month = [
  "Frissítjük a rendszert és a felhasznált könyvtárakat, és utána ellenőrizzük, hogy minden oldal, űrlap és fizetés rendben működik.",
  "Mentést készítünk az oldalról és a tartalomról, hogy baj esetén pár perc alatt vissza lehessen állni.",
  "Ha módosítási keret is van a csomagban, a kéréseidet e-mailben vagy WhatsAppon küldöd, mi pedig elvégezzük, és szólunk, amikor kint van.",
  "Ha valami elromlik (lejár egy tanúsítvány, leáll egy külső szolgáltatás), nem neked kell kideríteni, mi a baj: mi javítjuk.",
];

const which = [
  { who: "Alap:", text: "ha az oldal ritkán változik (bemutatkozó oldal, landing page), és csak azt szeretnéd, hogy biztonságos, gyors és működő maradjon." },
  { who: "Standard:", text: "ha havonta egyszer-kétszer cserélnél szöveget, árat vagy képet, vagy új aloldalt tennél fel. A legtöbb céges oldalnak ez elég." },
  { who: "Premium:", text: "webshopnak vagy webalkalmazásnak, ahol rendszeresen jön új funkció, akció vagy termék, és fontos, hogy a kéréseid gyorsan sorra kerüljenek." },
];

const faq = [
  {
    q: "Kötelező a karbantartás?",
    a: "Nem. Karbantartás nélkül is a tiéd az oldal, ilyenkor csak a tárhelyet és a domaint fizeted. Ajánlani azért ajánljuk: egy frissítetlen oldal idővel lassul, hibázik, és sebezhetővé válik.",
  },
  {
    q: "Hogyan tudom lemondani?",
    a: "Egy üzenettel, a következő hónap végével. Nincs hűségidő és nincs lemondási díj.",
  },
  {
    q: "Mi számít módosításnak?",
    a: "Szöveg-, kép- és árcsere, új aloldal vagy blogbejegyzés feltöltése, kisebb design-igazítás. Ha egy kérés több időt igényel, előre megmondjuk, mennyi.",
  },
  {
    q: "Mi van, ha egy hónapban nem használom ki a módosítási órákat?",
    a: "Nem gyűlnek: a havi keret arra a hónapra szól. Ha tudod, hogy ritkán kérsz módosítást, az Alap csomag elég.",
  },
  {
    q: "Más által készített oldalt is vállaltok?",
    a: "Igen, ha előbb átnézhetjük. Az ingyenes átvilágítás jó kiindulópont: abból látszik, milyen állapotban van az oldal.",
  },
];

export default function MaintenancePage() {
  const h2 = { fontSize: { xs: "1.6rem", md: "2rem" }, mt: 7, mb: 2 } as const;
  const p = { mb: 2, fontSize: "1.0625rem", lineHeight: 1.7 } as const;
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              name: "Weboldal karbantartás",
              description,
              provider: { "@id": `${siteUrl}/#business` },
              areaServed: "Erdély",
              offers: PACKAGE_IDS.map((id) => ({
                "@type": "Offer",
                name: `${maintenance.support[id].name} karbantartás`,
                priceSpecification: { "@type": "UnitPriceSpecification", price: maintenance.support[id].monthly, priceCurrency: "RON", unitText: "hónap" },
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Főoldal", item: siteUrl },
                { "@type": "ListItem", position: 2, name: "Karbantartás", item: `${siteUrl}/karbantartas` },
              ],
            },
            { "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
          ],
        }}
      />
      <Box sx={{ background: palette.ink, color: "#fff" }}>
        <SiteHeader />
        <Container maxWidth="lg" component="header" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 7, md: 9 } }}>
          <Typography variant="overline" sx={{ color: palette.inkMuted }}>
            Karbantartás · {from}/hótól
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: "2.1rem", md: "3.25rem" }, mt: 1, maxWidth: 820 }}>
            Weboldal karbantartás havidíjjal
          </Typography>
          <Typography sx={{ mt: 2, fontSize: { xs: "1.25rem", md: "1.5rem" }, fontWeight: 600, maxWidth: 720 }}>
            Az oldalad akkor is rendben marad, amikor nem foglalkozol vele.
          </Typography>
          <Typography sx={{ mt: 2, fontSize: "1.125rem", color: palette.inkMuted, maxWidth: 680 }}>
            Frissítések, mentések, és ha kell, módosítások havidíjért. {maintenance.firstMonthFree ? "Az első hónap ingyen, " : ""}havonta lemondható, hűségidő
            nélkül.
          </Typography>
        </Container>
      </Box>
      <WaveDivider from={palette.ink} to={palette.paper} />

      <Container maxWidth="lg" component="main" sx={{ flex: 1, py: { xs: 5, md: 7 } }}>
        <Typography variant="h2" sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, mb: 3 }}>
          Karbantartási csomagok
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
          {PACKAGE_IDS.map((id) => {
            const tier = maintenance.support[id];
            const recommended = id === "standard";
            return (
              <Box
                key={id}
                sx={{ borderRadius: 4, overflow: "hidden", background: palette.surface, border: recommended ? 2 : 1, borderColor: recommended ? palette.ink : "divider", display: "flex", flexDirection: "column" }}
              >
                <Box sx={{ background: packageThemes[id].gradient, color: palette.ink, px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography component="h3" sx={{ fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 15 }}>
                    {tier.name} karbantartás
                  </Typography>
                  {recommended && (
                    <Box component="span" sx={{ px: 1.25, py: 0.25, borderRadius: 999, background: palette.ink, color: "#fff", fontSize: 12, fontWeight: 700 }}>
                      Leggyakoribb
                    </Box>
                  )}
                </Box>
                <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40, lineHeight: 1 }}>
                    {formatRon(tier.monthly)}
                    <Box component="span" sx={{ fontSize: 16, fontWeight: 600, color: "text.secondary" }}>
                      /hó
                    </Box>
                  </Typography>
                  {maintenance.firstMonthFree && (
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: "success.main" }}>
                      Az első hónap ingyen
                    </Typography>
                  )}
                  <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, mt: 2.5, display: "grid", gap: 1.25 }}>
                    {tier.includes.map((line) => (
                      <Box component="li" key={line} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                        <Check fontSize="small" sx={{ mt: 0.25, color: "success.main" }} />
                        <Typography>{line}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Container maxWidth="md" disableGutters>
          <Typography variant="h2" sx={h2}>
            Miért kell egy weboldalt karbantartani?
          </Typography>
          {why.map((text) => (
            <Typography key={text} sx={p}>
              {text}
            </Typography>
          ))}

          <Typography variant="h2" sx={h2}>
            Hogyan zajlik egy hónap?
          </Typography>
          <Box component="ol" sx={{ pl: 2.5, m: 0, mb: 2, "& li": { mb: 1.5, fontSize: "1.0625rem", lineHeight: 1.7 } }}>
            {month.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </Box>

          <Typography variant="h2" sx={h2}>
            Melyik csomag kell neked?
          </Typography>
          {which.map((item) => (
            <Typography key={item.who} sx={p}>
              <b>{item.who}</b> {item.text}
            </Typography>
          ))}

          <Typography variant="h2" sx={h2}>
            Mit fizetsz még mellette?
          </Typography>
          <Typography sx={{ mb: 2, fontSize: "1.0625rem", lineHeight: 1.7 }}>
            A karbantartástól függetlenül a tárhely és a domain minden oldalnál kell. Ezeket a kérdőív az ajánlatodban is külön mutatja.
          </Typography>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& td": { py: 1.25, borderBottom: 1, borderColor: "divider" } }}>
            <tbody>
              {hostingRows.map((row) => (
                <tr key={row.type}>
                  <td>{row.label}</td>
                  <Box component="td" sx={{ textAlign: "right", fontWeight: 700 }}>
                    kb. {formatRon(maintenance.hostingMonthly[row.type])}/hó
                  </Box>
                </tr>
              ))}
              <tr>
                <td>Domain (pl. cegnev.ro)</td>
                <Box component="td" sx={{ textAlign: "right", fontWeight: 700 }}>
                  kb. {formatRon(maintenance.domainYearly)}/év
                </Box>
              </tr>
            </tbody>
          </Box>

          <Typography variant="h2" sx={h2}>
            Gyakori kérdések
          </Typography>
          {faq.map((item) => (
            <Box key={item.q} sx={{ mb: 3 }}>
              <Typography variant="h5" component="h3" sx={{ mb: 0.75 }}>
                {item.q}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item.a}
              </Typography>
            </Box>
          ))}

          <Box sx={{ mt: 6, p: { xs: 3, md: 4 }, borderRadius: 4, background: palette.ink, color: "#fff" }}>
            <Typography variant="h3" sx={{ fontSize: { xs: "1.5rem", md: "1.875rem" }, mb: 1 }}>
              Új oldalt terveztetsz?
            </Typography>
            <Typography sx={{ color: palette.inkMuted, mb: 3 }}>
              A kérdőív végén a karbantartás havidíja is benne van az ajánlatodban. Meglévő oldalnál kezdd az{" "}
              <Link href="/atvilagitas" style={{ color: "#fff" }}>
                ingyenes átvilágítással
              </Link>
              .
            </Typography>
            <LinkButton href="/tervezo" variant="contained" color="primary" size="large">
              Megtervezem a projektem
            </LinkButton>
          </Box>
        </Container>
      </Container>
      <SiteFooter />
      <WhatsAppFab />
    </Box>
  );
}
