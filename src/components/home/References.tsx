import ArrowOutward from "@mui/icons-material/ArrowOutward";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { references } from "@/config/references";
import { palette, shadow } from "@/theme/tokens";

/** Real, clickable past work – the strongest trust signal on the page. */
export function References() {
  if (references.length === 0) return null;
  return (
    <Box component="section" aria-labelledby="references-title" sx={{ background: palette.paper }}>
      <Container maxWidth="lg" sx={{ py: { xs: 9, md: 13 } }}>
        <Stack direction={{ xs: "column", md: "row" }} className="reveal" sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" }, gap: 2, mb: { xs: 4, md: 6 } }}>
          <Typography id="references-title" variant="h2" sx={{ maxWidth: 560 }}>
            Legutóbbi munkánk
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 360 }}>
            Nézd meg élőben – ugyanígy készül a te oldalad is.
          </Typography>
        </Stack>

        <Stack spacing={3}>
          {references.map((reference) => (
            <Box
              key={reference.url}
              component="a"
              href={reference.url}
              target="_blank"
              rel="noopener"
              className="reveal"
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
                borderRadius: 4,
                overflow: "hidden",
                background: palette.surface,
                border: 1,
                borderColor: "divider",
                color: "inherit",
                textDecoration: "none",
                transition: "box-shadow .2s ease, transform .2s ease",
                "&:hover": { boxShadow: shadow.raised, transform: "translateY(-2px)" },
                "&:hover .ref-arrow": { transform: "translate(2px, -2px)" },
                "&:focus-visible": { outline: `2px solid ${palette.ink}`, outlineOffset: 3 },
              }}
            >
              <Box sx={{ position: "relative", aspectRatio: "16 / 10", background: palette.ink }}>
                <Image src={reference.image} alt={`${reference.name} – a weboldal nyitóképe`} fill sizes="(max-width: 900px) 100vw, 60vw" style={{ objectFit: "cover", objectPosition: "top" }} />
              </Box>
              <Stack sx={{ p: { xs: 3, md: 5 }, justifyContent: "center" }} spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  {reference.kind}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography variant="h4" component="h3">
                    {reference.name}
                  </Typography>
                  <ArrowOutward className="ref-arrow" sx={{ transition: "transform .2s ease" }} />
                </Stack>
                <Typography color="text.secondary">{reference.summary}</Typography>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                  {reference.tags.map((tag) => (
                    <Box key={tag} component="span" sx={{ px: 1.25, py: 0.5, borderRadius: 1.5, background: palette.brandTint, fontSize: 13, fontWeight: 600 }}>
                      {tag}
                    </Box>
                  ))}
                </Stack>
                <Typography sx={{ fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>{reference.url.replace(/^https:\/\//, "").replace(/\/$/, "")}</Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
