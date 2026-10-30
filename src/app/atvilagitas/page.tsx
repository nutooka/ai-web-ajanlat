import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SectionBlob } from "@/components/SectionBlob";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WaveDivider } from "@/components/WaveDivider";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { siteUrl, defaultOgImage } from "@/config/site";
import { AuditTool } from "@/features/audit/AuditTool";
import { palette } from "@/theme/tokens";

const title = "Ingyenes weboldal-átvilágítás – sebesség, mobil, Google";
const description =
  "Írd be a weboldalad címét, és 30 másodperc alatt megtudod, mennyire gyors telefonon, hogyan látszik a Google-ben, és mi a 3 legfontosabb javítanivaló. Ingyenes, regisztráció nélkül.";

export const metadata: Metadata = {
  title: { absolute: `${title} | Nutooka` },
  description,
  alternates: { canonical: "/atvilagitas" },
  openGraph: { title, description, url: "/atvilagitas", images: [defaultOgImage] },
};

const faq = [
  { q: "Mit mér az átvilágítás?", a: "A Google PageSpeed telefonos mérését futtatja le: sebességet, Google-megjelenést (SEO), akadálymentességet és biztonságot, majd magyarul elmagyarázza a legfontosabb hibákat." },
  { q: "Tényleg ingyenes?", a: "Igen, és nem kell regisztrálni. Ha kéred, a teljes jelentést e-mailben is elküldjük, személyes javaslattal." },
  { q: "Mit tegyek, ha gyenge lett az eredmény?", a: "A legtöbb hiba javítható. A felújítási kérdőívvel 3 perc alatt kiszámolod, mennyibe kerülne." },
];

export default function AuditPage() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebApplication", name: "Ingyenes weboldal-átvilágítás", url: `${siteUrl}/atvilagitas`, applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: 0, priceCurrency: "RON" }, provider: { "@id": `${siteUrl}/#business` } },
            { "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
          ],
        }}
      />
      <Box sx={{ background: palette.ink, color: "#fff", position: "relative", overflow: "hidden" }}>
        <SiteHeader />
        <SectionBlob tone="basic" position={{ top: 60, right: -140 }} />
        <Container maxWidth="lg" component="section" sx={{ position: "relative", zIndex: 1, pt: { xs: 5, md: 9 }, pb: { xs: 8, md: 11 } }}>
          <Typography variant="h1" sx={{ maxWidth: 820, fontSize: { xs: "2.25rem", md: "3.75rem" } }}>
            Ingyenes weboldal-átvilágítás
          </Typography>
          <Typography sx={{ mt: 3, maxWidth: 640, color: palette.inkMuted, fontSize: { xs: "1.0625rem", md: "1.25rem" }, lineHeight: 1.55 }}>
            Írd be a weboldalad címét: 30 másodperc alatt megtudod, mennyire gyors telefonon, hogyan látja a Google, és mi a 3 legfontosabb javítanivaló.
          </Typography>
        </Container>
      </Box>
      <WaveDivider from={palette.ink} to={palette.paper} />

      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <AuditTool />
        </Container>
        <Container maxWidth="lg" component="section" sx={{ pb: { xs: 6, md: 8 } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" }, mb: 3 }}>
            Gyakori kérdések
          </Typography>
          {faq.map((item) => (
            <Box key={item.q} sx={{ mb: 2.5, maxWidth: 760 }}>
              <Typography variant="h3" sx={{ fontSize: "1.125rem", mb: 0.5 }}>
                {item.q}
              </Typography>
              <Typography color="text.secondary">{item.a}</Typography>
            </Box>
          ))}
        </Container>
      </Box>
      <WhatsAppFab context="átvilágítás" />
      <SiteFooter />
    </Box>
  );
}
