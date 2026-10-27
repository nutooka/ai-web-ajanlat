"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "next/link";
import { palette } from "@/theme/tokens";
import { Logo } from "./Logo";

/** The shared dark header: logo left, one way back into the planner right. */
export function SiteHeader({ action, cta = true }: { action?: React.ReactNode; cta?: boolean }) {
  return (
    <Box component="header" sx={{ background: palette.ink, color: "#fff" }}>
      <Container maxWidth="lg" sx={{ py: 2.5, minHeight: 72, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Logo tone="light" />
        {action ??
          (cta && (
            <Button component={Link} href="/tervezo" endIcon={<ArrowForward />} sx={{ color: "#fff", display: { xs: "none", sm: "inline-flex" } }}>
              Ajánlatkérés
            </Button>
          ))}
      </Container>
    </Box>
  );
}
