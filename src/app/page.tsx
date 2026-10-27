import ArrowForward from "@mui/icons-material/ArrowForward";
import Check from "@mui/icons-material/Check";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FluidBlobs } from "@/components/home/FluidBlobs";
import { HeroActions } from "@/components/home/HeroActions";
import { HomePricing } from "@/components/home/HomePricing";
import { HeroTitle } from "@/components/home/HeroTitle";
import { OfferPreview } from "@/components/home/OfferPreview";
import { ProjectTypeGrid } from "@/components/home/ProjectTypeGrid";
import { LinkButton } from "@/components/LinkButton";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { pricingConfig } from "@/config/pricing";
import { startingPrice } from "@/features/pricing/startingPrice";
import { RESOLVED_PROJECT_TYPES } from "@/features/questionnaire/types";
import { formatRon } from "@/lib/format";
import { palette } from "@/theme/tokens";

const steps = [
  { title: "Válaszolj pár kérdésre", text: "Egyszerre egy kérdés, szakszavak nélkül. Bármikor abbahagyhatod, a válaszaid megmaradnak." },
  { title: "Azonnal látod az árat", text: "Tételes kalkuláció három csomagban, átfutási idővel és fenntartási költséggel." },
  { title: "Ingyenes egyeztetés", text: "Ha tetszik, egy kattintással elküldöd. 1 munkanapon belül jelentkezünk." },
];

const promises = [
  { title: "Fix ár, nincs meglepetés", text: "Amit az egyeztetés után leírunk, annyiba kerül. Pluszmunka csak a jóváhagyásoddal." },
  { title: "2–4 hét alatt élesben", text: "Egy átlagos céges oldal egy hónapon belül elkészül – nem negyedév múlva." },
  { title: "Minden a tiéd", text: "Domain, kód, tartalom: a te nevedre szól. Bármikor továbbviheted." },
  { title: "Ügynökségi rezsi nélkül", text: "Modern eszközökkel, kis csapatban dolgozunk, ezért tudunk kedvező árat adni." },
];

const faqs = [
  {
    q: "Tényleg ennyibe kerül?",
    a: "Az ajánlat a válaszaidból számolt, tételes becslés. A végleges, fix árat a 30 perces egyeztetés után adjuk – általában a becslés közelében marad.",
  },
  { q: "Mit kell előkészítenem?", a: "Semmit. Ha van logód, szöveged, képeid, az gyorsít; ha nincs, ebben is segítünk." },
  { q: "Mi van, ha később bővíteni szeretném?", a: "Modern, bővíthető alapra építünk, így később bármikor jöhet új oldal, webshop vagy funkció." },
  { q: "Ki fogja kezelni az oldalt?", a: "Te is tudod szerkeszteni – megmutatjuk, hogyan. Ha nem akarsz vele foglalkozni, kérhetsz karbantartást." },
];

