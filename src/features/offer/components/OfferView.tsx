"use client";

import ArrowDownward from "@mui/icons-material/ArrowDownward";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import PrintOutlined from "@mui/icons-material/PrintOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";
import { FluidBlobs } from "@/components/home/FluidBlobs";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WaveDivider } from "@/components/WaveDivider";
import { pricingConfig } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { resolveQuickDecision } from "@/features/pricing/quickDecision";
import type { PackageId } from "@/features/pricing/types";
import { isComplete } from "@/features/questionnaire/engine";
import type { Answers } from "@/features/questionnaire/types";
import { formatRon, formatWeeks } from "@/lib/format";
import { useWizardSnapshot, wizardStore, type Submission } from "@/lib/storage";
import { ease, palette } from "@/theme/tokens";
import { buildOffer } from "../buildOffer";
import { offerAgeMinutesFrom, useNow, useOfferClock } from "../useOfferClock";
import { DISCOUNTS_ID, DiscountsPanel, totalSavings } from "./DiscountsPanel";
import { OfferCodeBadge } from "./OfferCodeBadge";
import { OfferDetails } from "./OfferDetails";
import { PricingCards } from "./PricingCards";
import { StickyCta } from "./StickyCta";
import { SubmittedPanel } from "./SubmittedPanel";

const CONTACT_ID = "kapcsolat";
const DETAILS_ID = "reszletek";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Page frame shared by every state of the offer page. */
function Frame({ children, header, stickyBar = false }: { children: React.ReactNode; header?: React.ReactNode; stickyBar?: boolean }) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {header ?? <SiteHeader />}
      {children}
      <SiteFooter reserveStickyBar={stickyBar} />
    </Box>
  );
}

export function OfferView() {
  const snapshot = useWizardSnapshot();

  if (!snapshot) {
    return (
      <Frame>
        <Container maxWidth="lg" sx={{ py: 8 }} aria-busy="true">
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
        </Container>
      </Frame>
    );
  }

  if (!isComplete(snapshot.answers)) {
    return (
      <Frame>
        <WaveDivider from={palette.ink} to={palette.paper} height={48} />
        <Container component="main" maxWidth="sm" sx={{ flex: 1, py: { xs: 8, md: 12 }, textAlign: "center" }}>
          <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
            Még nincs elkészült ajánlatod
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 4 }}>
            Válaszolj néhány kérdésre, és azonnal összeállítjuk a személyre szabott árajánlatod.
          </Typography>
          <Button component={Link} href="/tervezo" variant="contained" color="primary" size="large">
            {snapshot.answers.projectType ? "Kérdőív folytatása" : "Kérdőív indítása"}
          </Button>
        </Container>
      </Frame>
    );
  }

  return <OfferContent answers={snapshot.answers} packageId={snapshot.packageId} submission={snapshot.submission} />;
}

/** A representative age inside a tier, so prices only recompute when the tier changes. */
function tierAge(tierIndex: number): number | undefined {
  const tiers = pricingConfig.discounts.quickDecision.tiers;
  if (tierIndex === -1) return Number.MAX_SAFE_INTEGER;
  return tierIndex === 0 ? undefined : tiers[tierIndex - 1].withinMinutes;
}

function tierLabel(tierIndex: number): string {
  if (tierIndex === -1) return "teljes ár";
  return `−${pricingConfig.discounts.quickDecision.tiers[tierIndex]?.percent ?? 0}%`;
}

