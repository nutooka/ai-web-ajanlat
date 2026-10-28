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
import { buildOffer } from "@/features/offer/buildOffer";
import { LoadSharedOfferButton } from "@/features/offer/components/LoadSharedOfferButton";
import { loadSharedOffer, normalizeCode } from "@/features/offer/share";
import { PACKAGE_IDS } from "@/features/pricing/types";
import { formatRon, formatWeeks } from "@/lib/format";
import { palette } from "@/theme/tokens";

export const metadata: Metadata = {
  title: "Megosztott ajánlat",
  description: "Egy kitöltött weboldal-ajánlat minden válasszal.",
  robots: { index: false },
};

const dateFormat = new Intl.DateTimeFormat("hu-HU", { timeZone: "Europe/Bucharest", year: "numeric", month: "long", day: "numeric" });

export default function SharedOfferPage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <Container component="main" maxWidth="md" sx={{ flex: 1, py: { xs: 5, md: 8 } }}>
        <Suspense fallback={<Skeleton variant="rounded" height={420} sx={{ borderRadius: 4 }} />}>
          <SharedOffer params={params} />
        </Suspense>
      </Container>
      <SiteFooter />
    </Box>
  );
}

async function SharedOffer({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = normalizeCode(rawCode);
  const shared = code ? await loadSharedOffer(code).catch(() => null) : null;
  // Prices without the time-limited quick-decision discount: that belongs to the person who filled it in.
  const offer = shared ? buildOffer(shared.answers, { offerAgeMinutes: Number.MAX_SAFE_INTEGER }) : null;

  if (!shared || !offer || !code) {
    return (
      <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
        <Typography variant="h3" component="h1">
          Ezt az ajánlatot nem találjuk
        </Typography>
        <Typography color="text.secondary">Lehet, hogy elírtad a kódot, vagy az ajánlat régebbi 180 napnál. Töltsd ki újra – 3 perc.</Typography>
        <LinkButton href="/tervezo" variant="contained" color="primary" size="large">
          Kérdőív kitöltése
        </LinkButton>
      </Stack>
    );
  }

  const chosen = offer.quote.packages[shared.packageId];
  return (
    <Stack spacing={4}>
      <Box>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          Ajánlat-kód: <b style={{ letterSpacing: "0.08em", color: palette.ink }}>{code}</b>
          {shared.createdAt ? ` · készült: ${dateFormat.format(shared.createdAt)}` : ""}
        </Typography>
        <Typography variant="h2" component="h1" sx={{ mt: 1 }}>
          {offer.projectTypeLabel}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 640 }}>
          {offer.summary}
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
        {PACKAGE_IDS.map((id) => {
          const pkg = offer.quote.packages[id];
          const isChosen = id === shared.packageId;
          return (
            <Box key={id} sx={{ p: 2.5, borderRadius: 3, background: palette.surface, border: isChosen ? `2px solid ${palette.ink}` : 1, borderColor: isChosen ? palette.ink : "divider" }}>
              <Typography sx={{ fontWeight: 700 }}>
                {pkg.name}
                {isChosen ? " · választott" : ""}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26 }}>{formatRon(pkg.finalPrice)}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatWeeks(pkg.timeline.minWeeks, pkg.timeline.maxWeeks)}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: -2 }}>
        Az árak a gyors döntés kedvezmény nélkül szerepelnek. {chosen.name} csomag: {formatRon(chosen.finalPrice)}.
      </Typography>

      <Box sx={{ borderRadius: 4, background: palette.surface, border: 1, borderColor: "divider", p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Minden válasz
        </Typography>
        <Box component="dl" sx={{ m: 0 }}>
          {offer.answerRows.map((row) => (
            <Box key={row.questionId} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: { xs: 0.25, sm: 3 }, py: 1.25, borderBottom: 1, borderColor: "divider" }}>
              <Typography component="dt" variant="body2" color="text.secondary">
                {row.question}
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600, whiteSpace: "pre-wrap" }}>
                {row.answer}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <LoadSharedOfferButton answers={shared.answers} packageId={shared.packageId} />
      </Box>
    </Stack>
  );
}
