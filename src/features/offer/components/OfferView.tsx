"use client";

import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import PrintOutlined from "@mui/icons-material/PrintOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { isComplete } from "@/features/questionnaire/engine";
import type { Answers } from "@/features/questionnaire/types";
import { formatRon, formatWeeks } from "@/lib/format";
import { useWizardSnapshot, wizardStore } from "@/lib/storage";
import { palette } from "@/theme/tokens";
import type { PackageId } from "@/features/pricing/types";
import { buildOffer } from "../buildOffer";
import { pricingConfig } from "@/config/pricing";
import { resolveQuickDecision } from "@/features/pricing/quickDecision";
import { offerAgeMinutesFrom, useNow, useOfferClock } from "../useOfferClock";
import { PricingCards } from "./PricingCards";
import { QuickDecisionBanner } from "./QuickDecisionBanner";
import { PriceBreakdown } from "./PriceBreakdown";
import { StickyCta } from "./StickyCta";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      component="section"
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        background: palette.surface,
        breakInside: "avoid",
      }}
    >
      <Typography variant="h4" component="h2" sx={{ mb: 2.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function List({ items, icon }: { items: string[]; icon: "check" | "close" }) {
  const Icon = icon === "check" ? Check : Close;
  return (
    <Stack component="ul" spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {items.map((item) => (
        <Stack component="li" key={item} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
          <Icon sx={{ fontSize: 18, mt: "3px", color: icon === "check" ? palette.success : "text.secondary" }} />
          <Typography variant="body2">{item}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export function OfferView() {
  const snapshot = useWizardSnapshot();

  if (!snapshot) {
    return (
      <Container maxWidth="lg" sx={{ pt: 12 }} aria-busy="true">
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 4 }} />
      </Container>
    );
  }

  if (!isComplete(snapshot.answers)) {
    return (
      <Container maxWidth="sm" sx={{ py: 16, textAlign: "center" }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
          Még nincs elkészült ajánlatod
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4 }}>
          Válaszolj néhány kérdésre, és azonnal összeállítjuk a személyre szabott árajánlatod.
        </Typography>
        <Button component={Link} href="/tervezo" variant="contained" color="secondary" size="large">
          {snapshot.answers.projectType ? "Kérdőív folytatása" : "Kérdőív indítása"}
        </Button>
      </Container>
    );
  }

  return <OfferContent answers={snapshot.answers} packageId={snapshot.packageId} />;
}

/** A representative age inside a tier, so prices only recompute when the tier changes. */
function tierAge(tierIndex: number): number | undefined {
  const tiers = pricingConfig.discounts.quickDecision.tiers;
  if (tierIndex === -1) return Number.MAX_SAFE_INTEGER;
  return tierIndex === 0 ? undefined : tiers[tierIndex - 1].withinMinutes;
}

function OfferContent({ answers, packageId }: { answers: Answers; packageId: PackageId }) {
  const clock = useOfferClock();
  // Coarse tick for prices (tier changes); the banner has its own per-second countdown.
  const now = useNow(15_000);
  const ageMinutes = offerAgeMinutesFrom(clock, now);
  const tierIndex = resolveQuickDecision(pricingConfig.discounts.quickDecision, ageMinutes).tierIndex;
  const offer = useMemo(() => buildOffer(answers, { offerAgeMinutes: tierAge(tierIndex) }), [answers, tierIndex]);
  const scrollToContact = () => document.getElementById("kapcsolat")?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (!offer) return null;

  const pkg = offer.quote.packages[packageId];
  const selectPackage = (id: PackageId) => wizardStore.update({ packageId: id });

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Container maxWidth="lg" component="header" sx={{ py: 3, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Logo />
        <Stack direction="row" spacing={1} className="no-print">
          <Button component={Link} href="/tervezo" color="inherit" startIcon={<EditNoteOutlined />}>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Válaszok módosítása</Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>Módosítás</Box>
          </Button>
          <Button color="inherit" startIcon={<PrintOutlined />} onClick={() => window.print()} sx={{ display: { xs: "none", sm: "inline-flex" } }}>
            Nyomtatás / PDF
          </Button>
        </Stack>
      </Container>

      <Container component="main" maxWidth="lg" sx={{ flex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <Box
            sx={{
              background: palette.ink,
              color: "#fff",
              borderRadius: { xs: 3, md: 4 },
              p: { xs: 3, sm: 4, md: 6 },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.3fr 0.7fr" },
              gap: { xs: 4, md: 6 },
              position: "relative",
              overflow: "hidden",
              "@media print": { background: "#fff", color: palette.ink, border: `1px solid ${palette.line}` },
            }}
          >
            <Box>
              <Typography sx={{ opacity: 0.65, fontSize: 14 }}>Személyre szabott ajánlat</Typography>
              <Typography variant="h2" component="h1" sx={{ mt: 0.5, mb: 2 }}>
                {offer.projectTypeLabel}
              </Typography>
              <Typography sx={{ opacity: 0.8, fontSize: "1.0625rem", lineHeight: 1.65, maxWidth: 620 }}>{offer.summary}</Typography>
            </Box>
            <Box sx={{ borderLeft: { md: "1px solid rgba(255,255,255,.14)" }, pl: { md: 5 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography sx={{ opacity: 0.65, fontSize: 14 }}>{pkg.name} csomag · becsült projektár</Typography>
              {pkg.savings > 0 && <Typography sx={{ textDecoration: "line-through", opacity: 0.5, mt: 1 }}>{formatRon(pkg.listPrice)}</Typography>}
              <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: { xs: 40, md: 48 }, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
                {formatRon(pkg.finalPrice)}
              </Typography>
              {pkg.savings > 0 && (
                <Chip label={`Megtakarítás: ${formatRon(pkg.savings)}`} sx={{ alignSelf: "flex-start", mt: 1.5, background: palette.lime, color: palette.ink }} />
              )}
              <Stack direction="row" spacing={4} sx={{ mt: 3 }}>
                <Box>
                  <Typography sx={{ opacity: 0.65, fontSize: 13 }}>Fejlesztési idő</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatWeeks(pkg.timeline.minWeeks, pkg.timeline.maxWeeks)}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ opacity: 0.65, fontSize: 13 }}>Fenntartás</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatRon(pkg.maintenance.monthlyTotal)}/hó</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </motion.div>

        <Box className="no-print">
          <QuickDecisionBanner clock={clock} onCta={scrollToContact} />
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start", mt: 3, p: 2, borderRadius: 2, background: palette.surface, border: 1, borderColor: "divider" }}>
          <InfoOutlined sx={{ fontSize: 20, color: "text.primary", mt: "1px" }} />
          <Typography variant="body2">{offer.disclaimer}</Typography>
        </Stack>

        <Box component="section" sx={{ mt: { xs: 6, md: 8 } }} className="no-print">
          <Typography variant="h3" component="h2" sx={{ mb: 1 }}>
            Válassz csomagot
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            Mindhárom a te válaszaidból épül fel – a különbség a terjedelemben és a szolgáltatásokban van.
          </Typography>
          {offer.quote.budget && (
            <Typography variant="body2" sx={{ mb: 2, px: 2, py: 1.25, borderRadius: 2, display: "inline-block", background: palette.surface, border: 1, borderColor: "divider" }}>
              {offer.quote.budget.withinBasic
                ? `A megadott kereted alapján a(z) ${offer.quote.packages[offer.quote.recommended].name} csomagot ajánljuk.`
                : "Már a Basic csomag is meghaladja a megadott keretet. Egyeztetéskor megnézzük, hogyan lehet szakaszolni vagy egyszerűsíteni a projektet."}
            </Typography>
          )}
          <Box sx={{ pt: { md: 2 } }}>
            <PricingCards quote={offer.quote} mode="offer" selected={packageId} onSelect={selectPackage} />
          </Box>
        </Box>

        <Box sx={{ mt: 4, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.35fr 0.65fr" }, gap: 3, alignItems: "start" }}>
          <Card title={`Tételes kalkuláció – ${pkg.name}`}>
            <PriceBreakdown quote={offer.quote} pkg={pkg} />
          </Card>

          <Stack spacing={3}>
            <Card title="Javasolt technológia">
              <Typography variant="h6" component="p">
                {offer.tech.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                {offer.tech.description}
              </Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                {offer.tech.stack.map((tech) => (
                  <Chip key={tech} label={tech} size="small" variant="outlined" />
                ))}
              </Stack>
            </Card>

            <Card title="Fenntartás">
              <Stack spacing={1.25}>
                <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="body2">Tárhely, üzemeltetés</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{formatRon(pkg.maintenance.hostingMonthly)}/hó</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="body2">{pkg.maintenance.supportLabel}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{formatRon(pkg.maintenance.supportMonthly)}/hó</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
                  <Typography variant="body2">Domain</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{formatRon(pkg.maintenance.domainYearly)}/év</Typography>
                </Stack>
                <Box sx={{ borderTop: 1, borderColor: "divider", pt: 1.5 }}>
                  <Typography sx={{ fontWeight: 700 }}>{formatRon(pkg.maintenance.monthlyTotal)} / hó</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Évente kb. {formatRon(pkg.maintenance.yearlyTotal)} · a karbantartás opcionális
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Box>

        {offer.selectedFeatures.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Card title="Választott funkciók">
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                {offer.selectedFeatures.map((feature) => {
                  const included = pkg.items.some((item) => item.label === feature);
                  return (
                    <Chip
                      key={feature}
                      label={feature}
                      icon={included ? <Check /> : undefined}
                      variant={included ? "filled" : "outlined"}
                      sx={included ? { background: palette.limeTint } : { opacity: 0.6 }}
                    />
                  );
                })}
              </Stack>
            </Card>
          </Box>
        )}

        <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <Card title="Mit tartalmaz az ajánlat?">
            <List items={offer.includes[packageId]} icon="check" />
          </Card>
          <Card title="Mit nem tartalmaz?">
            <List items={offer.excludes[packageId]} icon="close" />
          </Card>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Card title="Következő lépések">
            <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3 }}>
              {offer.nextSteps.map((step, index) => (
                <Box component="li" key={step}>
                  <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28 }}>
                    {index + 1}
                    <Box component="span" sx={{ color: palette.lime, WebkitTextStroke: `1px ${palette.ink}` }}>
                      .
                    </Box>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {step}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>

        <Box id="kapcsolat" component="section" className="no-print" sx={{ mt: { xs: 6, md: 8 }, scrollMarginTop: 24 }}>
          <ContactForm answers={answers} packageId={packageId} packageName={pkg.name} />
        </Box>
      </Container>

      <Box sx={{ height: 88 }} className="no-print" />
      <SiteFooter />
      <StickyCta targetId="kapcsolat" price={pkg.finalPrice} packageName={pkg.name} clock={clock} />
    </Box>
  );
}
