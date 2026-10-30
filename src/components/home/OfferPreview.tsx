"use client";

import Box from "@mui/material/Box";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Check from "@mui/icons-material/Check";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  PACKAGE_IDS,
  type PackageId,
  type Quote,
} from "@/features/pricing/types";
import { formatWeeks } from "@/lib/format";
import { FluidBlobs } from "./FluidBlobs";
import {
  gradients,
  packageThemes,
  palette,
  shadow,
} from "@/theme/tokens";

const TOUR: PackageId[] = ["premium", "basic", "standard"];
const CYCLE_MS = 3200;
const groupFormatter = new Intl.NumberFormat("hu-HU", {
  maximumFractionDigits: 0,
  useGrouping: "always",
});

/** Live sample offer: real numbers from the pricing engine, cycling through the three packages. */
/** The sample quote is computed on the server and passed in as data. */
export function OfferPreview({ quote }: { quote: Quote }) {
  const [active, setActive] = useState<PackageId>("standard");
  const [paused, setPaused] = useState(false);
  const pkg = quote.packages[active];

  const shown = useCountUp(pkg.finalPrice);
  const priceText = `${groupFormatter.format(Math.round(shown / 50) * 50)} RON`;

  // One tour (Premium → Basic → back to Standard), then it rests. Any interaction stops it for good.
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (paused || reduceMotion) return;
    let step = 0;
    const timer = window.setInterval(() => {
      const next = TOUR[step];
      step += 1;
      if (next) setActive(next);
      if (step >= TOUR.length) window.clearInterval(timer);
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  // Same rows for every package – only the ticks change, so switching shows what differs.
  const basicIds = new Set(quote.packages.basic.items.map((item) => item.id));
  const differences = PACKAGE_IDS.flatMap((pid) =>
    quote.packages[pid].items
      .filter((item) => !basicIds.has(item.id))
      .map((item) => ({ ...item, from: pid })),
  ).filter(
    (item, index, all) =>
      all.findIndex((other) => other.id === item.id) === index,
  );
  const has = (id: string) => pkg.items.some((item) => item.id === id);

  return (
    <>
      <FluidBlobs active={active} />
      {/* CSS entrance: visible from the server HTML on, not hidden until JavaScript runs. */}
      <Box
        className="enter-fade"
        sx={{ position: "relative", zIndex: 1 }}
        onPointerDown={() => setPaused(true)}
        onFocusCapture={() => setPaused(true)}
      >
        <Box
          role="region"
          aria-label="Példa ajánlat egy céges weboldalra"
          sx={{
            background: palette.surface,
            color: palette.ink,
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: shadow.raisedOnDark,
          }}
        >
          {/* Make it obvious this is a sample, not the visitor's own offer. */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: { xs: 2.5, sm: 3.5 },
              py: 1.25,
              background: palette.paper,
              borderBottom: `1.5px dashed ${palette.line}`,
            }}
          >
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                background: palette.ink,
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
              }}
            >
              MINTA
            </Box>
            <Typography
              variant="body2"
              sx={{ fontSize: 13, color: "text.secondary" }}
            >
              Ez egy példa. A saját árad a kérdőív után látod.
            </Typography>
          </Box>
          <Box sx={{ p: { xs: 2.5, sm: 3.5 }, pb: { xs: 2, sm: 2.5 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                mb: 2.5,
                gap: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
              >
                Céges weboldal, 6–10 oldal
              </Typography>
              <Box
                role="tablist"
                aria-label="Csomagok"
                sx={{
                  display: "flex",
                  p: 0.5,
                  borderRadius: 2,
                  background: palette.paper,
                }}
              >
                {PACKAGE_IDS.map((id) => (
                  <ButtonBase
                    key={id}
                    role="tab"
                    id={`preview-tab-${id}`}
                    aria-controls="preview-panel"
                    aria-selected={id === active}
                    onClick={() => {
                      setActive(id);
                      setPaused(true);
                    }}
                    sx={{
                      position: "relative",
                      minHeight: 44,
                      px: 1.5,
                      borderRadius: 1.5,
                      fontSize: 13,
                      fontWeight: 600,
                      color: id === active ? palette.ink : palette.muted,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 6,
                        background: gradients.brand,
                        opacity: id === active ? 1 : 0,
                        transform: id === active ? "none" : "scale(.85)",
                        transition: "opacity .25s, transform .25s",
                      }}
                    />
                    <span style={{ position: "relative" }}>
                      {quote.packages[id].name}
                    </span>
                  </ButtonBase>
                ))}
              </Box>
            </Stack>

            <Box
              id="preview-panel"
              role="tabpanel"
              aria-labelledby={`preview-tab-${active}`}
            >
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <PreviewRow
                  included
                  color={packageThemes[active].solid}
                  label={`Alapfunkciók (${quote.packages.basic.items.length} tétel)`}
                  strong
                />
                <PreviewRow
                  included
                  color={packageThemes[active].solid}
                  label={pkg.design.label}
                />
                {differences.map((item) => (
                  <PreviewRow
                    key={item.id}
                    included={has(item.id)}
                    color={packageThemes[active].solid}
                    label={item.label}
                    tag={
                      has(item.id) ? undefined : quote.packages[item.from].name
                    }
                  />
                ))}
              </Box>
            </Box>

            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "flex-end",
                mt: 2.5,
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Átfutás
                </Typography>
                <Typography sx={{ fontWeight: 650 }}>
                  {formatWeeks(pkg.timeline.minWeeks, pkg.timeline.maxWeeks)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ color: palette.muted }}>
                  Példaár
                </Typography>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-display)",
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {priceText}
                </span>
              </Box>
            </Stack>
          </Box>
          <ButtonBase
            component={Link}
            href="/tervezo"
            sx={{
              width: "100%",
              minHeight: 56,
              px: { xs: 2.5, sm: 3.5 },
              justifyContent: "space-between",
              gap: 1,
              background: palette.ink,
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              textAlign: "left",
              transition: "background .15s ease",
              "&:hover": { background: palette.inkSoft },
              "&.Mui-focusVisible": {
                outline: "2px solid #fff",
                outlineOffset: -4,
              },
            }}
          >
            <span>
              Kérem a{" "}
              <Box
                component="span"
                sx={{
                  backgroundImage: gradients.brand,
                  backgroundSize: "100% 3px",
                  backgroundPosition: "0 100%",
                  backgroundRepeat: "no-repeat",
                  pb: "2px",
                }}
              >
                saját
              </Box>{" "}
              ajánlatom – kérdőív, kb. 3 perc
            </span>
            <ArrowForward sx={{ fontSize: 20, color: "#fff" }} />
          </ButtonBase>
        </Box>
      </Box>
    </>
  );
}

