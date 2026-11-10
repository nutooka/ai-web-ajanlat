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
import { defaultOgImage, siteUrl } from "@/config/site";
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
  openGraph: { title, description, url: "/karbantartas", images: [defaultOgImage] },
};

const hostingRows: { label: string; type: keyof typeof maintenance.hostingMonthly }[] = [
  { label: "Céges weboldal", type: "company" },
  { label: "Landing page", type: "landing" },
  { label: "Webshop (Shopify-előfizetés)", type: "webshop" },
  { label: "Webalkalmazás", type: "webapp" },
];

const faq = [
  {
    q: "Kötelező a karbantartás?",
    a: "Nem. Karbantartás nélkül is a tiéd az oldal, ilyenkor csak a tárhelyet és a domaint fizeted. Ajánlani azért ajánlom: egy frissítetlen oldal idővel lassul, hibázik, és sebezhetővé válik.",
  },
  {
    q: "Hogyan tudom lemondani?",
    a: "Egy üzenettel, a következő hónap végével. Nincs hűségidő és nincs lemondási díj.",
  },
  {
    q: "Mi számít módosításnak?",
    a: "Szöveg-, kép- és árcsere, új aloldal vagy blogbejegyzés feltöltése, kisebb design-igazítás. Ha egy kérés több időt igényel, előre megmondom, mennyi.",
  },
  {
    q: "Mi van, ha egy hónapban nem használom ki a módosítási órákat?",
    a: "Nem gyűlnek: a havi keret arra a hónapra szól. Ha tudod, hogy ritkán kérsz módosítást, az Alap csomag elég.",
  },
  {
    q: "Más által készített oldalt is vállalsz?",
    a: "Igen, ha előbb átnézem. Az ingyenes átvilágítás jó kiindulópont: abból látszik, milyen állapotban van az oldal.",
  },
];

export default function MaintenancePage() {
  const h2 = { fontSize: { xs: "1.6rem", md: "2rem" }, mt: 7, mb: 2 } as const;
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
                  <Typography component="h2" sx={{ fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 15 }}>
                    {tier.name}
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
