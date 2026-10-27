import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LinkButton } from "@/components/LinkButton";
import { HeroActions } from "@/components/home/HeroActions";
import { OfferPreview } from "@/components/home/OfferPreview";
import { ProjectTypeGrid } from "@/components/home/ProjectTypeGrid";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { pricingConfig } from "@/config/pricing";
import { palette } from "@/theme/tokens";

const steps = [
  { title: "Válaszolj néhány kérdésre", text: "Egyszerre csak egy kérdés, szakszavak nélkül, tippekkel. A válaszaid automatikusan mentődnek." },
  { title: "Kapd meg az ajánlatod azonnal", text: "Tételes kalkuláció három csomagban, fejlesztési idővel és fenntartási költséggel." },
  { title: "Egyeztessünk, ha tetszik", text: "Egy kattintással elküldöd, mi pedig 1 munkanapon belül jelentkezünk." },
];

const benefits = [
  { title: "Tételes, átlátható ár", text: "Minden sor mögött látszik a munkaóra – nincsenek rejtett tételek." },
  { title: "Valós fejlesztési idő", text: "Hetekben megadott átfutás, a határidődhöz igazítva." },
  { title: "Fenntartási költségek is", text: "Tárhely, domain, karbantartás – előre tudod, mivel számolj." },
  { title: "Technológiai javaslat", text: "Gyors, biztonságos, modern megoldás, a projektedre szabva." },
];

export default function HomePage() {
  const launch = pricingConfig.discounts.launch;

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Container maxWidth="lg" component="header" sx={{ py: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo />
        <LinkButton href="/tervezo" color="inherit" endIcon={<ArrowForward />} sx={{ display: { xs: "none", sm: "inline-flex" } }}>
          Ajánlatkérés
        </LinkButton>
      </Container>

      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 8, md: 12 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" }, gap: { xs: 6, md: 8 }, alignItems: "center" }}>
            <Stack spacing={3.5} sx={{ alignItems: "flex-start" }}>
              <Typography variant="h1">
                Tervezzük meg együtt a&nbsp;weboldalad.
              </Typography>
              <Typography variant="subtitle1" sx={{ maxWidth: 520, fontSize: { xs: "1.0625rem", md: "1.25rem" } }}>
                Válaszolj néhány egyszerű kérdésre, és pár perc alatt személyre szabott, tételes árajánlatot kapsz – regisztráció nélkül.
              </Typography>
              <HeroActions />
            </Stack>
            <OfferPreview />
          </Box>
        </Container>

        <Box sx={{ background: palette.surface, borderBlock: 1, borderColor: "divider" }}>
          <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
            <Typography variant="h2" sx={{ mb: { xs: 4, md: 6 }, maxWidth: 620 }}>
              Mintha egy tanácsadóval ülnél le – csak gyorsabb.
            </Typography>
            <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, columnGap: 5, rowGap: 4 }}>
              {steps.map((step, index) => (
                <Box component="li" key={step.title} sx={{ pt: 2.5, borderTop: `2px solid ${index === 0 ? palette.primary : palette.line}` }}>
                  <Typography sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: index === 0 ? "primary.main" : "text.secondary", mb: 1.5 }}>
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                  <Typography variant="h5" component="h3" sx={{ mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
          <Typography variant="h2" sx={{ mb: 5 }}>
            Milyen projektben gondolkodsz?
          </Typography>
          <ProjectTypeGrid />
        </Container>

        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 11 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" }, gap: { xs: 4, md: 8 }, alignItems: "start" }}>
            <Box>
              <Typography variant="h2">
                Nem csak egy szám – egy valódi ajánlat.
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              {benefits.map((benefit) => (
                <Box key={benefit.title} sx={{ pt: 2.5, borderTop: 1, borderColor: "divider" }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 0.75 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>

        <Container maxWidth="lg">
          <Box
            sx={{
              borderRadius: { xs: 3, md: 4 },
              p: { xs: 4, md: 7 },
              background: palette.ink,
              color: "#fff",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { md: "center" },
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="h3" component="h2">
                Kíváncsi vagy, mennyibe kerülne?
              </Typography>
              <Typography sx={{ opacity: 0.85, mt: 1 }}>
                {launch.enabled ? `Most ${launch.percent}% indulási kedvezménnyel.` : "Pár perc, és megtudod."}
              </Typography>
            </Box>
            <LinkButton href="/tervezo" size="large" endIcon={<ArrowForward />} sx={{ background: "#fff", color: palette.ink, alignSelf: { xs: "flex-start", md: "center" }, "&:hover": { background: palette.accent } }}>
              Megtervezem a projektem
            </LinkButton>
          </Box>
        </Container>
      </Box>

      <SiteFooter />
    </Box>
  );
}
