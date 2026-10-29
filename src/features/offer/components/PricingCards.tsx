"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Check from "@mui/icons-material/Check";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
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

const MAX_HIGHLIGHTS = 4;
const COMPARISON_ID = "osszehasonlitas";

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
  type Pkg = Quote["packages"][PackageId];
  const toRows = (pkg: Pkg) =>
    pkg.items.map(({ id: rowId, label }) => ({ id: rowId, label }));
  // The design level as its own row – unless a design surcharge item already says it (webshop).
  const designRow = (pkg: Pkg): ContentRow[] =>
    pkg.items.some((item) => item.id === `design.${pkg.design.level}`)
      ? []
      : [{ id: `package-design.${pkg.design.level}`, label: pkg.design.label }];

  let previous: Pkg | null = null;
  for (const id of PACKAGE_IDS) {
    const pkg = quote.packages[id];
    if (!previous) {
      contents[id] = { base: toRows(pkg), additions: designRow(pkg) };
    } else {
      const had = new Set(previous.items.map((item) => item.id));
      const added = toRows(pkg).filter((row) => !had.has(row.id));
      const designChanged = pkg.design.label !== previous.design.label;
      contents[id] = {
        base: [...toRows(previous), ...designRow(previous)],
        additions: designChanged ? [...designRow(pkg), ...added] : added,
      };
    }
    previous = pkg;
  }
  return contents;
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
  // The visitor's own requests, shown first in every card (ticked, or "nincs benne").
  const labelOf = new Map(
    PACKAGE_IDS.flatMap((pid) =>
      quote.packages[pid].items.map((item) => [item.id, item.label] as const),
    ),
  );
  const requestedRows: ContentRow[] = [...requested].map((rid) => ({
    id: rid,
    label: labelOf.get(rid) ?? rid,
  }));
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
                    {/* One status line about the visitor's own requests. */}
                    {requestedRows.length > 0 && (
                      <RequestStatus
                        theme={theme}
                        missing={quote.requested.missing[id]}
                        recommended={quote.recommended === id}
                      />
                    )}
                    {/* What this package gives – short, the full list is in the comparison table below. */}
                    {(() => {
                      const highlights = [...contents[id].additions];
                      const lead =
                        index === 0
                          ? `Minden alapfunkció (${contents[id].base.length} tétel)`
                          : `Minden, ami a ${quote.packages[PACKAGE_IDS[index - 1]].name} csomagban`;
                      const shown = highlights.slice(0, MAX_HIGHLIGHTS);
                      const rest = highlights.length - shown.length;
                      return (
                        <Stack
                          component="ul"
                          sx={{ listStyle: "none", p: 0, m: 0, flex: 1 }}
                        >
                          <Row theme={theme} included label={lead} strong />
                          {shown.map((row) => (
                            <Row
                              key={row.id}
                              theme={theme}
                              included
                              label={index === 0 ? row.label : `+ ${row.label}`}
                              requested={requested.has(row.id)}
                            />
                          ))}
                          {rest > 0 && (
                            <Box
                              component="li"
                              sx={{
                                py: 1,
                                fontSize: 13.5,
                                color: palette.inkMuted,
                                listStyle: "none",
                              }}
                            >
                              és még {rest} tétel
                            </Box>
                          )}
                          <Box component="li" sx={{ pt: 1, listStyle: "none" }}>
                            <Box
                              component="a"
                              href={`#${COMPARISON_ID}`}
                              sx={{
                                color: "#fff",
                                fontSize: 14,
                                textUnderlineOffset: 3,
                                display: "inline-flex",
                                minHeight: 44,
                                alignItems: "center",
                              }}
                            >
                              Részletes összehasonlítás ↓
                            </Box>
                          </Box>
                        </Stack>
                      );
                    })()}

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
      <Comparison
        quote={quote}
        contents={contents}
        requestedRows={requestedRows}
        requested={requested}
        mode={mode}
        detailsHref={detailsHref}
      />
    </Box>
  );
}

/** Included = green tick. Not included = quiet dash plus where it is available – no red crosses. */
type PackageTheme = (typeof packageThemes)[PackageId];

