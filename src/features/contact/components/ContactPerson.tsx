"use client";

import WhatsApp from "@mui/icons-material/WhatsApp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { trackStep } from "@/features/funnel/track";

/** WhatsApp message prefilled with the offer code, so we can open the offer straight away. */
export function whatsAppOfferLink(number: string, code?: string, packageName?: string): string {
  const offer = code ? `a(z) ${code} kódú ajánlatomról${packageName ? ` (${packageName} csomag)` : ""}` : "az ajánlatomról";
  return `https://wa.me/${number}?text=${encodeURIComponent(`Szia! A nutooka.tech-ről írok ${offer}. Szeretnék egyeztetni.`)}`;
}

/** "Betti hív vissza": the founder's face next to the request form, plus a WhatsApp shortcut with the offer code. */
export function ContactPerson({ code, packageName }: { code?: string; packageName?: string }) {
  const { person, chat } = siteConfig;
  const number: string = chat.whatsapp;
  return (
    <Stack spacing={2} sx={{ mt: 3 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Box sx={{ position: "relative", width: 56, height: 56, flexShrink: 0, borderRadius: "50%", overflow: "hidden" }}>
          <Image src={person.photo} alt={person.name} fill sizes="56px" style={{ objectFit: "cover" }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.3 }}>{person.firstName} hív vissza</Typography>
          <Typography variant="body2" color="text.secondary">
            {person.role}
          </Typography>
        </Box>
      </Stack>
      {number && (
        <Button
          component="a"
          href={whatsAppOfferLink(number, code, packageName)}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={<WhatsApp />}
          onClick={() => trackStep("chat_click")}
          sx={{ alignSelf: "flex-start" }}
        >
          Inkább WhatsAppon írok
        </Button>
      )}
    </Stack>
  );
}
