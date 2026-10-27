"use client";

import TimerOutlined from "@mui/icons-material/TimerOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import { pricingConfig } from "@/config/pricing";
import { resolveQuickDecision } from "@/features/pricing/quickDecision";
import { ease, palette } from "@/theme/tokens";
import { formatCountdown, offerAgeMinutesFrom, useNow, type OfferClock } from "../useOfferClock";

/** Countdown for the time-limited discount, with the three price steps laid out. */
export function QuickDecisionBanner({ clock, onCta }: { clock: OfferClock | null; onCta: () => void }) {
  const config = pricingConfig.discounts.quickDecision;
  const now = useNow(1000);
  const state = resolveQuickDecision(config, offerAgeMinutesFrom(clock, now));
  if (!config.enabled || config.tiers.length === 0) return null;

  const steps = [
    ...config.tiers.map((tier, index) => ({
      label: `−${tier.percent}%`,
      detail: index === 0 ? `első ${tier.withinMinutes} percben` : `${config.tiers[index - 1].withinMinutes / 60}–${tier.withinMinutes / 60} óra között`,
    })),
    { label: "Teljes ár", detail: `${config.tiers.at(-1)!.withinMinutes / 60} óra után` },
  ];
  const activeStep = state.expired ? steps.length - 1 : state.tierIndex;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: ease.out }}>
      <Box
        sx={{
          mt: 3,
          p: "2px",
          borderRadius: 4,
          background: state.expired ? palette.line : "linear-gradient(120deg, #FFB547, #FF5E7E 45%, #D4FF3A)",
        }}
      >
        <Box sx={{ borderRadius: "14px", background: palette.ink, color: "#fff", p: { xs: 2.5, md: 3 }, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" }, gap: { xs: 2.5, md: 4 }, alignItems: "center" }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ flexShrink: 0, width: 52, height: 52, borderRadius: 3, display: "grid", placeItems: "center", background: state.expired ? palette.inkSoft : palette.lime, color: palette.ink }}>
              <TimerOutlined />
            </Box>
            <Box>
              {state.expired ? (
                <>
                  <Typography sx={{ fontWeight: 700, fontSize: 18 }}>A gyors döntés kedvezmény lejárt</Typography>
                  <Typography variant="body2" sx={{ color: palette.inkMuted }}>
                    Az árak már teljes áron szerepelnek. Kérdésed van? Az egyeztetés továbbra is ingyenes.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
                    <Box component="span" sx={{ color: palette.lime }}>
                      −{state.percent}% kedvezmény
                    </Box>
                    , ha{" "}
                    {state.minutesLeft !== null ? (
                      <>
                        még{" "}
                        <Box component="span" sx={{ color: palette.lime, fontVariantNumeric: "tabular-nums" }}>
                          {formatCountdown(state.minutesLeft)}
                        </Box>{" "}
                        alatt
                      </>
                    ) : (
                      "1 órán belül"
                    )}{" "}
                    egyeztetést kérsz.
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.inkMuted }}>
                    {state.nextPercent > 0 ? `Utána −${state.nextPercent}%, később teljes ár.` : "Utána teljes ár."} A kedvezményt a kérésed beérkezésekor rögzítjük.
                  </Typography>
                  <Box
                    component="button"
                    type="button"
                    onClick={onCta}
                    sx={{ mt: 1, p: 0, border: 0, background: "none", color: "#fff", font: "inherit", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}
                  >
                    Egyeztetést kérek most
                  </Box>
                </>
              )}
            </Box>
          </Stack>

          <Box component="ol" aria-label="Kedvezménysávok" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 1 }}>
            {steps.map((step, index) => {
              const active = index === activeStep;
              const past = index < activeStep;
              return (
                <Box
                  component="li"
                  key={step.label}
                  aria-current={active ? "step" : undefined}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    textAlign: "center",
                    background: active ? palette.lime : palette.inkSoft,
                    color: active ? palette.ink : past ? "rgba(255,255,255,.35)" : "#fff",
                    textDecoration: past ? "line-through" : "none",
                    transition: "background .3s ease",
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>{step.label}</Typography>
                  <Typography sx={{ fontSize: 12, opacity: active ? 0.75 : 0.6 }}>{step.detail}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}
