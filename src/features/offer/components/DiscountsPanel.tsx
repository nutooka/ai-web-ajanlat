"use client";

import BoltOutlined from "@mui/icons-material/BoltOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import { pricingConfig } from "@/config/pricing";
import { resolveQuickDecision } from "@/features/pricing/quickDecision";
import type { PackageId, PackageQuote } from "@/features/pricing/types";
import { formatRon } from "@/lib/format";
import { ease, palette } from "@/theme/tokens";
import { formatCountdown, offerAgeMinutesFrom, useNow, type OfferClockState } from "../useOfferClock";
import { DeadlineSliderControl } from "./DeadlineSlider";

export const DISCOUNTS_ID = "kedvezmenyek";
const AMBER_SOFT = "#FFF4E0";

interface DiscountsPanelProps {
  pkg: PackageQuote;
  clockState: OfferClockState;
  onDeadlineChange: (weeks: number) => void;
  onSelectPackage: (id: PackageId) => void;
  onCta: () => void;
}

/** Everything the visitor can save, in one place: quick decision, flexible deadline, package bonus. */
export function totalSavings(pkg: PackageQuote): number {
  return pkg.savings + Math.max(0, -pkg.urgencyAdjustment);
}

function Section({ icon, title, value, active, children }: { icon: React.ReactNode; title: string; value: string; active: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ py: { xs: 2.5, md: 3 }, borderTop: 1, borderColor: "divider", display: "grid", gridTemplateColumns: { xs: "1fr", md: "260px 1fr" }, gap: { xs: 1.5, md: 4 }, alignItems: "center" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Box sx={{ flexShrink: 0, width: 40, height: 40, borderRadius: 2.5, display: "grid", placeItems: "center", background: active ? palette.amber : palette.paper, color: palette.ink }}>{icon}</Box>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: 18, fontVariantNumeric: "tabular-nums", color: active ? palette.ink : "text.secondary" }}>{value}</Typography>
        </Box>
      </Stack>
      <Box>{children}</Box>
    </Box>
  );
}

