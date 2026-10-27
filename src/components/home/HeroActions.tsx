"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import RestartAlt from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pricingConfig } from "@/config/pricing";
import { useWizardSnapshot, wizardStore } from "@/lib/storage";
import { palette } from "@/theme/tokens";

/** Hero call to action, on the dark hero background. */
export function HeroActions() {
  const router = useRouter();
  const snapshot = useWizardSnapshot();
  const hasProgress = Boolean(snapshot?.answers.projectType);
  const quick = pricingConfig.discounts.quickDecision;
  const bestPercent = quick.enabled ? (quick.tiers[0]?.percent ?? 0) : 0;

  const restart = () => {
    wizardStore.reset();
    router.push("/tervezo");
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button component={Link} href="/tervezo" variant="contained" color="primary" size="large" endIcon={<ArrowForward />}>
          {hasProgress ? "Folytatom, ahol abbahagytam" : "Megnézem, mennyibe kerül"}
        </Button>
        {hasProgress && (
          <Button
            variant="outlined"
            size="large"
            startIcon={<RestartAlt />}
            onClick={restart}
            sx={{ color: "#fff", borderColor: palette.inkLine, "&:hover": { borderColor: "#fff", background: "transparent" } }}
          >
            Újrakezdem
          </Button>
        )}
      </Stack>
      <Typography variant="body2" sx={{ color: palette.inkMuted }}>
        Kb. 3 perc · ingyenes · nem kell regisztrálni
        {bestPercent > 0 && (
          <Box component="span" sx={{ display: "block", mt: 0.75, color: palette.amber, fontWeight: 600 }}>
            −{bestPercent}% kedvezmény, ha az ajánlatod elkészülte után 1 órán belül egyeztetést kérsz.
          </Box>
        )}
      </Typography>
    </Stack>
  );
}