function Row({
  theme,
  label,
  requested = false,
  strong = false,
}: {
  theme?: PackageTheme;
  included?: true;
  label: string;
  requested?: boolean;
  strong?: boolean;
}) {
  return (
    <Stack
      component="li"
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        py: 1,
        borderBottom: `1px solid ${palette.inkLine}`,
      }}
    >
      <Tick theme={theme} />
      <Typography
        sx={{ fontSize: 14, fontWeight: strong ? 650 : 400, color: "#fff" }}
      >
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

/** One line per card: does this package cover what the visitor asked for? */
function RequestStatus({
  theme,
  missing,
  recommended,
}: {
  theme: PackageTheme;
  missing: string[];
  recommended: boolean;
}) {
  const ok = missing.length === 0;
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "flex-start",
        mb: 2,
        px: 1.5,
        py: 1.1,
        borderRadius: 2,
        background: "rgba(255,255,255,.06)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          mt: "1px",
          color: ok ? theme.solid : palette.inkMuted,
          display: "grid",
        }}
      >
        {ok ? (
          <Check sx={{ fontSize: 18 }} />
        ) : (
          <InfoOutlined sx={{ fontSize: 18 }} />
        )}
      </Box>
      <Typography
        sx={{
          fontSize: 13.5,
          fontWeight: 600,
          color: ok ? "#fff" : palette.inkMuted,
          lineHeight: 1.45,
        }}
      >
        {ok
          ? recommended
            ? "Minden kérésed benne van – ezt ajánljuk."
            : "Minden kérésed benne van."
          : `Hiányzik ${missing.length} kérésed: ${missing.join(", ")}.`}
      </Typography>
    </Stack>
  );
}

