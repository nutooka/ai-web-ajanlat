"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import { ease, palette } from "@/theme/tokens";

/** Headline with a lime "marker" sweeping behind the key word – the page's signature motion. */
export function HeroTitle() {
  return (
    <Typography variant="h1" sx={{ color: "#fff", maxWidth: 640 }}>
      <motion.span initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: ease.out }} style={{ display: "block" }}>
        Tervezzük meg
      </motion.span>
      <motion.span
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: ease.out }}
        style={{ display: "block" }}
      >
        együtt a{" "}
        <Box component="span" sx={{ position: "relative", display: "inline-block", px: "0.12em", mx: "-0.04em" }}>
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.55, ease: ease.out }}
            style={{ position: "absolute", inset: "0.08em 0 0.02em", background: palette.lime, borderRadius: 6, transformOrigin: "left", zIndex: 0 }}
          />
          <motion.span
            initial={{ color: "#FFFFFF" }}
            animate={{ color: palette.ink }}
            transition={{ duration: 0.3, delay: 0.85 }}
            style={{ position: "relative", zIndex: 1 }}
          >
            weboldalad.
          </motion.span>
        </Box>
      </motion.span>
    </Typography>
  );
}
