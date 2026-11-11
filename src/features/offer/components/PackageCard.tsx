"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { PACKAGE_IDS, type PackageId, type Quote } from "@/features/pricing/types";
import { formatRon, formatWeeks } from "@/lib/format";
import { packageThemes, palette, shadow } from "@/theme/tokens";
import { COMPARISON_ID } from "./Comparison";
import { RequestStatus, Row, type PackageTheme } from "./PricingRows";
import type { ContentRow, TierContents } from "./tierContents";

const priceFormatter = new Intl.NumberFormat("hu-HU", {
  maximumFractionDigits: 0,
  useGrouping: "always",
});

/** Small uppercase pill above the package name ("Legnépszerűbb", "A te választásod" …). */
const pillSx = {
  px: 1.25,
  py: 0.25,
  borderRadius: 999,
  background: palette.ink,
  color: "#fff",
  fontSize: 13,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
} as const;

const ctaSx = {
  minHeight: 48,
  px: 3.5,
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 15,
  gap: 1,
  "&:hover": { transform: "translateY(-2px)" },
  "&.Mui-focusVisible": { outline: "2px solid #fff", outlineOffset: 3 },
} as const;

/** Decorative wave + bubbles at the bottom of the gradient header. */
function HeaderDecor({ bubble }: { bubble: string }) {
  return (
    <Box aria-hidden>
      <Box
        component="svg"
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
        sx={{ position: "absolute", left: 0, right: 0, bottom: -1, width: "100%", height: 54, display: "block" }}
      >
        <path d="M0,38 C70,74 140,6 220,30 C290,52 340,58 400,24 L400,70 L0,70 Z" fill={palette.inkSoft} />
      </Box>
      <Box sx={{ position: "absolute", width: 46, height: 46, borderRadius: "50%", left: 18, bottom: 6, background: bubble, opacity: 0.9 }} />
      <Box sx={{ position: "absolute", width: 16, height: 16, borderRadius: "50%", left: 72, bottom: 4, background: bubble, opacity: 0.75 }} />
      <Box sx={{ position: "absolute", width: 70, height: 70, borderRadius: "50%", right: -18, top: -22, background: "rgba(255,255,255,.22)" }} />
    </Box>
  );
}

export interface PackageCardProps {
  quote: Quote;
  id: PackageId;
  index: number;
  mode: "home" | "offer";
  contents: TierContents;
  requested: Set<string>;
  requestedRows: ContentRow[];
  /** Offer page: the cards are selectable. */
  selectable: boolean;
  isSelected: boolean;
  readOnly: boolean;
  /** The explicit "Ezt választom" button. */
  onChoose: (id: PackageId) => void;
}

export function PackageCard({ quote, id, index, mode, contents, requested, requestedRows, selectable, isSelected, readOnly, onChoose }: PackageCardProps) {
  const pkg = quote.packages[id];
  const theme = packageThemes[id];
  const featured = mode === "home" && id === "standard";
  const recommended = mode === "offer" && quote.recommended === id;
  const badge = featured ? "Legnépszerűbb" : recommended ? "Neked ajánlott" : null;
  // In the offer one card is "yours": it is lifted and outlined, the others step back.
  const dimmed = selectable && !isSelected;

  return (
    <div
      className="reveal"
      // The chosen card gets a 4px brand-gradient ring (a padded gradient frame – borders can't be gradients).
      style={{
        height: "100%",
        padding: selectable ? 4 : 0,
        borderRadius: 20,
        background: isSelected ? theme.gradient : "transparent",
        transition: "background .25s ease",
      }}
    >
      <Box
        role="group"
        aria-label={`${pkg.name} csomag, ${formatRon(pkg.finalPrice)}${isSelected ? ", kiválasztva" : ""}`}
        sx={{
          position: "relative",
          height: "100%",
          borderRadius: 4,
          overflow: "hidden",
          background: palette.inkSoft,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          boxShadow: shadow.raisedOnDark,
          opacity: dimmed ? 0.72 : 1,
          filter: dimmed ? "saturate(.75)" : "none",
          transform: isSelected ? { md: "translateY(-8px)" } : "none",
          transition: "box-shadow .25s ease, opacity .25s ease, filter .25s ease, transform .25s ease",
          "&:hover": dimmed ? { opacity: 0.9, filter: "none" } : undefined,
        }}
      >
        <CardHeader quote={quote} id={id} theme={theme} badge={badge} selected={selectable && isSelected} readOnly={readOnly} />

        {/* Body */}
        <Box sx={{ px: 3, pt: 1, pb: 3, display: "flex", flexDirection: "column", flex: 1 }}>
          <Typography sx={{ textAlign: "center", color: palette.inkMuted, fontSize: 14, mb: mode === "offer" ? 1.5 : 2 }}>
            {pkg.tagline}
          </Typography>
          {/* One status line about the visitor's own requests. */}
          {requestedRows.length > 0 && (
            <RequestStatus theme={theme} missing={quote.requested.missing[id]} recommended={quote.recommended === id} />
          )}
          <Highlights quote={quote} id={id} index={index} theme={theme} contents={contents} requested={requested} />

          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            {readOnly ? (
              isSelected && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    minHeight: 48,
                    px: 3,
                    borderRadius: 999,
                    background: theme.gradient,
                    color: palette.ink,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  Ezt választotta <Check sx={{ fontSize: 18 }} />
                </Box>
              )
            ) : selectable ? (
              <ButtonBase
                onClick={() => onChoose(id)}
                aria-pressed={isSelected}
                sx={{
                  ...ctaSx,
                  color: isSelected ? palette.ink : "#fff",
                  background: isSelected ? theme.gradient : "transparent",
                  border: isSelected ? "1.5px solid transparent" : "1.5px solid rgba(255,255,255,.45)",
                  transition: "transform .2s ease, background .2s ease",
                }}
              >
                {isSelected ? (
                  <>
                    Kiválasztva <Check sx={{ fontSize: 18 }} />
                  </>
                ) : (
                  "Ezt választom"
                )}
              </ButtonBase>
            ) : (
              <ButtonBase
                component={Link}
                href="/tervezo"
                sx={{ ...ctaSx, color: palette.ink, background: theme.gradient, transition: "transform .2s ease" }}
              >
                Megtervezem a projektem <ArrowForward sx={{ fontSize: 18 }} />
              </ButtonBase>
            )}
          </Box>
        </Box>
      </Box>
    </div>
  );
}

