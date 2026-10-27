"use client";

import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PROJECT_TYPE_LABELS } from "@/features/offer/buildOffer";
import type { Quote } from "@/features/pricing/types";
import { palette } from "@/theme/tokens";

const MAX_FEATURES = 6;

/** Desktop-only "consultant" panel: what we know so far. Prices are shown only at the end. */
export function WizardSidebar({ quote, answeredCount }: { quote: Quote | null; answeredCount: number }) {
  const features = quote?.packages.standard.items.filter((item) => item.source === "answer").map((item) => item.label) ?? [];

  return (
    <Stack spacing={2} component="aside" aria-label="A projekted összefoglalója" sx={{ position: "sticky", top: 112 }}>
      <Box sx={{ borderRadius: 4, p: 3, background: palette.ink, color: "#fff", position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "relative" }}>
          <Typography sx={{ fontSize: 13, opacity: 0.65 }}>A projekted</Typography>
          <Typography variant="h5" component="p" sx={{ mt: 0.5 }}>
            {quote ? PROJECT_TYPE_LABELS[quote.projectType] : "Még formálódik…"}
          </Typography>

          <Typography variant="body2" sx={{ mt: 2, color: palette.inkMuted }}>
            A pontos árat és a három csomagot a kérdések végén mutatjuk meg.
          </Typography>

          {features.length > 0 && (
            <Stack component="ul" spacing={1} sx={{ listStyle: "none", p: 0, m: 0, mt: 3, pt: 2.5, borderTop: "1px solid rgba(255,255,255,.12)" }}>
              {features.slice(0, MAX_FEATURES).map((feature) => (
                <Stack component="li" key={feature} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                  <CheckCircleOutlineOutlined sx={{ fontSize: 16, mt: "3px", color: palette.lime }} />
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {feature}
                  </Typography>
                </Stack>
              ))}
              {features.length > MAX_FEATURES && (
                <Typography variant="body2" sx={{ opacity: 0.6, pl: 3 }}>
                  + {features.length - MAX_FEATURES} további
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Box>

      <Box sx={{ borderRadius: 3, p: 2.5, background: palette.surface, border: 1, borderColor: "divider" }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {answeredCount} válasz elmentve
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bármikor visszaléphetsz vagy később folytathatod – a böngésződ megjegyzi, hol tartasz.
        </Typography>
      </Box>
    </Stack>
  );
}
