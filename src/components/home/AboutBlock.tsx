import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { palette } from "@/theme/tokens";

const FACTS = ["Székelyudvarhely", "8 év tapasztalat", "Saját kód, a te nevedre"];

/** "Kik vagyunk": the person behind the site, so visitors know who will call them back. */
export function AboutBlock() {
  const { person, chat } = siteConfig;
  return (
    <Box component="section" aria-labelledby="about-title" sx={{ background: palette.paper }}>
      <Container maxWidth="lg" sx={{ py: { xs: 9, md: 13 } }}>
        <Box className="reveal" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "auto 1fr" }, gap: { xs: 4, md: 8 }, alignItems: "center" }}>
          <Box sx={{ position: "relative", width: { xs: 160, md: 240 }, aspectRatio: "1", borderRadius: "50%", overflow: "hidden", boxShadow: "0 24px 48px -24px rgba(14,15,18,.45)" }}>
            <Image src={person.photo} alt={`${person.name}, a Nutooka alapítója`} fill sizes="(min-width: 900px) 240px, 160px" style={{ objectFit: "cover" }} />
          </Box>
          <Box sx={{ maxWidth: 640 }}>
            <Typography color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
              Kik vagyunk?
            </Typography>
            <Typography id="about-title" variant="h2" sx={{ mb: 2.5 }}>
              Nem ügyfélszolgálat hív vissza, hanem én.
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {person.bio.map((line) => (
                <Typography key={line} color="text.secondary" sx={{ fontSize: "1.0625rem" }}>
                  {line}
                </Typography>
              ))}
            </Stack>
            <Typography sx={{ fontWeight: 700 }}>{person.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {person.role} ·{" "}
              <Box component="a" href={person.linkedin} target="_blank" rel="noopener" sx={{ color: "inherit", textUnderlineOffset: 3 }}>
                LinkedIn
              </Box>
              {chat.whatsapp && (
                <>
                  {" · "}
                  <Box component="a" href={`tel:+${chat.whatsapp}`} sx={{ color: "inherit", textUnderlineOffset: 3 }}>
                    {siteConfig.company.phone}
                  </Box>
                </>
              )}
            </Typography>
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
              {FACTS.map((fact) => (
                <Box key={fact} component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 999, border: 1, borderColor: "divider", fontSize: 14, fontWeight: 600 }}>
                  {fact}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
