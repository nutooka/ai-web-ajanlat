"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { services } from "@/config/services";
import { siteConfig } from "@/config/site";

/** Height reserved under the footer when a sticky bar is pinned to the bottom of the screen. */
export const STICKY_BAR_SPACE = 104;

/**
 * Shared footer. The privacy link comes first, so on mobile it sits above the company name.
 * With `reserveStickyBar` the footer keeps empty space at the bottom so the sticky bar never covers it.
 */
export function SiteFooter({ reserveStickyBar = false }: { reserveStickyBar?: boolean }) {
  return (
    <Box
      component="footer"
      id="site-footer"
      className="no-print"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        pt: 3,
        pb: reserveStickyBar ? `calc(24px + ${STICKY_BAR_SPACE}px + env(safe-area-inset-bottom))` : 3,
        mt: 8,
      }}
    >
      {/* Service pages linked from every page (crawlable internal links). */}
      <Container maxWidth="lg" component="nav" aria-label="Szolgáltatások" sx={{ display: "flex", flexWrap: "wrap", columnGap: 2.5, rowGap: 0.5, pb: 1.5 }}>
        {services.map((service) => (
          <MuiLink key={service.slug} component={Link} href={`/${service.slug}`} variant="body2" color="text.secondary" sx={{ display: "inline-flex", alignItems: "center", minHeight: 44 }}>
            {service.name}
          </MuiLink>
        ))}
      </Container>
      <Container maxWidth="lg" sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 0.5, sm: 2 }, justifyContent: "space-between" }}>
        <MuiLink component={Link} href="/adatkezeles" variant="body2" color="text.secondary" sx={{ display: "inline-flex", alignItems: "center", minHeight: 44 }}>
          Adatkezelési tájékoztató
        </MuiLink>
        <Typography variant="body2" color="text.secondary">
          © {siteConfig.company.legalName}
        </Typography>
      </Container>
    </Box>
  );
}