/** One line of the sample: tick in the package colour, or a quiet dash with where it is included. */
function PreviewRow({
  included,
  color,
  label,
  tag,
  strong = false,
}: {
  included: boolean;
  color: string;
  label: string;
  tag?: string;
  strong?: boolean;
}) {
  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        py: "7px",
        borderBottom: `1px solid ${palette.line}`,
        fontSize: 14,
      }}
    >
      <Box
        aria-hidden
        sx={{
          flexShrink: 0,
          width: 20,
          display: "grid",
          placeItems: "center",
          color: included ? color : palette.line,
          transition: "color .3s ease",
        }}
      >
        {included ? <Check sx={{ fontSize: 18 }} /> : "–"}
      </Box>
      <Box
        component="span"
        sx={{
          flex: 1,
          fontWeight: strong ? 650 : 400,
          color: included ? palette.ink : palette.muted,
          transition: "color .3s ease",
        }}
      >
        <Box component="span" sx={visuallyHidden}>
          {included ? "Benne van: " : "Nincs benne: "}
        </Box>
        {label}
      </Box>
      {tag && (
        <Box
          component="span"
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: palette.muted,
            border: `1px solid ${palette.line}`,
            borderRadius: 1,
            px: 0.75,
            whiteSpace: "nowrap",
          }}
        >
          {tag}
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

/** Counts smoothly to a new price (0.7 s, ease-out); jumps straight there when motion is reduced. */
function useCountUp(target: number): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = from.current;
    if (start === target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = target;
      setValue(target);
      return;
    }
    const began = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - began) / 700);
      const next = start + (target - start) * (1 - Math.pow(1 - t, 3));
      from.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}
