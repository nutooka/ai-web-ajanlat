"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Check from "@mui/icons-material/Check";
import Remove from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { PACKAGE_IDS, type PackageId, type Quote } from "@/features/pricing/types";
import { formatRon, formatWeeks } from "@/lib/format";
import { ease, packageThemes, palette, shadow } from "@/theme/tokens";

const priceFormatter = new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 0, useGrouping: "always" });

interface PricingCardsProps {
  quote: Quote;
  /**
   * "home": marketing preview – Standard is featured ("Legnépszerűbb"), buttons link to the planner.
   * "offer": the visitor's own offer – only "Neked ajánlott" + the selected ring; cards are selectable.
   */
  mode: "home" | "offer";
  selected?: PackageId;
  onSelect?: (id: PackageId) => void;
  /** Shared snapshot: the chosen package stays marked, but cannot be changed. */
  readOnly?: boolean;
  /** Where the "+N további tétel" link points on the offer page. */
  detailsHref?: string;
}

/**
 * Every item of every package, split in two:
 * - differences: what is not in all three packages (Standard additions first, then Premium-only)
 * - common: what all three packages include
 * Rows keep the same order in every card, so the cards line up row by row.
 */
function comparisonRows(quote: Quote) {
  const { basic, standard, premium } = quote.packages;
  const ids = (pkg: typeof basic) => new Set(pkg.items.map((item) => item.id));
  const [inBasic, inStandard] = [ids(basic), ids(standard)];
  const all = new Map<string, { id: string; label: string }>();
  for (const pkg of [premium, standard, basic]) for (const item of pkg.items) if (!all.has(item.id)) all.set(item.id, { id: item.id, label: item.label });

  const rows = [...all.values()];
  const differences = rows.filter((row) => !inBasic.has(row.id)).sort((a, b) => Number(inStandard.has(b.id)) - Number(inStandard.has(a.id)));
  const common = rows.filter((row) => inBasic.has(row.id));
  return { differences, common };
}

/** One line under the tagline: why this package is (or is not) the one for the visitor. */
function coverageNote(quote: Quote, id: PackageId): { text: string; strong: boolean } {
  const missing = quote.requested.missing[id];
  if (missing.length > 0) {
    const names = missing.slice(0, 2).join(", ");
    const more = missing.length > 2 ? ` és még ${missing.length - 2}` : "";
    return { text: `A kéréseidből ${missing.length} nincs benne: ${names}${more}.`, strong: false };
  }
  if (id === quote.recommended) return { text: "Ebben minden benne van, amit kértél – ezért ezt ajánljuk.", strong: true };
  return { text: "Mindent tartalmaz, amit kértél, plusz extrákat.", strong: false };
}

/** Decorative wave + bubbles at the bottom of the gradient header. */
function HeaderDecor({ bubble }: { bubble: string }) {
  return (
    <Box aria-hidden>
      <Box component="svg" viewBox="0 0 400 70" preserveAspectRatio="none" sx={{ position: "absolute", left: 0, right: 0, bottom: -1, width: "100%", height: 54, display: "block" }}>
        <path d="M0,38 C70,74 140,6 220,30 C290,52 340,58 400,24 L400,70 L0,70 Z" fill={palette.inkSoft} />
      </Box>
      <Box sx={{ position: "absolute", width: 46, height: 46, borderRadius: "50%", left: 18, bottom: 6, background: bubble, opacity: 0.9 }} />
      <Box sx={{ position: "absolute", width: 16, height: 16, borderRadius: "50%", left: 72, bottom: 4, background: bubble, opacity: 0.75 }} />
      <Box sx={{ position: "absolute", width: 70, height: 70, borderRadius: "50%", right: -18, top: -22, background: "rgba(255,255,255,.22)" }} />
    </Box>
  );
}

