import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { services } from "@/config/services";
import { startingPrice } from "@/features/pricing/startingPrice";
import { formatRon } from "@/lib/format";
import { palette } from "@/theme/tokens";

/**
 * Server-rendered explainer under the questionnaire: what the calculator does and how it prices.
 * Keeps the planner page readable for search engines, which do not run the questionnaire.
 */
export function PlannerIntro() {
  return (
    <Box component="section" aria-labelledby="planner-intro-title" sx={{ borderTop: 1, borderColor: "divider", background: palette.surface, pb: "calc(120px + env(safe-area-inset-bottom))" }}>
      <Container maxWidth="md" sx={{ pt: { xs: 6, md: 8 } }}>
        <Typography id="planner-intro-title" variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, mb: 2 }}>
          Hogyan számol a weboldal árkalkulátor?
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          A kérdőív egyszerre egy kérdést tesz fel: milyen projektet tervezel, hány oldal vagy termék lesz, milyen funkciók kellenek, van-e már logód és szöveged,
          és mikorra kell elkészülnie. Minden válasz egy tételhez tartozik, amelynek rögzített munkaórája és ára van, így az ajánlat nem becslés a levegőbe, hanem tételes
          kalkuláció RON-ban.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          A végén három csomagot látsz (Basic, Standard, Premium) az átfutási idővel és a havi fenntartási költségekkel együtt. Nem kell regisztrálni, a válaszaid a
          böngésződben maradnak, és bármikor folytathatod. A végleges, fix árat egy ingyenes, 30 perces egyeztetés után adjuk.
        </Typography>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Kezdő árak projekttípusonként</Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, color: "text.secondary" }}>
          {services.map((service) => (
            <li key={service.slug}>
              <Link href={`/${service.slug}`} style={{ color: palette.ink, fontWeight: 600 }}>
                {service.name}
              </Link>
              : {formatRon(startingPrice(service.type))}-tól
            </li>
          ))}
        </Box>
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          Részletes árakat és spórolási tippeket a{" "}
          <Link href="/mennyibe-kerul-egy-weboldal" style={{ color: palette.ink, fontWeight: 600 }}>
            Mennyibe kerül egy weboldal?
          </Link>{" "}
          cikkben találsz.
        </Typography>
      </Container>
    </Box>
  );
}
