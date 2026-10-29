"use client";

import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Submission } from "@/lib/storage";
import { gradients, palette } from "@/theme/tokens";

const dateFormatter = new Intl.DateTimeFormat("hu-HU", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

/** Persistent confirmation once the consultation request went out – replaces the form. */
export function SubmittedPanel({ submission, packageName, nextSteps }: { submission: Submission; packageName: string; nextSteps: string[] }) {
  return (
    <Box role="status" sx={{ borderRadius: 4, background: palette.ink, color: "#fff", p: { xs: 3, md: 5 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ alignItems: { sm: "center" } }}>
        <Box sx={{ flexShrink: 0, width: 56, height: 56, borderRadius: 3, display: "grid", placeItems: "center", background: gradients.brand, color: palette.ink }}>
          <CheckCircleOutlineOutlined />
        </Box>
        <Box>
          <Typography variant="h3" component="h2">
            Megkaptuk a kérésed
          </Typography>
          <Typography sx={{ color: palette.inkMuted, mt: 0.5 }}>
            {dateFormatter.format(submission.at)} · {packageName} csomag
            {submission.copySent ? " · a másolatot elküldtük e-mailben" : ""}
          </Typography>
        </Box>
      </Stack>

      <Typography variant="h6" component="h3" sx={{ mt: 4, mb: 2 }}>
        Mi következik?
      </Typography>
      <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
        {nextSteps.map((step, index) => (
          <Box component="li" key={step} sx={{ p: 2, borderRadius: 2.5, background: palette.inkSoft, opacity: index === 0 ? 1 : 0.92 }}>
            <Typography sx={{ fontWeight: 800, color: index === 0 ? palette.brandOnDark : "#fff" }}>{index === 0 ? "✓ Kész" : `${index + 1}.`}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#fff" }}>
              {step}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
