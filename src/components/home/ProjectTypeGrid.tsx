"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { projectTypeQuestion } from "@/features/questionnaire/config/branches";
import { formatRon } from "@/lib/format";
import { palette } from "@/theme/tokens";
import { startPlanner } from "./startPlanner";

/** Typographic list of project types; each row starts the planner with that type pre-selected. */
export function ProjectTypeGrid({ startingPrices }: { startingPrices: Record<string, number> }) {
  const router = useRouter();

  const start = (projectType: string) => startPlanner(projectType, router.push);

  return (
    <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, borderTop: 1, borderColor: "divider" }}>
      {projectTypeQuestion.options.map((option, index) => {
        const price = startingPrices[option.id];
        return (
          <Box component="li" key={option.id} sx={{ borderBottom: 1, borderColor: "divider" }}>
            <ButtonBase
              onClick={() => start(option.id)}
              sx={{
                position: "relative",
                width: "100%",
                display: "grid",
                gridTemplateColumns: { xs: "1fr auto", md: "56px 1.1fr 1fr auto 40px" },
                alignItems: "center",
                columnGap: 3,
                rowGap: 0.5,
                py: { xs: 2.5, md: 3.25 },
                px: { xs: 1, md: 2 },
                textAlign: "left",
                overflow: "hidden",
                isolation: "isolate",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  zIndex: -1,
                  background: palette.lime,
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform .45s cubic-bezier(.22,1,.36,1)",
                },
                "&:hover::before, &.Mui-focusVisible::before": { transform: "scaleX(1)" },
                "&:hover .row-arrow, &.Mui-focusVisible .row-arrow": { transform: "translateX(6px)" },
                "@media (prefers-reduced-motion: reduce)": { "&::before": { transition: "none" } },
              }}
            >
              <Typography component="span" sx={{ display: { xs: "none", md: "block" }, color: "text.secondary", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                {String(index + 1).padStart(2, "0")}
              </Typography>
              <Typography component="span" variant="h4" sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" } }}>
                {option.label}
              </Typography>
              <Typography component="span" variant="body2" color="text.secondary" sx={{ gridColumn: { xs: "1 / 2", md: "auto" }, gridRow: { xs: 2, md: "auto" } }}>
                {option.description}
              </Typography>
              <Typography component="span" sx={{ fontWeight: 650, whiteSpace: "nowrap", textAlign: "right", gridRow: { xs: "1 / 3", md: "auto" } }}>
                {price ? (
                  <>
                    <Box component="span" sx={{ display: "block", fontSize: 12, fontWeight: 500, color: "text.secondary" }}>
                      már
                    </Box>
                    {formatRon(price)}-tól
                  </>
                ) : (
                  <Box component="span" sx={{ fontSize: 14 }}>
                    Segítünk dönteni
                  </Box>
                )}
              </Typography>
              <ArrowForward className="row-arrow" sx={{ display: { xs: "none", md: "block" }, transition: "transform .3s ease" }} />
            </ButtonBase>
          </Box>
        );
      })}
    </Box>
  );
}
