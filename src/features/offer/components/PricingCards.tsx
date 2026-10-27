"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import { PACKAGE_IDS, type PackageId, type Quote } from "@/features/pricing/types";
import { formatRon, formatWeeks } from "@/lib/format";
import { ease, packageThemes, palette } from "@/theme/tokens";

const MAX_ROWS = 6;
const priceFormatter = new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0, useGrouping: "always" });

interface PricingCardsProps {
  quote: Quote;
  /** Selectable mode (offer page). Without it, cards are links to `ctaHref`. */
  selected?: PackageId;
  onSelect?: (id: PackageId) => void;
  ctaHref?: string;
  onCta?: () => void;
}

/** The rows we compare: what the visitor asked for, then the Premium extras. */
function comparisonRows(quote: Quote) {
  const premium = quote.packages.premium.items;
  const answer = premium.filter((item) => item.source === "answer");
  const extras = premium.filter((item) => item.source === "premium");
  const essentialFirst = [...answer].sort((a, b) => Number(quote.packages.basic.items.some((i) => i.id === b.id)) - Number(quote.packages.basic.items.some((i) => i.id === a.id)));
  return [...essentialFirst, ...extras].slice(0, MAX_ROWS);
}

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
      <Box sx={{ position: "absolute", width: 26, height: 26, borderRadius: "50%", right: 22, bottom: 30, background: "rgba(255,255,255,.35)" }} />
      <Box sx={{ position: "absolute", width: 70, height: 70, borderRadius: "50%", right: -18, top: -22, background: "rgba(255,255,255,.18)" }} />
    </Box>
  );
}

export function PricingCards({ quote, selected, onSelect, ctaHref, onCta }: PricingCardsProps) {
  const rows = comparisonRows(quote);
  const selectable = Boolean(onSelect);

  return (
    <Box
      role={selectable ? "radiogroup" : undefined}
      aria-label={selectable ? "Csomag kiválasztása" : undefined}
      sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: { xs: 3, md: 2.5 }, alignItems: "center" }}
    >
      {PACKAGE_IDS.map((id, index) => {
        const pkg = quote.packages[id];
        const theme = packageThemes[id];
        const featured = id === "standard";
        const isSelected = selected === id;
        const recommended = quote.recommended === id;

        return (
          <motion.div
            key={id}
            initial={{ y: 40 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: ease.out }}
            whileHover={{ y: -6 }}
            style={{ height: "100%" }}
          >
            <Box
              role={selectable ? "radio" : undefined}
              aria-checked={selectable ? isSelected : undefined}
              sx={{
                position: "relative",
                height: "100%",
                borderRadius: 5,
                overflow: "hidden",
                background: palette.inkSoft,
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                transform: { md: featured ? "scale(1.04)" : "none" },
                boxShadow: isSelected
                  ? `0 0 0 3px ${palette.lime}, 0 30px 60px -30px rgba(0,0,0,.6)`
                  : featured
                    ? "0 40px 70px -35px rgba(255,94,126,.55)"
                    : "0 30px 60px -36px rgba(0,0,0,.55)",
                transition: "box-shadow .25s ease",
              }}
            >
              {/* Gradient header */}
              <Box sx={{ position: "relative", background: theme.gradient, color: theme.headerText, px: 3, pt: 3, pb: 7, textAlign: "center" }}>
                <HeaderDecor bubble={theme.bubble} />
                <Box sx={{ position: "relative" }}>
                  {(recommended || featured) && (
                    <Box sx={{ display: "inline-block", mb: 1, px: 1.25, py: 0.25, borderRadius: 999, background: "rgba(14,15,18,.85)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {recommended ? "Neked ajánlott" : "Legnépszerűbb"}
                    </Box>
                  )}
                  <Typography sx={{ fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 15 }}>{pkg.name}</Typography>
                  {pkg.savings > 0 && (
                    <Typography sx={{ mt: 1.5, fontSize: 14, opacity: 0.8, textDecoration: "line-through" }}>{formatRon(pkg.listPrice)}</Typography>
                  )}
                  <Stack direction="row" sx={{ justifyContent: "center", alignItems: "flex-start", gap: 0.75, mt: pkg.savings > 0 ? 0 : 1.5 }}>
                    <Typography component="span" sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: { xs: 52, md: featured ? 60 : 52 }, lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
                      {priceFormatter.format(pkg.finalPrice)}
                    </Typography>
                    <Typography component="span" sx={{ fontWeight: 700, fontSize: 16, mt: 0.75 }}>
                      RON
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 13, opacity: 0.85, mt: 0.5 }}>egyszeri díj · {formatWeeks(pkg.timeline.minWeeks, pkg.timeline.maxWeeks)}</Typography>
                </Box>
              </Box>

              {/* Body */}
              <Box sx={{ px: 3, pt: 1, pb: 3, display: "flex", flexDirection: "column", flex: 1 }}>
                <Typography sx={{ textAlign: "center", color: palette.inkMuted, fontSize: 14, mb: 2 }}>{pkg.tagline}</Typography>
                <Stack component="ul" sx={{ listStyle: "none", p: 0, m: 0, flex: 1 }}>
                  <Row included label={pkg.design.label} />
                  {rows.map((row) => (
                    <Row key={row.id} included={pkg.items.some((item) => item.id === row.id)} label={row.label} />
                  ))}
                </Stack>

                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                  <ButtonBase
                    component={selectable ? "button" : "a"}
                    href={selectable ? undefined : ctaHref}
                    onClick={() => (selectable ? onSelect?.(id) : onCta?.())}
                    sx={{
                      px: 3.5,
                      py: 1.4,
                      borderRadius: 999,
                      fontWeight: 700,
                      fontSize: 15,
                      color: theme.headerText,
                      background: theme.gradient,
                      boxShadow: `0 12px 24px -12px ${theme.bubble}`,
                      transition: "transform .2s ease, filter .2s ease",
                      "&:hover": { transform: "translateY(-2px)", filter: "saturate(1.15)" },
                      "&.Mui-focusVisible": { outline: `2px solid #fff`, outlineOffset: 3 },
                      gap: 1,
                    }}
                  >
                    {selectable ? (isSelected ? <>Kiválasztva <Check sx={{ fontSize: 18 }} /></> : "Ezt választom") : <>Kiszámolom az enyémet <ArrowForward sx={{ fontSize: 18 }} /></>}
                  </ButtonBase>
                </Box>
              </Box>
            </Box>
          </motion.div>
        );
      })}
    </Box>
  );
}

function Row({ included, label }: { included: boolean; label: string }) {
  const Icon = included ? Check : Close;
  return (
    <Stack component="li" direction="row" spacing={1.5} sx={{ alignItems: "center", py: 1.1, borderBottom: `1px solid ${palette.inkLine}` }}>
      <Box
        sx={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: `1.5px solid ${included ? palette.check : palette.cross}`,
          color: included ? palette.check : palette.cross,
        }}
      >
        <Icon sx={{ fontSize: 15 }} />
      </Box>
      <Typography sx={{ fontSize: 14, color: included ? "#fff" : palette.inkMuted }}>{label}</Typography>
    </Stack>
  );
}
