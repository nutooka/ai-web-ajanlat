"use client";

import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "motion/react";
import { PROJECT_TYPE_LABELS } from "@/features/offer/buildOffer";
import type { Quote } from "@/features/pricing/types";
import { formatRon } from "@/lib/format";
import { palette } from "@/theme/tokens";

const MAX_FEATURES = 6;

/** Desktop-only "consultant" panel: what we know so far and the live price range. */
export function WizardSidebar({ quote, answeredCount }: { quote: Quote | null; answeredCount: number }) {
  const features = quote?.packages.standard.items.filter((item) => item.source === "answer").map((item) => item.label) ?? [];

  return (
    <Stack spacing={2} component="aside" aria-label="A projekted összefoglalója" sx={{ position: "sticky", top: 112 }}>
      <Box sx={{ borderRadius: 4, p: 3, background: palette.ink, color: "#fff", position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "relative" }}>
          <Typography sx={{ fontSize: 13, opacity: 0.65 }}>A projekted</Typography>
          <Typography variant="h5" component="p" sx={{ mt: 0.5 }}>
            {quote ? PROJECT_TYPE_LABELS[quote.projectType] : "Még formálódik…"}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: 13, opacity: 0.65 }}>Becsült keret (Basic – Premium)</Typography>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={quote ? `${quote.packages.basic.finalPrice}-${quote.packages.premium.finalPrice}` : "none"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em" }}>
                  {quote ? `${formatRon(quote.packages.basic.finalPrice)} – ${formatRon(quote.packages.premium.finalPrice)}` : "–"}
                </Typography>
              </motion.div>
            </AnimatePresence>
            {quote && quote.packages.standard.discounts.length > 0 && (
              <Box component="span" sx={{ display: "inline-block", mt: 1, px: 1.25, py: 0.25, borderRadius: 999, background: "rgba(255,255,255,.12)", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                Indulási kedvezménnyel
              </Box>
            )}
          </Box>

          {features.length > 0 && (
            <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0, mt: 3, pt: 2.5, borderTop: "1px solid rgba(255,255,255,.12)" }}>
              {features.slice(0, MAX_FEATURES).map((feature) => (
                <Stack component="li" key={feature} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                  <CheckCircleOutlineOutlined sx={{ fontSize: 16, mt: "3px", color: "rgba(255,255,255,.6)" }} />
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {feature}
                  </Typography>
                </Stack>
              ))}
              {features.length > MAX_FEATURES && (
                <Typography variant="body2" sx={{ opacity: 0.6, pl: 3 }}>
                  + {features.length - MAX_FEATURES} további
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Box>

      <Box sx={{ borderRadius: 3, p: 2.5, background: palette.surface, border: 1, borderColor: "divider" }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {answeredCount} válasz elmentve
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bármikor visszaléphetsz vagy később folytathatod – a böngésződ megjegyzi, hol tartasz.
        </Typography>
      </Box>
    </Stack>
  );
}
