"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <Box component="footer" className="no-print" sx={{ borderTop: 1, borderColor: "divider", py: 4, mt: 8 }}>
      <Container maxWidth="lg" sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary">
          © {siteConfig.company.legalName}
        </Typography>
        <MuiLink component={Link} href="/adatkezeles" variant="body2" color="text.secondary">
          Adatkezelési tájékoztató
        </MuiLink>
      </Container>
    </Box>
  );
}
