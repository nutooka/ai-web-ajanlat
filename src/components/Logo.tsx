"use client";

import Box from "@mui/material/Box";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { palette } from "@/theme/tokens";

export function Logo() {
  return (
    <Box
      component={Link}
      href="/"
      aria-label={`${siteConfig.name} – kezdőlap`}
      sx={{ display: "inline-flex", alignItems: "center", gap: 1.25, color: "text.primary", textDecoration: "none" }}
    >
      <Box
        aria-hidden
        sx={{
          width: 32,
          height: 32,
          borderRadius: "10px",
          background: palette.ink,
          display: "grid",
          placeItems: "center",
          color: palette.accent,
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 18,
        }}
      >
        n
      </Box>
      <Box component="span" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
        nutooka<Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}> / tervező</Box>
      </Box>
    </Box>
  );
}
