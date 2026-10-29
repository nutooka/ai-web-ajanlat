import Check from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SectionBlob } from "@/components/SectionBlob";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WaveDivider } from "@/components/WaveDivider";
import { pricingConfig } from "@/config/pricing";
import { serviceByType, services } from "@/config/services";
import { siteConfig, siteUrl } from "@/config/site";
import { startingPrice } from "@/features/pricing/startingPrice";
import type { ResolvedProjectType } from "@/features/questionnaire/types";
import { formatRon } from "@/lib/format";
import { gradients, packageThemes, palette } from "@/theme/tokens";
import { StartPlannerButton } from "./StartPlannerButton";

const withPrice = (text: string, from: string) => text.replaceAll("{from}", from);

export function serviceMetadata(type: ResolvedProjectType): Metadata {
  const service = serviceByType(type);
  const from = formatRon(startingPrice(type));
  const title = withPrice(service.metaTitle, from);
  const description = withPrice(service.metaDescription, from);
  return {
    title: { absolute: `${title} | Nutooka` },
    description,
    alternates: { canonical: `/${service.slug}` },
    openGraph: { title, description, url: `/${service.slug}` },
  };
}

/** One service, its own search intent: what it is, what is in it, what moves the price, FAQ, and a start button. */
export function ServicePage({ type }: { type: ResolvedProjectType }) {
  const service = serviceByType(type);
  const fromPrice = startingPrice(type);
  const from = formatRon(fromPrice);
  const baseItems = pricingConfig.baseItems[type].map((item) => item.label);
  const others = services.filter((other) => other.type !== type);
  const url = `${siteUrl}/${service.slug}`;
  const quickPercent = pricingConfig.discounts.quickDecision.tiers[0]?.percent ?? 0;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.name,
        serviceType: service.name,
        description: withPrice(service.metaDescription, from),
        url,
        provider: { "@id": `${siteUrl}/#business` },
        areaServed: siteConfig.company.areaServed.map((name) => ({ "@type": "Place", name })),
        offers: { "@type": "Offer", priceCurrency: "RON", priceSpecification: { "@type": "PriceSpecification", minPrice: fromPrice, priceCurrency: "RON" } },
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: withPrice(item.a, from) } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Nutooka", item: siteUrl },
          { "@type": "ListItem", position: 2, name: service.name, item: url },
        ],
      },
    ],
  };

  const h2 = { fontSize: { xs: "1.75rem", md: "2.25rem" }, mb: 3 } as const;

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <JsonLd data={structuredData} />
      <Box sx={{ background: palette.ink, color: "#fff", position: "relative", overflow: "hidden" }}>
        <SiteHeader />
        <SectionBlob tone={type === "webshop" || type === "landing" ? "standard" : type === "webapp" ? "premium" : "basic"} position={{ top: 80, right: -140 }} />
        <Container maxWidth="lg" component="section" sx={{ position: "relative", zIndex: 1, pt: { xs: 5, md: 9 }, pb: { xs: 8, md: 11 } }}>
          <Box component="nav" aria-label="Morzsamenü" sx={{ mb: 2, fontSize: 14, color: palette.inkMuted }}>
            <Link href="/" style={{ color: "inherit" }}>
              Nutooka
            </Link>{" "}
            / {service.name}
          </Box>
          <Typography variant="h1" sx={{ maxWidth: 820, fontSize: { xs: "2.25rem", md: "3.75rem" } }}>
            {service.h1}
          </Typography>
          <Typography sx={{ mt: 3, maxWidth: 640, color: palette.inkMuted, fontSize: { xs: "1.0625rem", md: "1.25rem" }, lineHeight: 1.55 }}>
            {service.intro}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4, alignItems: { sm: "center" } }}>
            <StartPlannerButton projectType={type}>Kiszámolom az árat</StartPlannerButton>
            <Typography sx={{ color: "#fff", fontWeight: 650 }}>
              már{" "}
              <Box component="span" sx={{ px: 0.75, borderRadius: 1, background: gradients.brand, color: palette.ink }}>
                {from}-tól
              </Box>
            </Typography>
          </Stack>
        </Container>
      </Box>
      <WaveDivider from={palette.ink} to={palette.paper} />

      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 }, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 6, md: 8 } }}>
          <Box component="section">
            <Typography variant="h2" sx={h2}>
              Ami már a legegyszerűbb változatban benne van
            </Typography>
            <CheckList items={baseItems} color={packageThemes.basic.solid} />
          </Box>
          <Box component="section">
            <Typography variant="h2" sx={h2}>
              Kinek ajánljuk?
            </Typography>
            <CheckList items={service.forWhom} color={packageThemes.standard.solid} />
          </Box>
          <Box component="section">
            <Typography variant="h2" sx={h2}>
              Mitől függ az ár?
            </Typography>
            <CheckList items={service.priceFactors} color={packageThemes.premium.solid} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              A kérdőív mindegyiket tételesen beárazza, három csomagban (Basic, Standard, Premium).
            </Typography>
          </Box>
          <Box component="section">
            <Typography variant="h2" sx={h2}>
              Gyakori kérdések
            </Typography>
            {service.faq.map((item) => (
              <Box key={item.q} sx={{ mb: 2.5 }}>
                <Typography variant="h3" sx={{ fontSize: "1.125rem", mb: 0.5 }}>
                  {item.q}
                </Typography>
                <Typography color="text.secondary">{withPrice(item.a, from)}</Typography>
              </Box>
            ))}
          </Box>
        </Container>

        <Container maxWidth="lg" sx={{ pb: { xs: 7, md: 10 } }}>
          <Box
            sx={{
              borderRadius: 4,
              background: palette.ink,
              color: "#fff",
              p: { xs: 3, md: 5 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              alignItems: { md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
                Három perc, és tudod, mennyibe kerül.
              </Typography>
              <Typography sx={{ color: palette.inkMuted, mt: 1 }}>
                Ingyenes, nem kell regisztrálni.{quickPercent > 0 ? ` Gyors döntésnél akár −${quickPercent}% kedvezmény.` : ""}
              </Typography>
            </Box>
            <StartPlannerButton projectType={type}>Elkezdem a kérdőívet</StartPlannerButton>
          </Box>

          <Box component="nav" aria-label="További szolgáltatások" sx={{ mt: 5 }}>
            <Typography variant="overline" color="text.secondary">
              További szolgáltatások
            </Typography>
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1.5, mt: 1 }}>
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/${other.slug}`}
                  style={{
                    padding: "0 16px",
                    minHeight: 44,
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 999,
                    border: `1px solid ${palette.line}`,
                    color: palette.ink,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {other.name}
                </Link>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
      <SiteFooter />
    </Box>
  );
}

function CheckList({ items, color }: { items: string[]; color: string }) {
  return (
    <Stack component="ul" spacing={1.25} sx={{ listStyle: "none", p: 0, m: 0 }}>
      {items.map((item) => (
        <Stack key={item} component="li" direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
          <Check sx={{ fontSize: 20, mt: "2px", color }} />
          <Typography>{item}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}
