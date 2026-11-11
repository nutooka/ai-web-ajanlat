import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Link from "next/link";
import { formatRon } from "@/lib/format";
import { palette } from "@/theme/tokens";
import type { ProjectTypeOption } from "./projectTypeOptions";

/**
 * Compact list of links to the service pages (the hero tiles already start the planner).
 * Server component: plain links, no client JavaScript.
 */
export function ServiceLinks({ options, startingPrices }: { options: ProjectTypeOption[]; startingPrices: Record<string, number> }) {
  const linked = options.filter((option): option is ProjectTypeOption & { href: string } => Boolean(option.href));
  return (
    <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 1 }}>
      {linked.map((option) => {
        const price = startingPrices[option.id];
        return (
          <Box
            component="li"
            key={option.id}
            sx={{
              "& > a": {
                minHeight: 56,
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                borderRadius: 2.5,
                border: 1,
                borderColor: "divider",
                background: palette.surface,
                color: palette.ink,
                textDecoration: "none",
                transition: "border-color .18s ease, background .18s ease",
              },
              "& > a:hover, & > a:focus-visible": { borderColor: palette.ink, background: palette.brandTint },
              "& > a:hover .service-arrow": { transform: "translateX(4px)" },
              "& > a:focus-visible": { outline: `2px solid ${palette.ink}`, outlineOffset: 2 },
            }}
          >
            {/* Plain next/link (not Box component={Link}): this file stays a server component. */}
            <Link href={option.href}>
              <Box component="span" sx={{ minWidth: 0 }}>
                <Box component="span" sx={{ display: "block", fontWeight: 650, fontSize: 15, lineHeight: 1.3 }}>
                  {option.hrefLabel ?? option.label}
                </Box>
                {price ? (
                  <Box component="span" sx={{ display: "block", fontSize: 13, color: "text.secondary" }}>
                    már {formatRon(price)}-tól
                  </Box>
                ) : null}
              </Box>
              <ArrowForward className="service-arrow" sx={{ fontSize: 18, flexShrink: 0, transition: "transform .2s ease" }} aria-hidden />
            </Link>
          </Box>
        );
      })}
    </Box>
  );
}
