import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
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
import { palette, tint } from "@/theme/tokens";

const steps = [
  { title: "Válaszolj néhány kérdésre", text: "Egyszerre csak egy kérdés, szakszavak nélkül, tippekkel. A válaszaid automatikusan mentődnek." },
  { title: "Kapd meg az ajánlatod azonnal", text: "Tételes kalkuláció három csomagban, fejlesztési idővel és fenntartási költséggel." },
  { title: "Egyeztessünk, ha tetszik", text: "Egy kattintással elküldöd, mi pedig 1 munkanapon belül jelentkezünk." },
];

const stats = [
  { value: "~4 perc", label: "a teljes kitöltés" },
  { value: "3 csomag", label: "a te igényeidből" },
  { value: "0", label: "regisztráció" },
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
              {launch.enabled && (
                <Chip
                  label={`${launch.label}: −${launch.percent}% minden projektre`}
                  sx={{ background: palette.accent, color: palette.ink, boxShadow: "0 6px 20px -8px rgba(90,115,0,.5)" }}
                />
              )}
              <Typography variant="h1">
                Tervezzük meg együtt a&nbsp;weboldalad.
              </Typography>
              <Typography variant="subtitle1" sx={{ maxWidth: 520, fontSize: { xs: "1.0625rem", md: "1.25rem" } }}>
                Válaszolj néhány egyszerű kérdésre, és pár perc alatt személyre szabott, tételes árajánlatot kapsz – regisztráció nélkül.
              </Typography>
              <HeroActions />
              <Stack direction="row" sx={{ gap: { xs: 3, sm: 5 }, pt: 1, flexWrap: "wrap" }}>
                {stats.map((stat) => (
                  <Box key={stat.label}>
                    <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, lineHeight: 1.1 }}>{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
            <OfferPreview />
          </Box>
        </Container>

        <Box sx={{ background: palette.ink, color: "#fff", position: "relative", overflow: "hidden" }}>
          <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 }, position: "relative" }}>
            <Typography variant="overline" sx={{ color: palette.accent }}>
              Hogyan működik?
            </Typography>
            <Typography variant="h2" sx={{ mt: 1, mb: 5, maxWidth: 620 }}>
              Mintha egy tanácsadóval ülnél le – csak gyorsabb.
            </Typography>
            <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
              {steps.map((step, index) => (
                <Box
                  component="li"
                  key={step.title}
                  sx={{ p: 3.5, borderRadius: 5, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", backdropFilter: "blur(6px)" }}
                >
                  <Box sx={{ width: 44, height: 44, borderRadius: 3, display: "grid", placeItems: "center", background: tint(index).bg, color: tint(index).fg, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>
                    {index + 1}
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ mt: 2.5, mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {step.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
          <Typography variant="overline" color="primary">
            Kezdd itt
          </Typography>
          <Typography variant="h2" sx={{ mt: 1, mb: 5 }}>
            Milyen projektben gondolkodsz?
          </Typography>
          <ProjectTypeGrid />
        </Container>

        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 11 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" }, gap: { xs: 4, md: 8 }, alignItems: "start" }}>
            <Box>
              <Typography variant="overline" color="primary">
                Mit kapsz?
              </Typography>
              <Typography variant="h2" sx={{ mt: 1 }}>
                Nem csak egy szám – egy valódi ajánlat.
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              {benefits.map((benefit, index) => (
                <Box key={benefit.title} sx={{ p: 3, borderRadius: 5, background: tint(index).bg }}>
                  <Typography variant="h6" component="h3" sx={{ color: tint(index).fg, mb: 0.75 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.inkSoft }}>
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
              borderRadius: { xs: 5, md: 7 },
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
