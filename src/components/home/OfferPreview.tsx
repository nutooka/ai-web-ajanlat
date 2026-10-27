"use client";

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

/** Decorative sample of what the visitor will get – the page's one entrance animation. */
export function OfferPreview() {
  return (
    <Box aria-hidden sx={{ display: { xs: "none", sm: "block" } }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <Box sx={{ background: palette.surface, border: 1, borderColor: "divider", borderRadius: 4, p: 4, boxShadow: "0 24px 48px -32px rgba(20,22,26,.25)" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 3 }}>
            <Typography sx={{ fontWeight: 600 }}>Standard csomag</Typography>
            <Typography variant="body2" color="text.secondary">
              2–3 hét
            </Typography>
          </Stack>
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {lines.map(([label, price]) => (
              <Stack
                component="li"
                key={label}
                direction="row"
                sx={{ justifyContent: "space-between", py: 1.25, borderBottom: 1, borderColor: "divider", fontSize: 15 }}
              >
                <span>{label}</span>
                <Box component="span" sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
                  {price} RON
                </Box>
              </Stack>
            ))}
          </Box>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Becsült projektár
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "baseline" }}>
              <Typography variant="body2" sx={{ color: "text.secondary", textDecoration: "line-through" }}>
                3 300
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: palette.ink }}>
                2 300 RON
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </motion.div>
    </Box>
  );
}
