"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import RestartAlt from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OPTION_ICONS } from "@/components/icons";
import { pricingConfig } from "@/config/pricing";
import { projectTypeQuestion } from "@/features/questionnaire/config/branches";
import { formatRon } from "@/lib/format";
import { useWizardSnapshot, wizardStore } from "@/lib/storage";
import { palette } from "@/theme/tokens";
import { startPlanner } from "./startPlanner";

/**
 * Hero call to action. A first visit gets the planner's first question right here:
 * one tap on a project type starts the questionnaire. A returning visitor gets "continue".
 */
export function HeroActions({ startingPrices }: { startingPrices: Record<string, number> }) {
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
    <Stack spacing={2} sx={{ width: "100%" }}>
      {hasProgress ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button component={Link} href="/tervezo" variant="contained" color="primary" size="large" endIcon={<ArrowForward />}>
            Folytatom, ahol abbahagytam
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<RestartAlt />}
            onClick={restart}
            sx={{ color: "#fff", borderColor: palette.inkLine, "&:hover": { borderColor: "#fff", background: "transparent" } }}
          >
            Újrakezdem
          </Button>
        </Stack>
      ) : (
        <Box component="section" aria-labelledby="hero-pick-title">
          <Typography id="hero-pick-title" sx={{ fontWeight: 700, fontSize: "1.0625rem", mb: 1.5 }}>
            Mit szeretnél készíttetni?{" "}
            <Box component="span" sx={{ color: palette.inkMuted, fontWeight: 500 }}>
              Válassz, és már indul is.
            </Box>
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1, maxWidth: 560 }}>
            {projectTypeQuestion.options.map((option) => {
              const Icon = option.icon ? OPTION_ICONS[option.icon] : null;
              const price = startingPrices[option.id];
              return (
                <ButtonBase
                  key={option.id}
                  onClick={() => startPlanner(option.id, router.push)}
                  sx={{
                    minHeight: 64,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2.5,
                    border: `1px solid ${palette.inkLine}`,
                    background: "rgba(255,255,255,.04)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 1.25,
                    textAlign: "left",
                    transition: "background .18s ease, border-color .18s ease, color .18s ease, transform .18s ease",
                    "&:hover, &.Mui-focusVisible": { background: palette.lime, borderColor: palette.lime, color: palette.ink, transform: "translateY(-1px)" },
                    "&:hover .pick-price, &.Mui-focusVisible .pick-price": { color: palette.ink },
                    "&.Mui-focusVisible": { outline: "2px solid #fff", outlineOffset: 2 },
                  }}
                >
                  {Icon && <Icon sx={{ fontSize: 20, flexShrink: 0 }} />}
                  <Box component="span" sx={{ minWidth: 0 }}>
                    <Box component="span" sx={{ display: "block", fontWeight: 650, fontSize: 14, lineHeight: 1.25 }}>
                      {option.label}
                    </Box>
                    <Box component="span" className="pick-price" sx={{ display: "block", fontSize: 12, mt: 0.25, color: palette.inkMuted }}>
                      {price ? `${formatRon(price)}-tól` : "Segítünk dönteni"}
                    </Box>
                  </Box>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      )}
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