function OfferContent({ answers, packageId, submission }: { answers: Answers; packageId: PackageId; submission: Submission | null }) {
  const quickConfig = pricingConfig.discounts.quickDecision;
  const clockState = useOfferClock();
  // Coarse tick for prices (tier changes); the banner has its own per-second countdown.
  const now = useNow(15_000);
  const ageMinutes = offerAgeMinutesFrom(clockState.clock, now);
  const tierIndex = resolveQuickDecision(quickConfig, ageMinutes).tierIndex;
  const tierAtLoad = clockState.clock ? resolveQuickDecision(quickConfig, clockState.clock.ageAtLoad).tierIndex : tierIndex;
  const tierChanged = clockState.status === "ready" && tierIndex !== tierAtLoad;
  const pricesReady = clockState.status !== "loading";

  const offer = useMemo(() => buildOffer(answers, { offerAgeMinutes: tierAge(tierIndex) }), [answers, tierIndex]);
  if (!offer) return null;

  const pkg = offer.quote.packages[packageId];
  const selectPackage = (id: PackageId) => wizardStore.update({ packageId: id });

  const header = (
    <SiteHeader
      action={
        <Stack direction="row" spacing={1} className="no-print">
          <Button component={Link} href="/tervezo" startIcon={<EditNoteOutlined />} sx={{ color: "#fff" }}>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Válaszok módosítása
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              Módosítás
            </Box>
          </Button>
          <Button startIcon={<PrintOutlined />} onClick={() => window.print()} sx={{ color: "#fff", display: { xs: "none", sm: "inline-flex" } }}>
            Nyomtatás / PDF
          </Button>
        </Stack>
      }
    />
  );

  return (
    <Frame header={header} stickyBar={!submission}>
      {/* 1 – Hero: what it is, what it costs, the one action. */}
      <Box component="section" aria-labelledby="offer-title" className="offer-hero" sx={{ background: palette.ink, color: "#fff", position: "relative", overflow: "hidden", "@media print": { background: "#fff", color: palette.ink } }}>
        <Box sx={{ display: { xs: "none", lg: "block" } }} className="no-print">
          <FluidBlobs variant="corner" tone={packageId} />
        </Box>
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: { xs: 4, md: 6 }, pb: { xs: 5, md: 7 } }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: ease.out }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.25fr 0.75fr" }, gap: { xs: 4, md: 8 }, alignItems: "end" }}>
              <Box>
                <Typography sx={{ color: palette.inkMuted, fontSize: 14 }}>Személyre szabott ajánlat</Typography>
                <Typography id="offer-title" variant="h2" component="h1" sx={{ mt: 0.5, mb: 2 }}>
                  {offer.projectTypeLabel}
                </Typography>
                <Typography sx={{ color: palette.inkMuted, fontSize: "1.0625rem", lineHeight: 1.65, maxWidth: 620 }}>{offer.summary}</Typography>
              </Box>

              <Box>
                <Typography sx={{ color: palette.inkMuted, fontSize: 14 }}>{pkg.name} csomag · becsült projektár</Typography>
                {pricesReady ? (
                  <>
                    <Typography sx={{ textDecoration: "line-through", color: palette.inkMuted, mt: 1, visibility: totalSavings(pkg) > 0 ? "visible" : "hidden" }}>
                      {formatRon(pkg.finalPrice + totalSavings(pkg))}
                    </Typography>
                    <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: { xs: 40, md: 52 }, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
                      {formatRon(pkg.finalPrice)}
                    </Typography>
                    {totalSavings(pkg) > 0 && (
                      <Box
                        component="button"
                        type="button"
                        onClick={() => scrollToId(DISCOUNTS_ID)}
                        className="no-print"
                        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 1.25, minHeight: 36, px: 1.5, py: 0.5, borderRadius: 1.5, border: 0, background: palette.amber, color: palette.ink, font: "inherit", fontSize: 14, fontWeight: 800, cursor: "pointer", "&:hover": { filter: "brightness(1.05)" }, "&:focus-visible": { outline: "2px solid #fff", outlineOffset: 2 } }}
                      >
                        Kedvezményeid: −{formatRon(totalSavings(pkg))}
                        <ArrowDownward sx={{ fontSize: 16 }} />
                      </Box>
                    )}
                  </>
                ) : (
                  <Box aria-busy="true" aria-label="Az ár betöltése">
                    <Skeleton variant="text" width={110} sx={{ bgcolor: palette.inkSoft, mt: 1 }} />
                    <Skeleton variant="rounded" width={220} height={52} sx={{ bgcolor: palette.inkSoft }} />
                  </Box>
                )}
                <Stack direction="row" spacing={4} sx={{ mt: 2.5 }}>
                  <Box>
                    <Typography sx={{ color: palette.inkMuted, fontSize: 13 }}>Fejlesztési idő</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{formatWeeks(pkg.timeline.minWeeks, pkg.timeline.maxWeeks)}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: palette.inkMuted, fontSize: 13 }}>Fenntartás</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{formatRon(pkg.maintenance.monthlyTotal)}/hó</Typography>
                  </Box>
                </Stack>
                <OfferCodeBadge answers={answers} packageId={packageId} />
                <Box sx={{ mt: 3 }} className="no-print">
                  {submission ? (
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<CheckCircleOutlineOutlined />}
                      onClick={() => scrollToId(CONTACT_ID)}
                      sx={{ color: "#fff", borderColor: palette.inkLine, "&:hover": { borderColor: "#fff", background: "transparent" } }}
                    >
                      Kérésed elküldve
                    </Button>
                  ) : (
                    <Button id="hero-cta" variant="contained" color="primary" size="large" endIcon={<ArrowDownward />} onClick={() => scrollToId(CONTACT_ID)}>
                      Ingyenes egyeztetést kérek
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: palette.inkMuted, mt: { xs: 4, md: 5 }, fontSize: 13 }}>
              {offer.disclaimer}
            </Typography>
          </motion.div>
        </Container>
      </Box>
      <WaveDivider from={palette.ink} to={palette.paper} />

      <Container component="main" maxWidth="lg" sx={{ flex: 1, pb: { xs: 6, md: 10 } }}>
        {/* Price-change notice (aria-live so it is announced). */}
        <Box aria-live="polite" sx={{ mt: tierChanged || clockState.status === "error" ? 2 : 0 }}>
          {tierChanged && (
            <Typography sx={{ p: 2, borderRadius: 2, border: `1.5px solid ${palette.amber}`, background: palette.surface, fontWeight: 600 }}>
              {tierIndex === -1
                ? "A gyors döntés kedvezmény lejárt – az árak már teljes áron szerepelnek."
                : `A gyors döntés kedvezmény ${tierLabel(tierAtLoad)}-ról ${tierLabel(tierIndex)}-ra csökkent – az árakat frissítettük.`}
            </Typography>
          )}
          {clockState.status === "error" && (
            <Typography variant="body2" sx={{ p: 2, borderRadius: 2, border: 1, borderColor: "divider", background: palette.surface }}>
              A kedvezmény idejét most nem tudtuk betölteni. Ne aggódj: a kedvezményt az elküldéskor rögzítjük.
            </Typography>
          )}
        </Box>

        {/* 2 – All discounts in one place (only while the request is still open). */}
        {!submission && pricesReady && (
          <Box className="no-print">
            <DiscountsPanel
              pkg={pkg}
              clockState={clockState}
              onDeadlineChange={(weeks) => wizardStore.update({ answers: { ...answers, deadlineWeeks: String(weeks) } })}
              onSelectPackage={selectPackage}
              onCta={() => scrollToId(CONTACT_ID)}
            />
          </Box>
        )}

        {/* 3 – Package choice. */}
        <Box component="section" aria-labelledby="packages-title" sx={{ mt: { xs: 6, md: 8 } }} className="no-print">
          <Typography id="packages-title" variant="h3" component="h2" sx={{ mb: 1 }}>
            Válassz csomagot
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            Mindhárom a te válaszaidból épül fel – a különbség a terjedelemben és a szolgáltatásokban van.
          </Typography>
          {offer.quote.budget && (
            <Typography variant="body2" sx={{ mb: 3, px: 2, py: 1.25, borderRadius: 2, display: "inline-block", background: palette.surface, border: 1, borderColor: "divider" }}>
              {offer.quote.budget.withinBasic
                ? `A megadott kereted alapján a(z) ${offer.quote.packages[offer.quote.recommended].name} csomagot ajánljuk.`
                : "Már a Basic csomag is meghaladja a megadott keretet. Egyeztetéskor megnézzük, hogyan lehet szakaszolni vagy egyszerűsíteni a projektet."}
            </Typography>
          )}
          {pricesReady ? (
            <PricingCards
              quote={offer.quote}
              mode="offer"
              selected={packageId}
              onSelect={(id) => {
                selectPackage(id);
                if (!submission) window.setTimeout(() => scrollToId(CONTACT_ID), 150);
              }}
              detailsHref={`#${DETAILS_ID}`}
            />
          ) : (
            <Skeleton variant="rounded" height={520} sx={{ borderRadius: 4 }} aria-label="A csomagok betöltése" />
          )}
        </Box>

        {/* 4 – The request (or its confirmation). */}
        <Box id={CONTACT_ID} component="section" className="no-print" sx={{ mt: { xs: 6, md: 8 }, scrollMarginTop: 24 }}>
          {submission ? (
            <SubmittedPanel submission={submission} packageName={pkg.name} nextSteps={offer.nextSteps} />
          ) : (
            <ContactForm
              answers={answers}
              packageId={packageId}
              packageName={pkg.name}
              onSubmitted={(copySent) => wizardStore.update({ submission: { at: Date.now(), copySent } })}
            />
          )}
        </Box>

        {/* 5 – Details, collapsed into tabs. */}
        <Box id={DETAILS_ID} component="section" aria-labelledby="details-title" className="offer-details" sx={{ mt: { xs: 6, md: 8 }, scrollMarginTop: 24 }}>
          <Typography id="details-title" variant="h3" component="h2" sx={{ mb: 3 }}>
            Részletek
          </Typography>
          <OfferDetails offer={offer} packageId={packageId} />
        </Box>

        {/* Printed offers carry who it is from. */}
        <Box className="print-only" sx={{ mt: 4, pt: 2, borderTop: `1px solid ${palette.line}`, fontSize: 12, color: "#3A3C42" }}>
          {siteConfig.company.legalName} · CUI {siteConfig.company.taxId} · {siteConfig.company.registrationNumber}
          <br />
          {siteConfig.company.address}
          <br />
          nutooka.tech
          {siteConfig.company.email ? ` · ${siteConfig.company.email}` : ""}
          {siteConfig.company.phone ? ` · ${siteConfig.company.phone}` : ""}
        </Box>
      </Container>

      {!submission && (
        <>
          <StickyCta targetId={CONTACT_ID} price={pkg.finalPrice} packageName={pkg.name} clockState={clockState} pricesReady={pricesReady} hideWhileVisible={["hero-cta", DISCOUNTS_ID]} />
        </>
      )}
    </Frame>
  );
}
