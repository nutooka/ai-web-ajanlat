"use client";

import Box from "@mui/material/Box";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { calculateQuote } from "@/features/pricing/engine";
import { SAMPLE_COMPANY_ANSWERS } from "@/features/pricing/startingPrice";
import { PACKAGE_IDS, type PackageId } from "@/features/pricing/types";
import { formatRon, formatWeeks } from "@/lib/format";
import { FluidBlobs } from "./FluidBlobs";
import { ease, palette, shadow } from "@/theme/tokens";

const VISIBLE_ITEMS = 5;
const TOUR: PackageId[] = ["premium", "basic", "standard"];
const CYCLE_MS = 3200;
const groupFormatter = new Intl.NumberFormat("hu-HU", {
  maximumFractionDigits: 0,
  useGrouping: "always",
});

/** Live sample offer: real numbers from the pricing engine, cycling through the three packages. */
export function OfferPreview() {
  const quote = useMemo(() => calculateQuote(SAMPLE_COMPANY_ANSWERS)!, []);
  const [active, setActive] = useState<PackageId>("standard");
  const [paused, setPaused] = useState(false);
  const pkg = quote.packages[active];

  const price = useMotionValue(pkg.finalPrice);
  const priceText = useTransform(
    price,
    (value) => `${groupFormatter.format(Math.round(value / 50) * 50)} RON`,
  );

  useEffect(() => {
    const controls = animate(price, pkg.finalPrice, {
      duration: 0.7,
      ease: ease.out,
    });
    return () => controls.stop();
  }, [pkg.finalPrice, price]);

  // One tour (Premium → Basic → back to Standard), then it rests. Any interaction stops it for good.
  const reduceMotion = useReducedMotion();
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

  const items = pkg.items.slice(0, VISIBLE_ITEMS);
  const hidden = pkg.items.length - items.length;

  return (
    <>
      <FluidBlobs active={active} />
      <motion.div
        style={{ position: "relative", zIndex: 1 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: ease.out }}
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
                    {id === active && (
                      <motion.span
                        layoutId="preview-tab"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 6,
                          background: palette.lime,
                        }}
                      />
                    )}
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
              component="ul"
              sx={{ listStyle: "none", p: 0, m: 0, minHeight: 5 * 41 + 24 }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3, ease: ease.out }}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "10px 0",
                      borderBottom: `1px solid ${palette.line}`,
                      fontSize: 14,
                    }}
                  >
                    <span>{item.label}</span>
                    <span
                      style={{
                        color: palette.muted,
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatRon(item.price)}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
              <Typography
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ pt: 1.25, minHeight: 24 }}
              >
                {hidden > 0 ? `+ ${hidden} további tétel` : ""}
              </Typography>
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
                  Példaár <s>{formatRon(pkg.listPrice)}</s>
                </Typography>
                <motion.span
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
                </motion.span>
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
                outline: `2px solid ${palette.lime}`,
                outlineOffset: -4,
              },
            }}
          >
            <span>
              Kérem a{" "}
              <Box component="span" sx={{ color: palette.lime }}>
                saját
              </Box>{" "}
              ajánlatom – kérdőív, kb. 3 perc
            </span>
            <ArrowForward sx={{ fontSize: 20, color: palette.lime }} />
          </ButtonBase>
        </Box>
      </motion.div>
    </>
  );
}