export default function HomePage() {
  const launch = pricingConfig.discounts.launch;
  const prices = Object.fromEntries(RESOLVED_PROJECT_TYPES.map((type) => [type, startingPrice(type)]));

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <Box sx={{ background: palette.ink, color: "#fff", overflow: "hidden" }}>
        <Container maxWidth="lg" component="header" sx={{ py: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo tone="light" />
          <LinkButton href="/tervezo" endIcon={<ArrowForward />} sx={{ color: "#fff", display: { xs: "none", sm: "inline-flex" } }}>
            Ajánlatkérés
          </LinkButton>
        </Container>
        <Container maxWidth="lg" component="section" sx={{ pt: { xs: 5, md: 9 }, pb: { xs: 8, md: 13 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" }, gap: { xs: 6, md: 8 }, alignItems: "center" }}>
            <Stack spacing={4} sx={{ alignItems: "flex-start" }}>
              <HeroTitle />
              <Typography sx={{ color: palette.inkMuted, fontSize: { xs: "1.0625rem", md: "1.25rem" }, lineHeight: 1.55, maxWidth: 520 }}>
                Néhány egyszerű kérdés, és pár perc alatt tételes, személyre szabott árajánlatot kapsz. Céges weboldal már{" "}
                <Box component="span" sx={{ color: "#fff", fontWeight: 600 }}>
                  {formatRon(prices.company)}-tól
                </Box>
                .
              </Typography>
              <HeroActions />
            </Stack>
            <Box sx={{ position: "relative", py: { xs: 2, md: 4 } }}>
              <FluidBlobs />
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <OfferPreview />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box component="main" sx={{ flex: 1 }}>
        {/* How it works */}
        <Container maxWidth="lg" component="section" sx={{ py: { xs: 9, md: 13 } }}>
          <Typography variant="h2" className="reveal" sx={{ mb: { xs: 5, md: 7 }, maxWidth: 680 }}>
            Mintha egy tanácsadóval ülnél le – csak gyorsabb.
          </Typography>
          <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, columnGap: 5, rowGap: 5 }}>
            {steps.map((step, index) => (
              <Box component="li" key={step.title} className="reveal" sx={{ position: "relative", pt: 3, borderTop: 1, borderColor: "divider" }}>
                <Box aria-hidden sx={{ position: "absolute", top: -1, left: 0, width: 48, height: 3, background: palette.ink }} />
                <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 56, lineHeight: 1, letterSpacing: "-0.04em", mb: 2 }}>
                  {index + 1}
                  <Box component="span" sx={{ color: palette.lime, WebkitTextStroke: `1.5px ${palette.ink}` }}>
                    .
                  </Box>
                </Typography>
                <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography color="text.secondary">{step.text}</Typography>
              </Box>
            ))}
          </Box>
        </Container>

        {/* Packages */}
        <Box component="section" sx={{ background: palette.cardBodyDeep, color: "#fff", overflow: "hidden" }}>
          <Container maxWidth="lg" sx={{ py: { xs: 9, md: 13 } }}>
            <Box className="reveal" sx={{ textAlign: "center", maxWidth: 680, mx: "auto", mb: { xs: 5, md: 8 } }}>
              <Typography variant="h2">
                Három csomag,{" "}
                <Box component="span" sx={{ background: "linear-gradient(90deg, #FFB547, #FF5E7E)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  egy átlátható ár.
                </Box>
              </Typography>
              <Typography sx={{ mt: 2, color: palette.inkMuted, fontSize: "1.125rem" }}>
                Így néz ki egy 6–10 oldalas céges weboldal ajánlata. A te csomagjaid a válaszaidból épülnek fel.
              </Typography>
            </Box>
            <HomePricing />
          </Container>
        </Box>

        {/* Project types with real starting prices */}
        <Box component="section" sx={{ background: palette.surface, borderBlock: 1, borderColor: "divider" }}>
          <Container maxWidth="lg" sx={{ py: { xs: 9, md: 13 } }}>
            <Stack direction={{ xs: "column", md: "row" }} className="reveal" sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" }, gap: 2, mb: { xs: 4, md: 6 } }}>
              <Typography variant="h2" sx={{ maxWidth: 560 }}>
                Milyen projektben gondolkodsz?
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 360 }}>
                Válassz egyet, és onnan folytatjuk. Az árak a legegyszerűbb változatra vonatkoznak.
              </Typography>
            </Stack>
            <ProjectTypeGrid startingPrices={prices} />
          </Container>
        </Box>

        {/* Promises */}
        <Box component="section" sx={{ background: palette.ink, color: "#fff" }}>
          <Container maxWidth="lg" sx={{ py: { xs: 9, md: 13 }, display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" }, gap: { xs: 5, md: 10 } }}>
            <Typography variant="h2" className="reveal">
              Prémium minőség,{" "}
              <Box component="span" sx={{ color: palette.lime }}>
                kisvállalkozói áron.
              </Box>
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, columnGap: 5, rowGap: 4 }}>
              {promises.map((promise) => (
                <Box key={promise.title} className="reveal">
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", background: palette.lime, color: palette.ink, display: "grid", placeItems: "center", mb: 2 }}>
                    <Check sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ mb: 0.75 }}>
                    {promise.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.inkMuted }}>
                    {promise.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* FAQ */}
        <Container maxWidth="md" component="section" sx={{ py: { xs: 9, md: 13 } }}>
          <Typography variant="h2" className="reveal" sx={{ mb: 4 }}>
            Gyakori kérdések
          </Typography>
          <Box>
            {faqs.map((faq) => (
              <Accordion key={faq.q} disableGutters elevation={0} square sx={{ background: "transparent", borderBottom: 1, borderColor: "divider", "&::before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0, minHeight: 64 }}>
                  <Typography variant="h5" component="h3">
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0, pb: 3 }}>
                  <Typography color="text.secondary">{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>

        {/* Closing CTA */}
        <Box component="section" sx={{ background: palette.lime, color: palette.ink }}>
          <Container
            maxWidth="lg"
            sx={{ py: { xs: 8, md: 11 }, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: 4 }}
          >
            <Box>
              <Typography variant="h2" sx={{ maxWidth: 640 }}>
                Négy perc, és tudod, mennyibe kerül.
              </Typography>
              <Typography sx={{ mt: 1.5, fontSize: "1.125rem" }}>
                Ingyenes, kötelezettség nélkül{launch.enabled ? ` – most ${launch.percent}% indulási kedvezménnyel.` : "."}
              </Typography>
            </Box>
            <LinkButton href="/tervezo" variant="contained" color="secondary" size="large" endIcon={<ArrowForward />} sx={{ alignSelf: { xs: "flex-start", md: "center" }, flexShrink: 0 }}>
              Megtervezem a projektem
            </LinkButton>
          </Container>
        </Box>
      </Box>

      <SiteFooter />
    </Box>
  );
}
