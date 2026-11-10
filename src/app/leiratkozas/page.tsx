import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StopFollowUps } from "./StopFollowUps";

export const metadata: Metadata = {
  title: "Leiratkozás",
  robots: { index: false, follow: false },
};

/** Stop page for follow-up e-mails. The stop itself is a button (POST), so link scanners cannot trigger it. */
export default function UnsubscribePage() {
  return (
    <>
      <SiteHeader />
      <Container maxWidth="sm" component="main" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, mb: 2 }}>
          Leiratkozás
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Egy kattintással leállíthatod a még el nem küldött leveleket. Hírlevelet egyébként sem küldök.
        </Typography>
        <Suspense fallback={null}>
          <StopFollowUps />
        </Suspense>
      </Container>
      <SiteFooter />
    </>
  );
}
