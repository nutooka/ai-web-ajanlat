import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { siteUrl, baseOpenGraph } from "@/config/site";
import { Wizard } from "@/features/questionnaire/components/Wizard";
import { PlannerIntro } from "./PlannerIntro";

const title = "Weboldal árkalkulátor – azonnali, tételes ár";
const description = "Válaszolj néhány kérdésre a weboldaladról, webshopodról vagy webalkalmazásodról, és azonnal tételes árajánlatot kapsz RON-ban, három csomagban.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tervezo" },
  openGraph: { ...baseOpenGraph, title, description, url: "/tervezo" },
};

export default function PlannerPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebApplication",
              name: "Weboldal árkalkulátor",
              description,
              url: `${siteUrl}/tervezo`,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              inLanguage: "hu",
              offers: { "@type": "Offer", price: 0, priceCurrency: "RON" },
              provider: { "@id": `${siteUrl}/#business` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Főoldal", item: siteUrl },
                { "@type": "ListItem", position: 2, name: "Árkalkulátor", item: `${siteUrl}/tervezo` },
              ],
            },
          ],
        }}
      />
      <Wizard />
      <PlannerIntro />
      <SiteFooter reserveStickyBar />
    </>
  );
}
