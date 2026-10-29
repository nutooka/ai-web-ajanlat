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
import { useEffect, useMemo } from "react";
import { FluidBlobs } from "@/components/home/FluidBlobs";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WaveDivider } from "@/components/WaveDivider";
import { pricingConfig } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { SaveOffer } from "@/features/contact/components/SaveOffer";
import { trackStep } from "@/features/funnel/track";
import { resolveQuickDecision } from "@/features/pricing/quickDecision";
import type { PackageId } from "@/features/pricing/types";
import { isComplete } from "@/features/questionnaire/engine";
import type { Answers } from "@/features/questionnaire/types";
import { formatRon, formatWeeks } from "@/lib/format";
import { useWizardSnapshot, wizardStore, type Submission } from "@/lib/storage";
import { ease, palette } from "@/theme/tokens";
import { buildOffer } from "../buildOffer";
import { offerAgeMinutesFrom, useNow, useOfferClock } from "../useOfferClock";
import { useOfferCode } from "../useOfferCode";
import { DISCOUNTS_ID, DiscountsPanel, totalSavings } from "./DiscountsPanel";
import { OfferCodeBadge } from "./OfferCodeBadge";
import { LoadSharedOfferButton } from "./LoadSharedOfferButton";
import { OfferDetails } from "./OfferDetails";
import { REVIEW_ID, ReviewNotice } from "./ReviewNotice";
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

