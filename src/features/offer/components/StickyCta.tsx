"use client";

import ArrowDownward from "@mui/icons-material/ArrowDownward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { pricingConfig } from "@/config/pricing";
import { resolveQuickDecision } from "@/features/pricing/quickDecision";
import { formatRon } from "@/lib/format";
import { formatCountdown, offerAgeMinutesFrom, useNow, type OfferClock } from "../useOfferClock";
import { ease, palette } from "@/theme/tokens";

/** Always-reachable "request a call" bar; hides itself once the contact form is on screen. */
export function StickyCta({ targetId, price, packageName, clock }: { targetId: string; price: number; packageName: string; clock: OfferClock | null }) {
  const [formVisible, setFormVisible] = useState(false);
  const now = useNow(1000);
  const quick = resolveQuickDecision(pricingConfig.discounts.quickDecision, offerAgeMinutesFrom(clock, now));

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <AnimatePresence>
      {!formVisible && (
        <motion.div
          className="no-print"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: ease.out }}
          style={{ position: "fixed", insetInline: 0, bottom: 0, zIndex: 20 }}
        >
          <Box sx={{ background: palette.ink, color: "#fff", pb: "env(safe-area-inset-bottom)" }}>
            <Container maxWidth="lg" sx={{ py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: palette.inkMuted, display: { xs: "none", sm: "block" } }}>
                  {packageName} csomag · becsült ár
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 0.25, sm: 1.25 } }}>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: 17, sm: 20 }, whiteSpace: "nowrap" }}>{formatRon(price)}</Typography>
                  {!quick.expired && quick.minutesLeft !== null && (
                    <Box sx={{ px: 1, py: 0.25, borderRadius: 1.5, background: palette.lime, color: palette.ink, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      −{quick.percent}% · {formatCountdown(quick.minutesLeft)}
                    </Box>
                  )}
                </Stack>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowDownward />}
                sx={{ whiteSpace: "nowrap", flexShrink: 0, px: { xs: 2, sm: 3.5 } }}
                onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Ingyenes egyeztetést kérek
                </Box>
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  Egyeztetést kérek
                </Box>
              </Button>
            </Container>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
