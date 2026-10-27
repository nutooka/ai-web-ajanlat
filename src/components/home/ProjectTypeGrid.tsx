"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { OPTION_ICONS } from "@/components/icons";
import { projectTypeQuestion } from "@/features/questionnaire/config/branches";
import { getVisibleQuestions } from "@/features/questionnaire/engine";
import { wizardStore } from "@/lib/storage";
import { palette, tint } from "@/theme/tokens";

export function ProjectTypeGrid() {
  const router = useRouter();

  const start = (projectType: string) => {
    const answers = { projectType };
    wizardStore.reset();
    wizardStore.update({ answers, currentId: getVisibleQuestions(answers)[1]?.id ?? null });
    router.push("/tervezo");
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
      {projectTypeQuestion.options.map((option, index) => {
        const Icon = option.icon ? OPTION_ICONS[option.icon] : null;
        return (
            <ButtonBase
              key={option.id}
              onClick={() => start(option.id)}
              sx={{
                width: "100%",
                height: "100%",
                p: 3,
                borderRadius: 4,
                border: 1,
                borderColor: "divider",
                background: "rgba(255,255,255,.75)",
                backdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                gap: 1.5,
                transition: "transform .2s ease, border-color .2s ease, box-shadow .2s ease",
                "&:hover, &.Mui-focusVisible": {
                  borderColor: palette.ink,
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 30px -18px rgba(20,22,26,.35)",
                },
                "&:hover .arrow": { transform: "translateX(4px)", opacity: 1 },
              }}
            >
              {Icon && (
                <Box sx={{ width: 48, height: 48, borderRadius: 3.5, display: "grid", placeItems: "center", background: tint(index).bg, color: tint(index).fg }}>
                  <Icon sx={{ fontSize: 26 }} />
                </Box>
              )}
              <Typography variant="h5" component="span">
                {option.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" component="span" sx={{ flex: 1 }}>
                {option.description}
              </Typography>
              <ArrowForward className="arrow" fontSize="small" sx={{ opacity: 0.5, transition: "all .2s ease" }} />
            </ButtonBase>
        );
      })}
    </Box>
  );
}
