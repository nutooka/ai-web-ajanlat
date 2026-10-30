import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WaveDivider } from "@/components/WaveDivider";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { pricingConfig } from "@/config/pricing";
import { serviceByType } from "@/config/services";
import { siteUrl, defaultOgImage } from "@/config/site";
import { calculateQuote } from "@/features/pricing/engine";
import { SAMPLE_COMPANY_ANSWERS } from "@/features/pricing/startingPrice";
import { PACKAGE_IDS, type Quote } from "@/features/pricing/types";
import type { Answers, ResolvedProjectType } from "@/features/questionnaire/types";
import { LinkButton } from "@/components/LinkButton";
import { formatRon, formatWeeks } from "@/lib/format";
import { palette } from "@/theme/tokens";

const MINIMAL = { languages: "1", domain: "has", branding: "full", design: "template", contentUpload: "self", deadline: "normal" };

/** Every number on this page comes from the live pricing engine – when prices change, the article follows. */
const scenarios: { name: string; type: ResolvedProjectType; answers: Answers; note: string }[] = [
  { name: "Egyszerű bemutatkozó oldal (1–5 oldal)", type: "company", answers: { projectType: "company", ...MINIMAL }, note: "Sablonalapú design, kapcsolati űrlap" },
  { name: "Céges weboldal (6–10 oldal)", type: "company", answers: SAMPLE_COMPANY_ANSWERS, note: "Testreszabott design, időpontfoglalás, galéria" },
  { name: "Landing page", type: "landing", answers: { projectType: "landing", ...MINIMAL }, note: "Egy oldal, egy cél, mérőkódok" },
  { name: "Webshop (Shopify)", type: "webshop", answers: { projectType: "webshop", ...MINIMAL }, note: "Legfeljebb 10 termék, egy fizetési mód" },
  { name: "Weboldal felújítás", type: "redesign", answers: { projectType: "redesign", ...MINIMAL }, note: "Új design, tartalom átvitele" },
  { name: "Egyedi webalkalmazás", type: "webapp", answers: { projectType: "webapp", ...MINIMAL }, note: "Adminfelület, adatbázis, bejelentkezés" },
];

const title = "Mennyibe kerül egy weboldal 2026-ban Erdélyben?";
const description =
  "Valódi árak RON-ban: bemutatkozó oldal, céges weboldal, webshop, landing page és webalkalmazás – csomagonként, átfutással és havi költségekkel. Mitől függ az ár, és hol lehet spórolni?";

export const metadata: Metadata = {
  title: { absolute: `${title} | Nutooka` },
  description,
  alternates: { canonical: "/mennyibe-kerul-egy-weboldal" },
  openGraph: { title, description, url: "/mennyibe-kerul-egy-weboldal", type: "article", images: [defaultOgImage] },
};

