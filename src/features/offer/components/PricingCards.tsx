"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Check from "@mui/icons-material/Check";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import {
  PACKAGE_IDS,
  type PackageId,
  type Quote,
} from "@/features/pricing/types";
import { formatRon, formatWeeks } from "@/lib/format";
import {
  gradients,
  ease,
  packageThemes,
  palette,
  shadow,
} from "@/theme/tokens";

const priceFormatter = new Intl.NumberFormat("hu-HU", {
  maximumFractionDigits: 0,
  useGrouping: "always",
});

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

type ContentRow = { id: string; label: string };

/**
 * "Everything in the previous package, plus …": each card lists only what it adds.
 * - base: what the card inherits (Basic: the shared base; Standard: all of Basic; Premium: all of Standard)
 * - additions: what is new in this package (a better design level comes first)
 */
function tierContents(quote: Quote) {
  const contents = {} as Record<
    PackageId,
    { base: ContentRow[]; additions: ContentRow[] }
  >;
  let previous: Quote["packages"][PackageId] | null = null;
  for (const id of PACKAGE_IDS) {
    const pkg = quote.packages[id];
    const designRow = {
      id: `design.${pkg.design.level}`,
      label: pkg.design.label,
    };
    if (!previous) {
      contents[id] = {
        base: pkg.items.map(({ id: rowId, label }) => ({ id: rowId, label })),
        additions: [designRow],
      };
    } else {
      const had = new Set(previous.items.map((item) => item.id));
      const added = pkg.items
        .filter((item) => !had.has(item.id))
        .map(({ id: rowId, label }) => ({ id: rowId, label }));
      const designChanged = pkg.design.label !== previous.design.label;
      contents[id] = {
        base: [
          ...previous.items.map(({ id: rowId, label }) => ({
            id: rowId,
            label,
          })),
          {
            id: `design.${previous.design.level}`,
            label: previous.design.label,
          },
        ],
        additions: designChanged ? [designRow, ...added] : added,
      };
    }
    previous = pkg;
  }
  return contents;
}

/** One line under the tagline: why this package is (or is not) the one for the visitor. */
function coverageNote(
  quote: Quote,
  id: PackageId,
): { text: string; strong: boolean } {
  const missing = quote.requested.missing[id];
  if (missing.length > 0) {
    const names = missing.slice(0, 2).join(", ");
    const more = missing.length > 2 ? ` és még ${missing.length - 2}` : "";
    const covering = PACKAGE_IDS.find(
      (other) => quote.requested.missing[other].length === 0,
    );
    const where = covering
      ? ` – ${missing.length > 1 ? "ezek" : "ez"} a ${quote.packages[covering].name} csomagban benne ${missing.length > 1 ? "vannak" : "van"}`
      : "";
    return {
      text: `Nincs benne, amit kértél: ${names}${more}${where}.`,
      strong: false,
    };
  }
  if (id === quote.recommended)
    return {
      text: "Ebben minden benne van, amit kértél – ezért ezt ajánljuk.",
      strong: true,
    };
  return {
    text: "Mindent tartalmaz, amit kértél, plusz extrákat.",
    strong: false,
  };
}

/** Decorative wave + bubbles at the bottom of the gradient header. */
function HeaderDecor({ bubble }: { bubble: string }) {
  return (
    <Box aria-hidden>
      <Box
        component="svg"
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -1,
          width: "100%",
          height: 54,
          display: "block",
        }}
      >
        <path
          d="M0,38 C70,74 140,6 220,30 C290,52 340,58 400,24 L400,70 L0,70 Z"
          fill={palette.inkSoft}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          width: 46,
          height: 46,
          borderRadius: "50%",
          left: 18,
          bottom: 6,
          background: bubble,
          opacity: 0.9,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 16,
          height: 16,
          borderRadius: "50%",
          left: 72,
          bottom: 4,
          background: bubble,
          opacity: 0.75,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 70,
          height: 70,
          borderRadius: "50%",
          right: -18,
          top: -22,
          background: "rgba(255,255,255,.22)",
        }}
      />
    </Box>
  );
}

