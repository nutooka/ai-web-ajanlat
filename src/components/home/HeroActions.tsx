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

export function HeroActions() {
  const launch = pricingConfig.discounts.launch;
  const router = useRouter();
  const snapshot = useWizardSnapshot();
  const hasProgress = Boolean(snapshot?.answers.projectType);

  const restart = () => {
    wizardStore.reset();
    router.push("/tervezo");
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button component={Link} href="/tervezo" variant="contained" color="secondary" size="large" endIcon={<ArrowForward />}>
          {hasProgress ? "Folytatom, ahol abbahagytam" : "Kezdjük el"}
        </Button>
        {hasProgress && (
          <Button variant="outlined" color="inherit" size="large" startIcon={<RestartAlt />} onClick={restart}>
            Újrakezdem
          </Button>
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Kb. 4 perc · ingyenes · nem kell regisztrálni
        {launch.enabled && (
          <>
            <br />
            <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
              Most −{launch.percent}% indulási kedvezménnyel
            </Box>
          </>
        )}
      </Typography>
    </Stack>
  );
}