export function DiscountsPanel({ pkg, clockState, onDeadlineChange, onSelectPackage, onCta }: DiscountsPanelProps) {
  const quickConfig = pricingConfig.discounts.quickDecision;
  const now = useNow(1000);
  const quick = resolveQuickDecision(quickConfig, offerAgeMinutesFrom(clockState.clock, now));
  const quickDiscount = pkg.discounts.find((discount) => discount.id === "quick");
  const packageDiscount = pkg.discounts.find((discount) => discount.id.startsWith("package."));
  const bonusPackage = (Object.entries(pricingConfig.discounts.perPackage).find(([, discount]) => discount?.enabled)?.[0] ?? null) as PackageId | null;
  const flexSaving = Math.max(0, -pkg.urgencyAdjustment);
  const total = totalSavings(pkg);
  const fullPrice = pkg.finalPrice + total;

  const steps = [
    ...quickConfig.tiers.map((tier, index) => ({
      label: `−${tier.percent}%`,
      detail: index === 0 ? `első ${tier.withinMinutes} perc` : `${quickConfig.tiers[index - 1].withinMinutes / 60}–${tier.withinMinutes / 60} óra`,
    })),
    { label: "Teljes ár", detail: `${(quickConfig.tiers.at(-1)?.withinMinutes ?? 0) / 60} óra után` },
  ];
  const activeStep = quick.expired ? steps.length - 1 : quick.tierIndex;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: ease.out }}>
      <Box id={DISCOUNTS_ID} component="section" aria-labelledby="discounts-title" sx={{ mt: 3, scrollMarginTop: 24, borderRadius: 4, border: `2px solid ${palette.amber}`, background: palette.surface, overflow: "hidden" }}>
        {/* Summary: one big number. */}
        <Box sx={{ background: AMBER_SOFT, px: { xs: 2.5, md: 4 }, py: { xs: 2.5, md: 3 }, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { md: "center" }, gap: 2 }}>
          <Box>
            <Typography id="discounts-title" variant="h4" component="h2">
              A kedvezményeid
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pkg.name} csomag · eredeti ár <s>{formatRon(fullPrice)}</s> → most <b>{formatRon(pkg.finalPrice)}</b>
            </Typography>
          </Box>
          <Box aria-live="polite" sx={{ textAlign: { md: "right" } }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Összes megtakarítás</Typography>
            <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: { xs: 36, md: 44 }, lineHeight: 1.05, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              −{formatRon(total)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2.5, md: 4 } }}>
          {/* 1 – Quick decision. */}
          {quickConfig.enabled && (
            <Section
              icon={<BoltOutlined />}
              title="Gyors döntés"
              value={quickDiscount ? `−${quickDiscount.percent}% · −${formatRon(quickDiscount.amount)}` : "lejárt"}
              active={Boolean(quickDiscount)}
            >
              <Stack spacing={1.5}>
                <Typography variant="body2">
                  {quick.expired ? (
                    "Ez a kedvezmény lejárt. Az egyeztetés továbbra is ingyenes."
                  ) : (
                    <>
                      Kérj egyeztetést{" "}
                      {quick.minutesLeft !== null ? (
                        <>
                          még{" "}
                          <Box component="span" sx={{ px: 0.75, py: 0.25, borderRadius: 1, background: palette.amber, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                            {formatCountdown(quick.minutesLeft)}
                          </Box>{" "}
                          alatt
                        </>
                      ) : (
                        "1 órán belül"
                      )}
                      , és rögzítjük. {quick.nextPercent > 0 ? `Utána már csak −${quick.nextPercent}%.` : "Utána teljes ár."}{" "}
                      <Box component="button" type="button" onClick={onCta} sx={{ p: 0, minHeight: 44, border: 0, background: "none", font: "inherit", fontWeight: 700, color: palette.ink, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>
                        Egyeztetést kérek most
                      </Box>
                    </>
                  )}
                </Typography>
                <Box component="ol" aria-label="Kedvezménysávok" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 1 }}>
                  {steps.map((step, index) => {
                    const isActive = index === activeStep;
                    const past = index < activeStep;
                    return (
                      <Box
                        component="li"
                        key={step.label}
                        aria-current={isActive ? "step" : undefined}
                        sx={{ py: 1, px: 1, borderRadius: 2, textAlign: "center", border: `1.5px solid ${isActive ? palette.ink : palette.line}`, background: isActive ? palette.amber : palette.surface, color: past ? "text.secondary" : palette.ink, textDecoration: past ? "line-through" : "none" }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>{step.label}</Typography>
                        <Typography sx={{ fontSize: 12 }}>{step.detail}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Stack>
            </Section>
          )}

          {/* 2 – Flexible deadline. */}
          <Section icon={<ScheduleOutlined />} title="Rugalmas határidő" value={flexSaving > 0 ? `−${formatRon(flexSaving)}` : "húzd jobbra"} active={flexSaving > 0}>
            <Typography id="discount-deadline" variant="body2" sx={{ mb: 1 }}>
              Mikorra kell elkészülnie? Minél több időt adsz, annál olcsóbb.
            </Typography>
            <DeadlineSliderControl pkg={pkg} onChange={onDeadlineChange} labelledBy="discount-deadline" showAmount />
          </Section>

          {/* 3 – Package bonus. */}
          {bonusPackage && (
            <Section
              icon={<Inventory2Outlined />}
              title={`${pricingConfig.packages[bonusPackage].name} csomag extra`}
              value={packageDiscount ? `−${packageDiscount.percent}% · −${formatRon(packageDiscount.amount)}` : `+${pricingConfig.discounts.perPackage[bonusPackage]?.percent ?? 0}% ha ezt választod`}
              active={Boolean(packageDiscount)}
            >
              {packageDiscount ? (
                <Typography variant="body2">A {pkg.name} csomaghoz extra kedvezmény jár – ez már benne van az árban.</Typography>
              ) : (
                <Typography variant="body2">
                  A {pricingConfig.packages[bonusPackage].name} csomagra további −{pricingConfig.discounts.perPackage[bonusPackage]?.percent}% jár.{" "}
                  <ButtonBase onClick={() => onSelectPackage(bonusPackage)} sx={{ minHeight: 44, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3, font: "inherit" }}>
                    Átváltok a {pricingConfig.packages[bonusPackage].name} csomagra
                  </ButtonBase>
                </Typography>
              )}
            </Section>
          )}
        </Box>
      </Box>
    </motion.div>
  );
}