export function PricingCards({
  quote,
  mode,
  selected,
  onSelect,
  readOnly = false,
  detailsHref = "#reszletek",
}: PricingCardsProps) {
  const contents = tierContents(quote);
  const requested = new Set(mode === "offer" ? quote.requested.ids : []);
  const selectable = mode === "offer" && Boolean(onSelect);
  // Mobile shows one card at a time; on the home page (and in a read-only snapshot) the visitor browses locally.
  const [browsing, setBrowsing] = useState<PackageId>(
    readOnly && selected ? selected : "standard",
  );
  const mobileActive: PackageId =
    selectable && selected && !readOnly ? selected : browsing;

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
        sx={{
          display: { xs: "grid", md: "none" },
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0.5,
          p: 0.5,
          mb: 2.5,
          borderRadius: 3,
          background: mode === "home" ? palette.inkSoft : palette.ink,
        }}
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
                background: active ? packageThemes[id].gradient : "transparent",
                color: active ? palette.ink : "#fff",
                transition: "background .2s ease",
                "&.Mui-focusVisible": {
                  outline: `2px solid #fff`,
                  outlineOffset: 2,
                },
              }}
            >
              <Typography
                component="span"
                sx={{ fontWeight: 700, fontSize: 14 }}
              >
                {quote.packages[id].name}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: 12,
                  opacity: active ? 0.8 : 0.7,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatRon(quote.packages[id].finalPrice)}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      <Box
        role={selectable ? "radiogroup" : undefined}
        aria-label={selectable ? "Csomag kiválasztása" : undefined}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: { xs: 3, md: 2.5 },
          alignItems: "stretch",
        }}
      >
        {PACKAGE_IDS.map((id, index) => {
          const pkg = quote.packages[id];
          const theme = packageThemes[id];
          const featured = mode === "home" && id === "standard";
          const recommended = mode === "offer" && quote.recommended === id;
          const isSelected = selectable && selected === id;
          const badge = featured
            ? "Legnépszerűbb"
            : recommended
              ? "Neked ajánlott"
              : null;
          // In the offer one card is "yours": it is lifted and outlined, the others step back.
          const dimmed = selectable && !isSelected;

          return (
            <Box
              key={id}
              sx={{
                display: {
                  xs: id === mobileActive ? "block" : "none",
                  md: "block",
                },
              }}
            >
              <motion.div
                initial={{ y: 32 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: ease.out,
                }}
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
                    boxShadow: shadow.raisedOnDark,
                    opacity: dimmed ? 0.72 : 1,
                    filter: dimmed ? "saturate(.75)" : "none",
                    transform: isSelected ? { md: "translateY(-8px)" } : "none",
                    transition:
                      "box-shadow .25s ease, opacity .25s ease, filter .25s ease, transform .25s ease",
                    "&:hover": dimmed
                      ? { opacity: 0.9, filter: "none" }
                      : undefined,
                  }}
                >
                  {/* Gradient header – package identity, always ink text. */}
                  <Box
                    sx={{
                      position: "relative",
                      background: theme.gradient,
                      color: theme.headerText,
                      px: 3,
                      pt: 3,
                      pb: 7,
                      textAlign: "center",
                    }}
                  >
                    <HeaderDecor bubble={theme.bubble} />
                    <Box sx={{ position: "relative" }}>
                      <Box sx={{ minHeight: 26, mb: 0.5 }}>
                        {selectable && isSelected ? (
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              px: 1.25,
                              py: 0.25,
                              borderRadius: 999,
                              background: palette.ink,
                              color: "#fff",
                              border: `1.5px solid ${palette.ink}`,
                              fontSize: 11,
                              fontWeight: 800,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                            }}
                          >
                            <Check sx={{ fontSize: 14 }} />{" "}
                            {readOnly ? "Ezt választotta" : "A te választásod"}
                          </Box>
                        ) : (
                          badge && (
                            <Box
                              component="span"
                              sx={{
                                display: "inline-block",
                                px: 1.25,
                                py: 0.25,
                                borderRadius: 999,
                                background: palette.ink,
                                color: "#fff",
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                              }}
                            >
                              {badge}
                            </Box>
                          )
                        )}
                      </Box>
                      <Typography
                        component="h3"
                        sx={{
                          fontWeight: 800,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          fontSize: 15,
                        }}
                      >
                        {pkg.name}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 1.25,
                          fontSize: 14,
                          fontWeight: 600,
                          textDecoration: "line-through",
                          visibility: pkg.savings > 0 ? "visible" : "hidden",
                        }}
                      >
                        {formatRon(pkg.listPrice)}
                      </Typography>
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: "center",
                          alignItems: "flex-start",
                          gap: 0.75,
                        }}
                      >
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
                        <Typography
                          component="span"
                          sx={{ fontWeight: 700, fontSize: 16, mt: 0.75 }}
                        >
                          {quote.review.required ? "RON-tól" : "RON"}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{ fontSize: 14, fontWeight: 600, mt: 0.5 }}
                      >
                        egyszeri díj ·{" "}
                        {formatWeeks(
                          pkg.timeline.minWeeks,
                          pkg.timeline.maxWeeks,
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Body */}
                  <Box
                    sx={{
                      px: 3,
                      pt: 1,
                      pb: 3,
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: palette.inkMuted,
                        fontSize: 14,
                        mb: mode === "offer" ? 1.5 : 2,
                      }}
                    >
                      {pkg.tagline}
                    </Typography>
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
                              border: note.strong
                                ? "1px solid transparent"
                                : `1px solid ${palette.inkLine}`,
                              background: note.strong
                                ? `linear-gradient(${palette.inkSoft}, ${palette.inkSoft}) padding-box, ${theme.gradient} border-box`
                                : "transparent",
                              color: note.strong ? "#fff" : palette.inkMuted,
                            }}
                          >
                            {note.text}
                          </Typography>
                        );
                      })()}
                    <Stack
                      component="ul"
                      sx={{ listStyle: "none", p: 0, m: 0, flex: 1 }}
                    >
                      <BaseRow
                        theme={theme}
                        label={
                          index === 0
                            ? `Az alap: ${contents[id].base.length} tétel`
                            : `Minden, ami a ${quote.packages[PACKAGE_IDS[index - 1]].name} csomagban`
                        }
                        rows={contents[id].base}
                        requested={requested}
                        defaultOpen={index === 0}
                      />
                      {contents[id].additions.length > 0 && index > 0 && (
                        <GroupLabel>Plusz:</GroupLabel>
                      )}
                      {contents[id].additions.map((row) => (
                        <Row
                          key={row.id}
                          theme={theme}
                          included
                          label={row.label}
                          requested={requested.has(row.id)}
                        />
                      ))}
                      {mode === "offer" && (
                        <Box component="li" sx={{ pt: 1 }}>
                          <Box
                            component="a"
                            href={detailsHref}
                            sx={{
                              color: "#fff",
                              fontSize: 14,
                              textUnderlineOffset: 3,
                              display: "inline-flex",
                              minHeight: 44,
                              alignItems: "center",
                            }}
                          >
                            Tételes árak: Részletek / Kalkuláció
                          </Box>
                        </Box>
                      )}
                    </Stack>

                    <Box
                      sx={{ mt: 3, display: "flex", justifyContent: "center" }}
                    >
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
                            background: isSelected
                              ? theme.gradient
                              : "transparent",
                            border: isSelected
                              ? "1.5px solid transparent"
                              : "1.5px solid rgba(255,255,255,.45)",
                            transition:
                              "transform .2s ease, background .2s ease",
                            "&:hover": { transform: "translateY(-2px)" },
                            "&.Mui-focusVisible": {
                              outline: "2px solid #fff",
                              outlineOffset: 3,
                            },
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
                            "&.Mui-focusVisible": {
                              outline: "2px solid #fff",
                              outlineOffset: 3,
                            },
                          }}
                        >
                          Kiszámolom az enyémet{" "}
                          <ArrowForward sx={{ fontSize: 18 }} />
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

