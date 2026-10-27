"use client";

import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PackageQuote } from "@/features/pricing/types";
import { formatRon } from "@/lib/format";
import { palette } from "@/theme/tokens";

interface DeadlineSliderControlProps {
  pkg: PackageQuote;
  onChange: (weeks: number) => void;
  /** id of the visible label (question title or card heading). */
  labelledBy: string;
  /** The questionnaire shows only the percentage – prices appear at the end. */
  showAmount: boolean;
}

/** Readout + slider. Shared by the questionnaire step and the offer page. */
export function DeadlineSliderControl({ pkg, onChange, labelledBy, showAmount }: DeadlineSliderControlProps) {
  const { fastestWeeks, normalWeeks, latestWeeks, chosenWeeks, multiplier } = pkg.schedule;
  const value = Math.min(latestWeeks, Math.max(fastestWeeks, chosenWeeks ?? pkg.timeline.minWeeks));
  const percent = Math.round((multiplier - 1) * 100);
  const amount = Math.abs(pkg.urgencyAdjustment);

  const marks = [
    { value: fastestWeeks, label: fastestWeeks < normalWeeks ? "Sürgős" : "Normál" },
    ...(normalWeeks > fastestWeeks && normalWeeks < latestWeeks ? [{ value: normalWeeks, label: "Normál" }] : []),
    { value: latestWeeks, label: "Ráérek" },
  ];

  const effect =
    percent < 0
      ? showAmount
        ? `−${-percent}% · −${formatRon(amount)}`
        : `−${-percent}% kedvezmény`
      : percent > 0
        ? `+${percent}% sürgősségi felár`
        : "normál ár";

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 1, gap: 2 }} aria-live="polite">
        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>{value} hét</Typography>
        <Typography
          sx={{
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: percent === 0 ? "text.secondary" : palette.ink,
            px: percent === 0 ? 0 : 1.25,
            py: 0.25,
            borderRadius: 1.5,
            border: percent < 0 ? `1.5px solid ${palette.amber}` : "none",
            background: percent < 0 ? "#FFF4E0" : percent > 0 ? palette.paper : "transparent",
          }}
        >
          {effect}
        </Typography>
      </Stack>
      {/* Side padding keeps the end labels ("Sürgős", "Ráérek") inside narrow screens. */}
      <Box sx={{ px: { xs: 2.5, md: 1.5 } }}>
      <Slider
        value={value}
        min={fastestWeeks}
        max={latestWeeks}
        step={1}
        marks={marks}
        onChange={(_, next) => onChange(Array.isArray(next) ? next[0] : next)}
        getAriaValueText={(weeks) => `${weeks} hét`}
        aria-labelledby={labelledBy}
        color="secondary"
        sx={{
          height: 6,
          "& .MuiSlider-thumb": { width: 28, height: 28, background: palette.lime, border: `2px solid ${palette.ink}` },
          "& .MuiSlider-thumb.Mui-focusVisible, & .MuiSlider-thumb:hover": { boxShadow: "0 0 0 8px rgba(14,15,18,.12)" },
          "& .MuiSlider-markLabel": { fontSize: 13, color: "text.secondary" },
          "& .MuiSlider-rail": { opacity: 1, background: palette.line },
        }}
      />
      </Box>
    </Box>
  );
}

/** Offer-page card: time vs money with live prices. */
export function DeadlineSlider({ pkg, onChange }: { pkg: PackageQuote; onChange: (weeks: number) => void }) {
  return (
    <Box component="section" aria-labelledby="deadline-title" sx={{ mt: 3, p: { xs: 3, md: 4 }, borderRadius: 4, border: 1, borderColor: "divider", background: palette.surface }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.4fr" }, gap: { xs: 3, md: 6 }, alignItems: "center" }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
          <Box sx={{ flexShrink: 0, width: 44, height: 44, borderRadius: 2.5, display: "grid", placeItems: "center", background: palette.paper }}>
            <ScheduleOutlined />
          </Box>
          <Box>
            <Typography id="deadline-title" variant="h5" component="h2">
              Mikorra kell elkészülnie?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Minél több időt adsz, annál olcsóbb – a munkát a szabad kapacitásunkba tudjuk tenni.
            </Typography>
          </Box>
        </Stack>
        <DeadlineSliderControl pkg={pkg} onChange={onChange} labelledBy="deadline-title" showAmount />
      </Box>
    </Box>
  );
}