/** Gradient header – package identity, always ink text. */
function CardHeader({
  quote,
  id,
  theme,
  badge,
  selected,
  readOnly,
}: {
  quote: Quote;
  id: PackageId;
  theme: PackageTheme;
  badge: string | null;
  selected: boolean;
  readOnly: boolean;
}) {
  const pkg = quote.packages[id];
  return (
    <Box sx={{ position: "relative", background: theme.gradient, color: theme.headerText, px: 3, pt: 3, pb: 7, textAlign: "center" }}>
      <HeaderDecor bubble={theme.bubble} />
      <Box sx={{ position: "relative" }}>
        <Box sx={{ minHeight: 26, mb: 0.5 }}>
          {selected ? (
            <Box
              component="span"
              sx={{ ...pillSx, display: "inline-flex", alignItems: "center", gap: 0.5, border: `1.5px solid ${palette.ink}`, fontWeight: 800 }}
            >
              <Check sx={{ fontSize: 14 }} /> {readOnly ? "Ezt választotta" : "A te választásod"}
            </Box>
          ) : (
            badge && (
              <Box component="span" sx={{ ...pillSx, display: "inline-block", fontWeight: 700 }}>
                {badge}
              </Box>
            )
          )}
        </Box>
        <Typography component="h3" sx={{ fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 15 }}>
          {pkg.name}
        </Typography>
        <Typography
          sx={{ mt: 1.25, fontSize: 14, fontWeight: 600, textDecoration: "line-through", visibility: pkg.savings > 0 ? "visible" : "hidden" }}
        >
          {formatRon(pkg.listPrice)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", visibility: pkg.savings > 0 ? "visible" : "hidden" }}>
          {pkg.savings > 0 ? pkg.discounts.map((discount) => `${discount.label} −${discount.percent}%`).join(" + ") : "–"}
        </Typography>
        <Stack direction="row" sx={{ justifyContent: "center", alignItems: "flex-start", gap: 0.75 }}>
          <Typography
            component="span"
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 52,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {priceFormatter.format(pkg.finalPrice)}
          </Typography>
          <Typography component="span" sx={{ fontWeight: 700, fontSize: 16, mt: 0.75 }}>
            {quote.review.required ? "RON-tól" : "RON"}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: 14, fontWeight: 600, mt: 0.5 }}>
          egyszeri díj · {formatWeeks(pkg.timeline.minWeeks, pkg.timeline.maxWeeks)}
        </Typography>
      </Box>
    </Box>
  );
}

/** What this package gives – short, the full list is in the comparison table below. */
function Highlights({
  quote,
  id,
  index,
  theme,
  contents,
  requested,
}: {
  quote: Quote;
  id: PackageId;
  index: number;
  theme: PackageTheme;
  contents: TierContents;
  requested: Set<string>;
}) {
  // Basic lists every base function plainly; the higher tiers say "everything in X" + what they add.
  // Every item is written out – no "és még N tétel".
  const highlights = index === 0 ? [...contents[id].base, ...contents[id].additions] : [...contents[id].additions];
  const lead = index === 0 ? null : `Minden, ami a ${quote.packages[PACKAGE_IDS[index - 1]].name} csomagban`;
  return (
    <Stack component="ul" sx={{ listStyle: "none", p: 0, m: 0, flex: 1 }}>
      {lead && <Row theme={theme} included label={lead} strong />}
      {highlights.map((row) => (
        <Row key={row.id} theme={theme} included label={index === 0 ? row.label : `+ ${row.label}`} requested={requested.has(row.id)} />
      ))}
      <Box component="li" sx={{ pt: 1, listStyle: "none" }}>
        <Box
          component="a"
          href={`#${COMPARISON_ID}`}
          sx={{ color: "#fff", fontSize: 14, textUnderlineOffset: 3, display: "inline-flex", minHeight: 44, alignItems: "center" }}
        >
          Részletes összehasonlítás ↓
        </Box>
      </Box>
    </Stack>
  );
}