export function PricingCards({ quote, mode, selected, onSelect, readOnly = false, detailsHref = "#reszletek" }: PricingCardsProps) {
  const { differences, common } = comparisonRows(quote);
  const requested = new Set(mode === "offer" ? quote.requested.ids : []);
  const selectable = mode === "offer" && Boolean(onSelect);
  // Mobile shows one card at a time; on the home page (and in a read-only snapshot) the visitor browses locally.
  const [browsing, setBrowsing] = useState<PackageId>(readOnly && selected ? selected : "standard");
  const mobileActive: PackageId = selectable && selected && !readOnly ? selected : browsing;

  const choose = (id: PackageId) => {
    if (selectable && !readOnly) onSelect?.(id);
    else setBrowsing(id);
  };

  return (
    <Box>
      {/* Mobile: segmented switch, then only the active card. */}
      <Box
        role={selectable ? "radiogroup" : "tablist"}
        aria-label="Csomagok"
        sx={{ display: { xs: "grid", md: "none" }, gridTemplateColumns: "repeat(3, 1fr)", gap: 0.5, p: 0.5, mb: 2.5, borderRadius: 3, background: mode === "home" ? palette.inkSoft : palette.ink }}
      >
        {PACKAGE_IDS.map((id) => {
          const active = id === mobileActive;
          return (
            <ButtonBase
              key={id}
              role={selectable ? "radio" : "tab"}
              aria-checked={selectable ? active : undefined}
              aria-selected={selectable ? undefined : active}
              onClick={() => choose(id)}
              sx={{
                minHeight: 56,
                borderRadius: 2.5,
                flexDirection: "column",
                background: active ? palette.lime : "transparent",
                color: active ? palette.ink : "#fff",
                transition: "background .2s ease",
                "&.Mui-focusVisible": { outline: `2px solid #fff`, outlineOffset: 2 },
              }}
            >
              <Typography component="span" sx={{ fontWeight: 700, fontSize: 14 }}>
                {quote.packages[id].name}
              </Typography>
              <Typography component="span" sx={{ fontSize: 12, opacity: active ? 0.8 : 0.7, fontVariantNumeric: "tabular-nums" }}>
                {formatRon(quote.packages[id].finalPrice)}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      <Box
        role={selectable ? "radiogroup" : undefined}
        aria-label={selectable ? "Csomag kiválasztása" : undefined}
        sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: { xs: 3, md: 2.5 }, alignItems: "stretch" }}
      >
        {PACKAGE_IDS.map((id, index) => {
          const pkg = quote.packages[id];
          const theme = packageThemes[id];
          const featured = mode === "home" && id === "standard";
          const recommended = mode === "offer" && quote.recommended === id;
          const isSelected = selectable && selected === id;
          const badge = featured ? "Legnépszerűbb" : recommended ? "Neked ajánlott" : null;
          // In the offer one card is "yours": it is lifted and outlined, the others step back.
          const dimmed = selectable && !isSelected;

          return (
            <Box key={id} sx={{ display: { xs: id === mobileActive ? "block" : "none", md: "block" } }}>
              <motion.div
                initial={{ y: 32 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: ease.out }}
                style={{ height: "100%" }}
              >
                <Box
                  role={selectable ? "radio" : undefined}
                  aria-checked={selectable ? isSelected : undefined}
                  aria-label={`${pkg.name} csomag, ${formatRon(pkg.finalPrice)}`}
                  sx={{
                    position: "relative",
                    height: "100%",
                    borderRadius: 4,
                    overflow: "hidden",
                    background: palette.inkSoft,
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: isSelected ? `0 0 0 4px ${palette.lime}, 0 0 48px -8px rgba(212,255,58,.55), ${shadow.raisedOnDark}` : shadow.raisedOnDark,
                    opacity: dimmed ? 0.72 : 1,
                    filter: dimmed ? "saturate(.75)" : "none",
                    transform: isSelected ? { md: "translateY(-8px)" } : "none",
                    transition: "box-shadow .25s ease, opacity .25s ease, filter .25s ease, transform .25s ease",
                    "&:hover": dimmed ? { opacity: 0.9, filter: "none" } : undefined,
                  }}
                >
                  {/* Gradient header – package identity, always ink text. */}
                  <Box sx={{ position: "relative", background: theme.gradient, color: theme.headerText, px: 3, pt: 3, pb: 7, textAlign: "center" }}>
                    <HeaderDecor bubble={theme.bubble} />
                    <Box sx={{ position: "relative" }}>
                      <Box sx={{ minHeight: 26, mb: 0.5 }}>
                        {selectable && isSelected ? (
                          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.25, borderRadius: 999, background: palette.lime, color: palette.ink, border: `1.5px solid ${palette.ink}`, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            <Check sx={{ fontSize: 14 }} /> {readOnly ? "Ezt választotta" : "A te választásod"}
                          </Box>
                        ) : badge && (
                          <Box component="span" sx={{ display: "inline-block", px: 1.25, py: 0.25, borderRadius: 999, background: palette.ink, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            {badge}
                          </Box>
                        )}
                      </Box>
                      <Typography component="h3" sx={{ fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 15 }}>
                        {pkg.name}
                      </Typography>
                      <Typography sx={{ mt: 1.25, fontSize: 14, fontWeight: 600, textDecoration: "line-through", visibility: pkg.savings > 0 ? "visible" : "hidden" }}>
                        {formatRon(pkg.listPrice)}
                      </Typography>
                      <Stack direction="row" sx={{ justifyContent: "center", alignItems: "flex-start", gap: 0.75 }}>
                        <Typography component="span" sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
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

                  {/* Body */}
                  <Box sx={{ px: 3, pt: 1, pb: 3, display: "flex", flexDirection: "column", flex: 1 }}>
                    <Typography sx={{ textAlign: "center", color: palette.inkMuted, fontSize: 14, mb: mode === "offer" ? 1.5 : 2 }}>{pkg.tagline}</Typography>
                    {mode === "offer" &&
                      (() => {
                        const note = coverageNote(quote, id);
                        return (
                          <Typography
                            sx={{
                              mb: 2,
                              px: 1.5,
                              py: 1,
                              borderRadius: 2,
                              fontSize: 13.5,
                              fontWeight: 600,
                              textAlign: "center",
                              border: `1px solid ${note.strong ? palette.lime : palette.inkLine}`,
                              color: note.strong ? palette.lime : palette.inkMuted,
                            }}
                          >
                            {note.text}
                          </Typography>
                        );
                      })()}
                    <Stack component="ul" sx={{ listStyle: "none", p: 0, m: 0, flex: 1 }}>
                      <GroupLabel>Ebben különböznek</GroupLabel>
                      <Row included label={pkg.design.label} />
                      {differences.map((row) => (
                        <Row
                          key={row.id}
                          included={pkg.items.some((item) => item.id === row.id)}
                          label={row.label}
                          requested={requested.has(row.id)}
                          availableIn={PACKAGE_IDS.map((pid) => quote.packages[pid]).find((other) => other.items.some((item) => item.id === row.id))?.name}
                        />
                      ))}
                      {common.length > 0 && <GroupLabel spaced>Mindhárom csomagban benne van</GroupLabel>}
                      {mode === "offer" ? (
                        common.map((row) => <Row key={row.id} included label={row.label} requested={requested.has(row.id)} />)
                      ) : (
                        // Home page sample: keep the cards short – the shared base is one line.
                        <Row included label={`${common.length} közös alaptétel: tervezés, fejlesztés, tesztelés, élesítés`} />
                      )}
                      {mode === "offer" && (
                        <Box component="li" sx={{ pt: 1 }}>
                          <Box component="a" href={detailsHref} sx={{ color: "#fff", fontSize: 14, textUnderlineOffset: 3, display: "inline-flex", minHeight: 44, alignItems: "center" }}>
                            Tételes árak: Részletek / Kalkuláció
                          </Box>
                        </Box>
                      )}
                    </Stack>

                    <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                      {readOnly ? (
                        isSelected && (
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, minHeight: 48, px: 3, borderRadius: 999, background: palette.lime, color: palette.ink, fontWeight: 700, fontSize: 15 }}>
                            Ezt választotta <Check sx={{ fontSize: 18 }} />
                          </Box>
                        )
                      ) : selectable ? (
                        <ButtonBase
                          onClick={() => onSelect?.(id)}
                          aria-pressed={isSelected}
                          sx={{
                            minHeight: 48,
                            px: 3.5,
                            borderRadius: 999,
                            fontWeight: 700,
                            fontSize: 15,
                            gap: 1,
                            color: isSelected ? palette.ink : "#fff",
                            background: isSelected ? palette.lime : "transparent",
                            border: isSelected ? `1.5px solid ${palette.lime}` : "1.5px solid rgba(255,255,255,.45)",
                            transition: "transform .2s ease, background .2s ease",
                            "&:hover": { transform: "translateY(-2px)" },
                            "&.Mui-focusVisible": { outline: "2px solid #fff", outlineOffset: 3 },
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
                          sx={{
                            minHeight: 48,
                            px: 3.5,
                            borderRadius: 999,
                            fontWeight: 700,
                            fontSize: 15,
                            gap: 1,
                            color: palette.ink,
                            background: theme.gradient,
                            transition: "transform .2s ease",
                            "&:hover": { transform: "translateY(-2px)" },
                            "&.Mui-focusVisible": { outline: "2px solid #fff", outlineOffset: 3 },
                          }}
                        >
                          Kiszámolom az enyémet <ArrowForward sx={{ fontSize: 18 }} />
                        </ButtonBase>
                      )}
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function GroupLabel({ children, spaced = false }: { children: React.ReactNode; spaced?: boolean }) {
  return (
    <Box component="li" aria-hidden={false} sx={{ pt: spaced ? 3.5 : 2, pb: 0.5, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: palette.inkMuted, listStyle: "none" }}>
      {children}
    </Box>
  );
}

/** Included = green tick. Not included = quiet dash plus where it is available – no red crosses. */
function Row({ included, label, availableIn, requested = false }: { included: boolean; label: string; availableIn?: string; requested?: boolean }) {
  const Icon = included ? Check : Remove;
  return (
    <Stack component="li" direction="row" spacing={1.5} sx={{ alignItems: "center", py: 1.1, borderBottom: `1px solid ${palette.inkLine}` }}>
      <Box
        aria-hidden
        sx={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: `1.5px solid ${included ? palette.check : palette.inkLine}`,
          color: included ? palette.check : palette.inkMuted,
        }}
      >
        <Icon sx={{ fontSize: 15 }} />
      </Box>
      <Typography sx={{ fontSize: 14, color: included ? "#fff" : palette.inkMuted }}>
        <Box component="span" sx={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          {included ? "Tartalmazza: " : "Nem tartalmazza: "}
        </Box>
        {label}
        {requested && (
          <Box
            component="span"
            sx={{
              ml: 0.75,
              px: 0.75,
              py: 0.1,
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: "nowrap",
              border: `1px solid ${palette.lime}`,
              color: included ? palette.ink : palette.lime,
              background: included ? palette.lime : "transparent",
            }}
          >
            {included || !availableIn ? "Kérted" : `Kérted · ${availableIn}tól`}
          </Box>
        )}
        {!requested && !included && availableIn && (
          <Box component="span" sx={{ ml: 0.75, px: 0.75, py: 0.1, borderRadius: 1, border: `1px solid ${palette.inkLine}`, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
            {availableIn}ban
          </Box>
        )}
      </Typography>
    </Stack>
  );
}
