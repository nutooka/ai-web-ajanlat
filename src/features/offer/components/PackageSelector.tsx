"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { PACKAGE_IDS, type PackageId, type Quote } from "@/features/pricing/types";
import { formatRon, formatWeeks } from "@/lib/format";
import { palette } from "@/theme/tokens";

interface PackageSelectorProps {
  quote: Quote;
  selected: PackageId;
  onSelect: (id: PackageId) => void;
}

export function PackageSelector({ quote, selected, onSelect }: PackageSelectorProps) {
  return (
    <Box role="radiogroup" aria-label="Csomag kiválasztása" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
      {PACKAGE_IDS.map((id) => {
        const pkg = quote.packages[id];
        const active = id === selected;
        const recommended = id === quote.recommended;
        return (
          <ButtonBase
            key={id}
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(id)}
            sx={{
              position: "relative",
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              gap: 0.5,
              border: "1.5px solid",
              borderColor: active ? palette.ink : palette.line,
              background: active ? palette.ink : palette.surface,
              color: active ? "#fff" : palette.ink,
              transition: "all .2s ease",
              "&:hover": { borderColor: palette.ink, transform: "translateY(-2px)" },
              "&.Mui-focusVisible": { outline: `2px solid ${palette.ink}`, outlineOffset: 3 },
            }}
          >
            {recommended && (
              <Box sx={{ position: "absolute", top: 16, right: 16, px: 1.25, py: 0.25, borderRadius: 999, background: palette.lime, color: palette.ink, fontSize: 12, fontWeight: 700 }}>
                Ajánlott
              </Box>
            )}
            <Typography variant="h4" component="span">
              {pkg.name}
            </Typography>
            <Typography variant="body2" component="span" sx={{ opacity: 0.7, mb: 2 }}>
              {pkg.tagline}
            </Typography>
            {pkg.savings > 0 && (
              <Typography component="span" variant="body2" sx={{ textDecoration: "line-through", opacity: 0.55 }}>
                {formatRon(pkg.listPrice)}
              </Typography>
            )}
            <Typography component="span" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {formatRon(pkg.finalPrice)}
            </Typography>
            <Typography component="span" variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
              {formatWeeks(pkg.timeline.minWeeks, pkg.timeline.maxWeeks)} · {pkg.design.label.toLowerCase()}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
