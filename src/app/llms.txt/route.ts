import { services } from "@/config/services";
import { siteConfig, siteUrl } from "@/config/site";
import { startingPrice } from "@/features/pricing/startingPrice";
import { formatRon } from "@/lib/format";

/**
 * llms.txt: a short, plain summary for AI assistants (ChatGPT, Perplexity, Claude…), built from the
 * same config as the pages, so prices never drift from what the site shows.
 */
export function GET() {
  const { company } = siteConfig;
  const body = [
    "# Nutooka – weboldal készítés azonnali árajánlattal",
    "",
    `> ${company.legalName}: weboldal-, webshop-, landing page- és webalkalmazás-fejlesztés Székelyudvarhelyről (Hargita megye, Románia), magyar és román nyelven, Erdély-szerte és Magyarországra is. Egy 3 perces kérdőív után azonnal tételes, három csomagos (Basic, Standard, Premium) árajánlatot ad RON-ban, regisztráció nélkül.`,
    "",
    "Fontos tények:",
    "- Az ár egyetlen végösszeg (nincs külön ÁFA-sor). A kérdőív becslést ad; a fix ár egy ingyenes, kb. 30 perces egyeztetés után készül.",
    "- Egy átlagos céges weboldal 2–4 hét alatt készül el.",
    "- A domain, a kód és a tartalom az ügyfél nevére szól.",
    `- Kiszolgált terület: ${company.areaServed.join(", ")}.`,
    `- Kapcsolat: ${company.email}${siteConfig.chat.whatsapp ? `, WhatsApp: +${siteConfig.chat.whatsapp}` : ""}.`,
    "",
    "## Szolgáltatások és induló árak",
    "",
    ...services.map((service) => `- [${service.name}](${siteUrl}/${service.slug}): ${formatRon(startingPrice(service.type))}-tól. ${service.intro}`),
    "",
    "## Eszközök",
    "",
    `- [Árajánlat-kérdőív](${siteUrl}/tervezo): 3 perc, azonnali tételes ár három csomagban.`,
    `- [Ingyenes weboldal-átvilágítás](${siteUrl}/atvilagitas): mobilos sebesség (Google PageSpeed), elérhetőség, jogi minimum, Google-alapok, versenytárs-összehasonlítás.`,
    "",
    "## Cikkek",
    "",
    `- [Mennyibe kerül egy weboldal 2026-ban Erdélyben?](${siteUrl}/mennyibe-kerul-egy-weboldal): árak Romániában és Erdélyben, mitől függ az ár.`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
