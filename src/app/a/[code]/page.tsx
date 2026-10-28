import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LinkButton } from "@/components/LinkButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SharedOfferView } from "@/features/offer/components/OfferView";
import { loadSharedOffer, normalizeCode } from "@/features/offer/share";

export const metadata: Metadata = {
  title: "Megosztott ajánlat",
  description: "Egy kitöltött weboldal-ajánlat pontosan úgy, ahogy a kitöltő látta.",
  robots: { index: false },
};

export default function SharedOfferPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100dvh" }}>
          <SiteHeader />
          <Container maxWidth="lg" sx={{ py: 8 }} aria-busy="true">
            <Skeleton variant="rounded" height={420} sx={{ borderRadius: 4 }} />
          </Container>
        </Box>
      }
    >
      <SharedOffer params={params} />
    </Suspense>
  );
}

async function SharedOffer({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = normalizeCode(rawCode);
  const shared = code ? await loadSharedOffer(code).catch(() => null) : null;

  if (!shared || !code) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <SiteHeader />
        <Container component="main" maxWidth="md" sx={{ flex: 1, py: { xs: 5, md: 8 } }}>
          <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
            <Typography variant="h3" component="h1">
              Ezt az ajánlatot nem találjuk
            </Typography>
            <Typography color="text.secondary">Lehet, hogy elírtad a kódot, vagy az ajánlat régebbi 180 napnál. Töltsd ki újra – 3 perc.</Typography>
            <LinkButton href="/tervezo" variant="contained" color="primary" size="large">
              Kérdőív kitöltése
            </LinkButton>
          </Stack>
        </Container>
        <SiteFooter />
      </Box>
    );
  }

  return <SharedOfferView answers={shared.answers} packageId={shared.packageId} frozen={{ code, ageMinutes: shared.ageMinutes, savedAt: shared.createdAt }} />;
}
