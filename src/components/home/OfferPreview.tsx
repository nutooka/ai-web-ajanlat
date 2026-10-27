"use client";

import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import { palette } from "@/theme/tokens";

const lines = [
  ["UI design", "960"],
  ["Reszponzív fejlesztés", "1 280"],
  ["Blog modul", "800"],
  ["Kapcsolati űrlap", "240"],
];

/** Decorative sample of what the visitor will get. */
export function OfferPreview() {
  return (
    <Box aria-hidden sx={{ position: "relative", display: { xs: "none", sm: "block" } }}>
      <motion.div initial={{ opacity: 0, y: 24, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: -2 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <Box sx={{ background: palette.ink, color: "#fff", borderRadius: 4, p: 3.5, boxShadow: "0 40px 80px -40px rgba(20,22,26,.6)" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography sx={{ opacity: 0.7, fontSize: 13 }}>Személyre szabott ajánlat</Typography>
            <Box sx={{ background: palette.accent, color: palette.ink, px: 1.25, py: 0.25, borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
              Standard
            </Box>
          </Stack>
          <Stack spacing={1.25}>
            {lines.map(([label, price], index) => (
              <motion.div key={label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.12 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", fontSize: 14 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Check sx={{ fontSize: 16, color: palette.accent }} />
                    <span>{label}</span>
                  </Stack>
                  <Box component="span" sx={{ opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>
                    {price} RON
                  </Box>
                </Stack>
              </motion.div>
            ))}
          </Stack>
          <Box sx={{ borderTop: "1px solid rgba(255,255,255,.12)", mt: 3, pt: 2.5 }}>
            <Typography sx={{ opacity: 0.6, fontSize: 13 }}>Becsült projektár</Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "baseline" }}>
              <Typography sx={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em" }}>
                2 300 RON
              </Typography>
              <Typography sx={{ opacity: 0.5, textDecoration: "line-through" }}>3 300</Typography>
            </Stack>
          </Box>
        </Box>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        style={{ position: "absolute", left: -24, bottom: -28 }}
      >
        <Box sx={{ background: palette.surface, borderRadius: 4, px: 2.5, py: 1.5, border: 1, borderColor: "divider", boxShadow: "0 20px 40px -24px rgba(20,22,26,.4)" }}>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Becsült átfutás</Typography>
          <Typography sx={{ fontWeight: 700 }}>2–3 hét</Typography>
        </Box>
      </motion.div>
    </Box>
  );
}