/** Every item of every package in one table: the visitor's requests first, then the differences, then the shared base. */
function Comparison({
  quote,
  contents,
  requestedRows,
  requested,
  mode,
  detailsHref,
}: {
  quote: Quote;
  contents: ReturnType<typeof tierContents>;
  requestedRows: ContentRow[];
  requested: Set<string>;
  mode: "home" | "offer";
  detailsHref: string;
}) {
  const [baseOpen, setBaseOpen] = useState(false);
  const has = (pid: PackageId, rowId: string) =>
    quote.packages[pid].items.some((item) => item.id === rowId);
  const base = contents.basic.base.filter((row) => !requested.has(row.id));
  const seen = new Set([...base.map((row) => row.id), ...requested]);
  const differences: ContentRow[] = [];
  for (const pid of PACKAGE_IDS)
    for (const row of contents[pid].additions)
      if (!seen.has(row.id) && !row.id.startsWith("package-design.")) {
        seen.add(row.id);
        differences.push(row);
      }

  const cols = {
    xs: "minmax(0,1fr) 62px 62px 62px",
    md: "minmax(0,1fr) 140px 140px 140px",
  };
  const cell = (pid: PackageId, rowId: string) => (
    <Box key={pid} sx={{ display: "grid", placeItems: "center" }}>
      {has(pid, rowId) ? (
        <Box
          component="span"
          sx={{ display: "grid", color: packageThemes[pid].solid }}
        >
          <Check sx={{ fontSize: 20 }} />
          <Box component="span" sx={visuallyHidden}>
            {quote.packages[pid].name}: benne van
          </Box>
        </Box>
      ) : (
        <Box component="span" sx={{ color: palette.inkLine, fontSize: 18 }}>
          –
          <Box component="span" sx={visuallyHidden}>
            {quote.packages[pid].name}: nincs benne
          </Box>
        </Box>
      )}
    </Box>
  );
  const line = (row: ContentRow, tag = false) => (
    <Box
      key={row.id}
      role="row"
      sx={{
        display: "grid",
        gridTemplateColumns: cols,
        alignItems: "center",
        py: 1.1,
        borderBottom: `1px solid ${palette.inkLine}`,
      }}
    >
      <Typography role="rowheader" sx={{ fontSize: 14, color: "#fff", pr: 1 }}>
        {row.label}
        {tag && requested.has(row.id) && <RequestedTag />}
      </Typography>
      {PACKAGE_IDS.map((pid) => cell(pid, row.id))}
    </Box>
  );
  const heading = (text: string) => (
    <Box
      role="row"
      sx={{
        pt: 2.5,
        pb: 0.75,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: palette.inkMuted,
      }}
    >
      {text}
    </Box>
  );

  return (
    <Box
      id={COMPARISON_ID}
      sx={{
        mt: { xs: 3, md: 4 },
        scrollMarginTop: 24,
        borderRadius: 4,
        background: palette.inkSoft,
        color: "#fff",
        px: { xs: 2, md: 4 },
        py: { xs: 2.5, md: 3 },
        boxShadow: shadow.raisedOnDark,
      }}
    >
      <Typography
        component="h3"
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: { xs: 20, md: 24 },
          mb: 1,
        }}
      >
        Részletes összehasonlítás
      </Typography>
      <Box role="table" aria-label="A három csomag összehasonlítása">
        {/* Sticky header with the package names in their colours. */}
        <Box
          role="row"
          sx={{
            display: "grid",
            gridTemplateColumns: cols,
            alignItems: "end",
            pb: 1,
            borderBottom: `1px solid ${palette.inkLine}`,
            position: "sticky",
            top: 0,
            background: palette.inkSoft,
            zIndex: 1,
          }}
        >
          <Box role="columnheader" />
          {PACKAGE_IDS.map((pid) => (
            <Box key={pid} role="columnheader" sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  mx: "auto",
                  mb: 0.75,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: packageThemes[pid].gradient,
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: 11, md: 13 },
                  fontWeight: 700,
                  letterSpacing: { xs: 0, md: "0.04em" },
                  textTransform: { xs: "none", md: "uppercase" },
                }}
              >
                {quote.packages[pid].name}
              </Typography>
            </Box>
          ))}
        </Box>

        {heading("Design")}
        <Box
          role="row"
          sx={{
            display: "grid",
            gridTemplateColumns: cols,
            alignItems: "start",
            py: 1.1,
            borderBottom: `1px solid ${palette.inkLine}`,
          }}
        >
          <Typography role="rowheader" sx={{ fontSize: 14, color: "#fff" }}>
            Kinézet
          </Typography>
          {PACKAGE_IDS.map((pid) => (
            <Typography
              key={pid}
              sx={{
                fontSize: { xs: 10.5, md: 13 },
                lineHeight: 1.35,
                color: palette.inkMuted,
                textAlign: "center",
                px: 0.5,
                overflowWrap: "anywhere",
                hyphens: "auto",
              }}
            >
              {quote.packages[pid].design.label}
            </Typography>
          ))}
        </Box>

        {mode === "offer" && requestedRows.length > 0 && (
          <>
            {heading("Amit kértél")}
            {requestedRows.map((row) => line(row))}
          </>
        )}

        {differences.length > 0 && (
          <>
            {heading("Csomagonként eltér")}
            {differences.map((row) => line(row, true))}
          </>
        )}

        {heading("Mindháromban benne van")}
        <ButtonBase
          onClick={() => setBaseOpen((open) => !open)}
          aria-expanded={baseOpen}
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: cols,
            alignItems: "center",
            py: 1.1,
            minHeight: 44,
            textAlign: "left",
            borderBottom: `1px solid ${palette.inkLine}`,
            "&.Mui-focusVisible": {
              outline: "2px solid #fff",
              outlineOffset: 2,
            },
          }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Typography sx={{ fontSize: 14, fontWeight: 650 }}>
              Az alap: {base.length} tétel
            </Typography>
            <ExpandMore
              sx={{
                fontSize: 20,
                color: palette.inkMuted,
                transition: "transform .2s ease",
                transform: baseOpen ? "rotate(180deg)" : "none",
              }}
            />
          </Stack>
          {PACKAGE_IDS.map((pid) => (
            <Box
              key={pid}
              sx={{
                display: "grid",
                placeItems: "center",
                color: packageThemes[pid].solid,
              }}
            >
              <Check sx={{ fontSize: 20 }} />
            </Box>
          ))}
        </ButtonBase>
        {baseOpen && base.map((row) => line(row))}
      </Box>
      {mode === "offer" && (
        <Box
          component="a"
          href={detailsHref}
          sx={{
            mt: 1.5,
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
      )}
    </Box>
  );
}

const visuallyHidden = {
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
} as const;