function GroupLabel({
  children,
  fullRow = false,
}: {
  children: React.ReactNode;
  fullRow?: boolean;
}) {
  return (
    <Box
      component="li"
      aria-hidden={false}
      sx={{
        gridColumn: fullRow ? "1 / -1" : undefined,
        pt: 2,
        pb: 0.5,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: palette.inkMuted,
        listStyle: "none",
      }}
    >
      {children}
    </Box>
  );
}

/** Included = green tick. Not included = quiet dash plus where it is available – no red crosses. */
type PackageTheme = (typeof packageThemes)[PackageId];

function Row({
  theme,
  label,
  requested = false,
}: {
  theme?: PackageTheme;
  included?: true;
  label: string;
  requested?: boolean;
}) {
  return (
    <Stack
      component="li"
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        py: 1.1,
        borderBottom: `1px solid ${palette.inkLine}`,
      }}
    >
      <Tick theme={theme} />
      <Typography sx={{ fontSize: 14, color: "#fff" }}>
        {label}
        {requested && <RequestedTag theme={theme} />}
      </Typography>
    </Stack>
  );
}

/** Quiet white ring, the tick in the card's own package colour. */
function Tick({ theme }: { theme?: PackageTheme }) {
  return (
    <Box
      aria-hidden
      sx={{
        flexShrink: 0,
        width: 24,
        height: 24,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        border: "1.5px solid rgba(255,255,255,.35)",
        color: theme?.solid ?? "#fff",
      }}
    >
      <Check sx={{ fontSize: 15 }} />
    </Box>
  );
}

