"use client";

import Box from "@mui/material/Box";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { palette } from "@/theme/tokens";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const onDark = tone === "light";
  return (
    <Box
      component={Link}
      href="/"
      aria-label={`${siteConfig.name} – kezdőlap`}
      sx={{ display: "inline-flex", alignItems: "center", gap: 1.25, minHeight: 44, color: onDark ? "#fff" : palette.ink, textDecoration: "none" }}
    >
      <Box
        aria-hidden
        sx={{
          width: 32,
          height: 32,
          borderRadius: "9px",
          background: palette.lime,
          display: "grid",
          placeItems: "center",
          color: palette.ink,
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 19,
          lineHeight: 1,
        }}
      >
        n
      </Box>
      <Box component="span" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
        nutooka
        <Box component="span" sx={{ color: onDark ? palette.inkMuted : palette.muted, fontWeight: 500 }}>
          {" "}
          / tervező
        </Box>
      </Box>
    </Box>
  );
}