export default function PricingArticle() {
  const rows = scenarios.map((scenario) => ({ ...scenario, quote: calculateQuote(scenario.answers)! }));
  const companySimple = rows[0].quote;
  const quickPercent = pricingConfig.discounts.quickDecision.tiers[0]?.percent ?? 0;
  const { maintenance, flexibility } = pricingConfig;
  const flexibleDiscount = Math.round((1 - flexibility.minMultiplier) * 100);
  const short = rows.map((row) => `${row.name}: ${formatRon(row.quote.packages.basic.finalPrice)}-tól`).join("; ");

  const faq = [
    { q: "Mennyibe kerül egy egyszerű weboldal?", a: `Egy egyszerű, 1–5 oldalas bemutatkozó weboldal ${formatRon(companySimple.packages.basic.finalPrice)}-tól készül, kb. ${formatWeeks(companySimple.packages.basic.timeline.minWeeks, companySimple.packages.basic.timeline.maxWeeks)} alatt.` },
    { q: "Mennyibe kerül egy webshop?", a: `Egy egyszerű Shopify-webshop ${formatRon(rows[3].quote.packages.basic.finalPrice)}-tól; futár-, fizetés- és számlázó-integrációval ennél több. A Shopify havidíja külön, a Shopify felé fizetendő.` },
    { q: "Mennyi a havi költség?", a: `A tárhely egy céges oldalnál kb. ${formatRon(maintenance.hostingMonthly.company ?? 0)}/hó, a domain kb. ${formatRon(maintenance.domainYearly)}/év. A karbantartás nem kötelező: ${formatRon(maintenance.support.basic.monthly)}/hótól.` },
  ];

  const h2 = { fontSize: { xs: "1.6rem", md: "2rem" }, mt: 6, mb: 2 } as const;
  const p = { mb: 2, fontSize: "1.0625rem", lineHeight: 1.7 } as const;

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Article", headline: title, description, inLanguage: "hu", datePublished: "2026-10-29", dateModified: "2026-10-29", url: `${siteUrl}/mennyibe-kerul-egy-weboldal`, author: { "@id": `${siteUrl}/#business` }, publisher: { "@id": `${siteUrl}/#business` } },
            { "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
          ],
        }}
      />
      <Box sx={{ background: palette.ink, color: "#fff" }}>
        <SiteHeader />
        <Container maxWidth="md" component="header" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 7, md: 9 } }}>
          <Typography variant="overline" sx={{ color: palette.inkMuted }}>
            Frissítve: 2026. október · élő árakkal
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: "2.1rem", md: "3.25rem" }, mt: 1 }}>
            {title}
          </Typography>
        </Container>
      </Box>
      <WaveDivider from={palette.ink} to={palette.paper} />

      <Container maxWidth="md" component="main" sx={{ flex: 1, py: { xs: 5, md: 7 } }}>
        {/* Short answer first – what people (and Google) look for. */}
        <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, background: palette.surface, border: 1, borderColor: "divider", mb: 4 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Röviden</Typography>
          <Typography sx={{ lineHeight: 1.7 }}>{short}.</Typography>
        </Box>

        <Typography sx={p}>
          Weboldalt ma Erdélyben néhány száz lejtől több tízezer lejig lehet készíttetni – a különbség a terjedelemben, a design egyediségében és a funkciókban van. Az
          alábbi árak nem becslések a semmiből: ugyanazzal az árazással számoltuk őket, amellyel a{" "}
          <Link href="/tervezo">3 perces kérdőívünk</Link> is dolgozik.
        </Typography>

        <Typography variant="h2" sx={h2}>
          Árak csomagonként
        </Typography>
        <Box sx={{ overflowX: "auto", mb: 1.5 }}>
          <Box component="table" sx={{ width: "100%", minWidth: 560, borderCollapse: "collapse", "& th, & td": { textAlign: "left", py: 1.25, pr: 2, borderBottom: `1px solid ${palette.line}`, verticalAlign: "top" }, "& th": { fontSize: 13, color: palette.muted, fontWeight: 600 } }}>
            <thead>
              <tr>
                <th>Projekt</th>
                {PACKAGE_IDS.map((pid) => (
                  <th key={pid}>{pricingConfig.packages[pid].name}</th>
                ))}
                <th>Átfutás</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <td>
                    <Link href={`/${serviceByType(row.type).slug}`} style={{ fontWeight: 650, color: palette.ink }}>
                      {row.name}
                    </Link>
                    <Typography variant="body2" color="text.secondary">
                      {row.note}
                    </Typography>
                  </td>
                  {PACKAGE_IDS.map((pid) => (
                    <td key={pid} style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                      {formatRon(row.quote.packages[pid].finalPrice)}
                    </td>
                  ))}
                  <td style={{ whiteSpace: "nowrap" }}>{weeks(row.quote)}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Az árak a gyors döntés kedvezménnyel értendők (−{quickPercent}%, ha az ajánlat elkészülte után 1 órán belül egyeztetést kérsz). Kedvezmény nélkül például az
          egyszerű bemutatkozó oldal {formatRon(companySimple.packages.basic.listPrice)}. Egyszeri díjak, végső árak.
        </Typography>

        <Typography variant="h2" sx={h2}>
          Mitől függ az ár?
        </Typography>
        {[
          ["Az oldalak száma", "Egy 5 oldalas bemutatkozó és egy 20 oldalas céges oldal között a fejlesztési munka többszöröse a különbség."],
          ["A design", "A sablonalapú design a legolcsóbb, a testreszabott kb. harmadával, a teljesen egyedi akár 70%-kal többe kerül – cserébe jobban kiemel a versenytársak közül."],
          ["A funkciók", "Időpontfoglalás, blog, hírlevél, többnyelvűség, fizetés: ezek egyenként adódnak hozzá. Webshopnál a futár- és számlázó-integráció a legnagyobb tétel."],
          ["A tartalom", "Ha a szövegeket és képeket te adod, olcsóbb. Szövegírás és képszerkesztés külön tétel."],
          ["A határidő", `A sürgős munka drágább (akár +${Math.round((flexibility.maxMultiplier - 1) * 100)}%), a rugalmas határidő olcsóbb (akár −${flexibleDiscount}%).`],
        ].map(([heading, text]) => (
          <Box key={heading} sx={{ mb: 2 }}>
            <Typography variant="h3" sx={{ fontSize: "1.15rem", mb: 0.5 }}>
              {heading}
            </Typography>
            <Typography sx={p}>{text}</Typography>
          </Box>
        ))}

        <Typography variant="h2" sx={h2}>
          Havi költségek – amire előre számíts
        </Typography>
        <Typography sx={p}>
          Egy céges weboldal tárhelye kb. {formatRon(maintenance.hostingMonthly.company ?? 0)}/hó, a domain kb. {formatRon(maintenance.domainYearly)}/év. Webshopnál a Shopify
          előfizetése kb. {formatRon(maintenance.hostingMonthly.webshop ?? 0)}/hó, ezt a Shopify felé fizeted. Karbantartás (frissítések, mentések, kisebb módosítások) nem
          kötelező, {formatRon(maintenance.support.basic.monthly)}/hótól.
        </Typography>

        <Typography variant="h2" sx={h2}>
          Hogyan spórolhatsz?
        </Typography>
        <Box component="ul" sx={{ pl: 2.5, "& li": { mb: 1, fontSize: "1.0625rem", lineHeight: 1.7 } }}>
          <li>Adj rugalmas határidőt – akár −{flexibleDiscount}%.</li>
          <li>Hozd a saját szövegeidet és képeidet.</li>
          <li>Kezdj kisebb csomaggal, és bővíts később – modern alapra építünk, ez bármikor megy.</li>
          <li>Ha gyorsan döntesz, az ajánlat után 1 órán belül −{quickPercent}% kedvezmény jár.</li>
        </Box>

        <Typography variant="h2" sx={h2}>
          Gyakori kérdések
        </Typography>
        {faq.map((item) => (
          <Box key={item.q} sx={{ mb: 2.5 }}>
            <Typography variant="h3" sx={{ fontSize: "1.15rem", mb: 0.5 }}>
              {item.q}
            </Typography>
            <Typography sx={p}>{item.a}</Typography>
          </Box>
        ))}

        <Box sx={{ mt: 6, p: { xs: 3, md: 4 }, borderRadius: 4, background: palette.ink, color: "#fff" }}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "1.9rem" }, mb: 1 }}>
            A te weboldalad mennyibe kerülne?
          </Typography>
          <Typography sx={{ color: palette.inkMuted, mb: 2.5 }}>Válaszolj pár kérdésre, és 3 perc alatt tételes árajánlatot kapsz – ingyen, regisztráció nélkül.</Typography>
          <LinkButton href="/tervezo" variant="contained" size="large">
            Kiszámolom
          </LinkButton>
        </Box>
      </Container>
      <WhatsAppFab context="árak" />
      <SiteFooter />
    </Box>
  );
}

function weeks(quote: Quote) {
  const basic = quote.packages.basic.timeline;
  const premium = quote.packages.premium.timeline;
  return formatWeeks(basic.minWeeks, premium.maxWeeks);
}