function RequestedTag({ theme }: { theme?: PackageTheme }) {
  return (
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
        color: palette.ink,
        background: theme?.gradient ?? gradients.brand,
      }}
    >
      Kérted
    </Box>
  );
}

/** "Az alap: 8 tétel" / "Minden, ami a Basic csomagban" – opens to the full list it stands for. */
function BaseRow({
  theme,
  label,
  rows,
  requested,
  defaultOpen,
}: {
  theme: PackageTheme;
  label: string;
  rows: ContentRow[];
  requested: Set<string>;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Box
      component="li"
      sx={{ borderBottom: `1px solid ${palette.inkLine}`, listStyle: "none" }}
    >
      <ButtonBase
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        sx={{
          width: "100%",
          justifyContent: "flex-start",
          gap: 1.5,
          py: 1.1,
          minHeight: 44,
          textAlign: "left",
          "&.Mui-focusVisible": { outline: "2px solid #fff", outlineOffset: 2 },
        }}
      >
        <Tick theme={theme} />
        <Typography
          component="span"
          sx={{ fontSize: 14, fontWeight: 650, color: "#fff", flex: 1 }}
        >
          {label}
        </Typography>
        <ExpandMore
          sx={{
            fontSize: 20,
            color: palette.inkMuted,
            transition: "transform .2s ease",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </ButtonBase>
      {open && (
        <Box
          component="ul"
          sx={{ listStyle: "none", p: 0, m: 0, pl: 4.5, pb: 1 }}
        >
          {rows.map((row) => (
            <Typography
              key={row.id}
              component="li"
              sx={{ fontSize: 13.5, color: palette.inkMuted, py: 0.4 }}
            >
              • {row.label}
              {requested.has(row.id) && <RequestedTag theme={theme} />}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