/** "Shopify-előfizetés (kb., …)" → "Shopify, kb." for the compact hero line. */
function quoteHostingShort(label: string): string {
  return label.startsWith("Shopify") ? "Shopify-díj, kb." : "tárhely";
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

/** A shared offer, frozen at the moment it was shown: same discounts, deadline and package. */
export interface FrozenOffer {
  code: string;
  /** Offer age then (minutes); null for old links without it → shown without the quick-decision discount. */
  ageMinutes: number | null;
  savedAt: number;
}

const savedFormat = new Intl.DateTimeFormat("hu-HU", { timeZone: "Europe/Bucharest", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

/** Read-only view of a shared offer link (/a/KÓD). */
export function SharedOfferView({ answers, packageId, frozen }: { answers: Answers; packageId: PackageId; frozen: FrozenOffer }) {
  return <OfferContent answers={answers} packageId={packageId} submission={null} frozen={frozen} />;
}

function OfferContent({ answers, packageId, submission, frozen }: { answers: Answers; packageId: PackageId; submission: Submission | null; frozen?: FrozenOffer }) {
  const quickConfig = pricingConfig.discounts.quickDecision;
  const clockState = useOfferClock(!frozen);
  useEffect(() => {
    if (!frozen) trackStep("offer_view");
  }, [frozen]);
  // Coarse tick for prices (tier changes); the banner has its own per-second countdown.
  const now = useNow(15_000);
  const frozenAge = frozen ? (frozen.ageMinutes ?? Number.MAX_SAFE_INTEGER) : undefined;
  const ageMinutes = frozen ? frozenAge : offerAgeMinutesFrom(clockState.clock, now);
  const tierIndex = resolveQuickDecision(quickConfig, ageMinutes).tierIndex;
  // A shared (frozen) offer already has its code – never create a new one from the viewer's clock.
  const liveCode = useOfferCode(answers, packageId, tierIndex, !frozen);
  const code = frozen?.code ?? liveCode;
  const tierAtLoad = clockState.clock ? resolveQuickDecision(quickConfig, clockState.clock.ageAtLoad).tierIndex : tierIndex;
  const tierChanged = !frozen && clockState.status === "ready" && tierIndex !== tierAtLoad;
  const pricesReady = Boolean(frozen) || clockState.status !== "loading";

  const offer = useMemo(() => buildOffer(answers, { offerAgeMinutes: tierAge(tierIndex) }), [answers, tierIndex]);
  if (!offer) return null;

  const pkg = offer.quote.packages[packageId];
  // A shared snapshot never writes into the viewer's own saved questionnaire.
  const selectPackage = (id: PackageId) => {
    if (!frozen) wizardStore.update({ packageId: id });
  };

  const header = (
    <SiteHeader
      action={
        <Stack direction="row" spacing={1} className="no-print">
          {!frozen && <Button component={Link} href="/tervezo" startIcon={<EditNoteOutlined />} sx={{ color: "#fff" }}>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Válaszok módosítása
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              Módosítás
            </Box>
          </Button>}
          <Button startIcon={<PrintOutlined />} onClick={() => window.print()} sx={{ color: "#fff", display: { xs: "none", sm: "inline-flex" } }}>
            Nyomtatás / PDF
          </Button>
        </Stack>
      }
    />
  );

  return (
    <Frame header={header} stickyBar={!submission && !frozen}>
      {frozen && (
        <Box sx={{ background: palette.lime, color: palette.ink }} className="no-print">
          <Container maxWidth="lg" sx={{ py: 1.5, display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Megosztott ajánlat <b>{frozen.code}</b> · így látta a kitöltő ekkor: {savedFormat.format(frozen.savedAt)}
              {frozen.ageMinutes === null ? " (kedvezmények nélkül)" : ""}
            </Typography>
            <LoadSharedOfferButton answers={answers} packageId={packageId} />
          </Container>
        </Box>
      )}
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
                      {offer.quote.review.required && <Box component="span" sx={{ fontSize: "0.5em", ml: 0.5 }}>-tól</Box>}
                    </Typography>
                    {offer.quote.review.required && (
                      <Box
                        component="button"
                        type="button"
                        onClick={() => scrollToId(REVIEW_ID)}
                        className="no-print"
                        sx={{ display: "inline-flex", mt: 1.25, mr: 1, minHeight: 36, px: 1.5, py: 0.5, borderRadius: 1.5, border: "1.5px solid #fff", background: "transparent", color: "#fff", font: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                      >
                        Technikai egyeztetés szükséges ↓
                      </Box>
                    )}
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
                    <Typography sx={{ color: palette.inkMuted, fontSize: 13 }}>Havi költség</Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {formatRon(pkg.maintenance.hostingMonthly)}/hó{" "}
                      <Box component="span" sx={{ fontWeight: 400, fontSize: 13, color: palette.inkMuted }}>
                        {quoteHostingShort(pkg.maintenance.hostingLabel)}
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: palette.inkMuted }}>
                      + karbantartás {formatRon(pkg.maintenance.supportMonthly)}/hó, nem kötelező
                    </Typography>
                  </Box>
                </Stack>
                <OfferCodeBadge code={code} />
                <Box sx={{ mt: 3, display: frozen ? "none" : "block" }} className="no-print">
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

        {/* Custom / risky requests: the price is a starting estimate – say so before anything else. */}
        {pricesReady && <ReviewNotice quote={offer.quote} />}

        {/* 2 – All discounts in one place (only while the request is still open). */}
        {!submission && pricesReady && (
          <Box className="no-print">
            <DiscountsPanel
              pkg={pkg}
              clockState={clockState}
              onDeadlineChange={(weeks) => wizardStore.update({ answers: { ...answers, deadlineWeeks: String(weeks) } })}
              onSelectPackage={selectPackage}
              onCta={() => scrollToId(CONTACT_ID)}
              frozenAgeMinutes={frozen ? (frozen.ageMinutes ?? Number.MAX_SAFE_INTEGER) : undefined}
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
          {pricesReady ? (
            <PricingCards
              quote={offer.quote}
              mode="offer"
              selected={packageId}
              readOnly={Boolean(frozen)}
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
        <Box id={CONTACT_ID} component="section" className="no-print" sx={{ mt: { xs: 6, md: 8 }, scrollMarginTop: 24, display: frozen ? "none" : "block" }}>
          {submission ? (
            <SubmittedPanel submission={submission} packageName={pkg.name} nextSteps={offer.nextSteps} />
          ) : (
            <>
              <ContactForm
                answers={answers}
                packageId={packageId}
                packageName={pkg.name}
                onSubmitted={(copySent) => wizardStore.update({ submission: { at: Date.now(), copySent } })}
              />
              <SaveOffer answers={answers} packageId={packageId} packageName={pkg.name} price={pkg.finalPrice} code={code} />
            </>
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

      {!submission && !frozen && (
        <>
          <StickyCta targetId={CONTACT_ID} price={pkg.finalPrice} packageName={pkg.name} clockState={clockState} pricesReady={pricesReady} hideWhileVisible={["hero-cta", DISCOUNTS_ID]} fromPrice={offer.quote.review.required} />
        </>
      )}
    </Frame>
  );
}
