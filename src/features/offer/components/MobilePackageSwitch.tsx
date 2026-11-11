"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { PACKAGE_IDS, type PackageId, type Quote } from "@/features/pricing/types";
import { formatRon } from "@/lib/format";
import { packageThemes, palette } from "@/theme/tokens";

/**
 * Phones: a segmented switch above the single visible card.
 * Plain toggle buttons (aria-pressed): a tap only changes which package is shown/selected – it never scrolls.
 */
export function MobilePackageSwitch({
  quote,
  active,
  onPick,
  tone,
}: {
  quote: Quote;
  active: PackageId;
  onPick: (id: PackageId) => void;
  tone: "home" | "offer";
}) {
  return (
    <Box
      role="group"
      aria-label="Csomagok"
      sx={{
        display: { xs: "grid", md: "none" },
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 0.5,
        p: 0.5,
        mb: 2.5,
        borderRadius: 3,
        background: tone === "home" ? palette.inkSoft : palette.ink,
      }}
    >
      {PACKAGE_IDS.map((id) => {
        const isActive = id === active;
        return (
          <ButtonBase
            key={id}
            aria-pressed={isActive}
            onClick={() => onPick(id)}
            sx={{
              minHeight: 56,
              borderRadius: 2.5,
              flexDirection: "column",
              background: isActive ? packageThemes[id].gradient : "transparent",
              color: isActive ? palette.ink : "#fff",
              transition: "background .2s ease",
              "&.Mui-focusVisible": { outline: "2px solid #fff", outlineOffset: 2 },
            }}
          >
            <Typography component="span" sx={{ fontWeight: 700, fontSize: 14 }}>
              {quote.packages[id].name}
            </Typography>
            <Typography component="span" sx={{ fontSize: 13, opacity: isActive ? 0.8 : 0.7, fontVariantNumeric: "tabular-nums" }}>
              {formatRon(quote.packages[id].finalPrice)}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
