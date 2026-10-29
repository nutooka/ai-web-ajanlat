"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Blob } from "@/components/Blob";
import { formatRon } from "@/lib/format";
import { palette } from "@/theme/tokens";
import type { ProjectTypeOption } from "./projectTypeOptions";
import { startPlanner } from "./startPlanner";

/** Typographic list of project types; each row starts the planner with that type pre-selected. */
export function ProjectTypeGrid({ options, startingPrices }: { options: ProjectTypeOption[]; startingPrices: Record<string, number> }) {
  const router = useRouter();

  const start = (projectType: string) => startPlanner(projectType, router.push);

  return (
    <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, borderTop: 1, borderColor: "divider" }}>
      {options.map((option, index) => {
        const price = startingPrices[option.id];
        return (
          <Box component="li" key={option.id} sx={{ borderBottom: 1, borderColor: "divider", position: "relative" }}>
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
                  background: palette.brandTint,
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform .45s cubic-bezier(.22,1,.36,1)",
                },
                "&:hover::before, &.Mui-focusVisible::before": { transform: "scaleX(1)" },
                "&:hover .row-arrow, &.Mui-focusVisible .row-arrow": { transform: "translateX(6px)" },
                "@media (prefers-reduced-motion: reduce)": { "&::before": { transition: "none" } },
              }}
            >
              <Box component="span" aria-hidden sx={{ display: { xs: "none", md: "block" } }}>
                <Blob tone="standard" size={26} morph={false} delay={index * 0.05} />
              </Box>
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
            {/* Separate link (not inside the button): the row starts the planner, this opens the service page. */}
            {option.href && (
              <MuiLink
                component={Link}
                href={option.href}
                variant="body2"
                sx={{
                  position: { md: "absolute" },
                  left: { md: 96 },
                  bottom: { md: 6 },
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: { xs: 40, md: 28 },
                  px: { xs: 1, md: 0 },
                  mt: { xs: -1.5, md: 0 },
                  mb: { xs: 1, md: 0 },
                  color: "text.secondary",
                  fontWeight: 600,
                  zIndex: 1,
                }}
              >
                {option.hrefLabel ?? option.label} – részletek →
              </MuiLink>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
