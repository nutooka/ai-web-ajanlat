import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { preload } from "react-dom";
import { EmotionRegistry } from "@/components/EmotionRegistry";
import { ThemeRegistry } from "@/components/ThemeRegistry";
import { JsonLd } from "@/components/JsonLd";
import { baseOpenGraph, siteConfig, siteUrl } from "@/config/site";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Weboldal készítés azonnali árajánlattal | Nutooka", template: "%s | Nutooka" },
  description: siteConfig.tagline,
  applicationName: "Nutooka",
  openGraph: { ...baseOpenGraph, title: "Weboldal készítés azonnali árajánlattal", description: siteConfig.tagline },
  twitter: { card: "summary_large_image" },
  // Pages are indexed, their images are not (no Google Images results).
  robots: { index: true, follow: true, noimageindex: true },
};

export const viewport: Viewport = { themeColor: "#0E0F12" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Start fetching the analytics script early. It also makes the measurement visible in the HTML (site audits look for it).
  if (process.env.VERCEL) preload("/_vercel/insights/script.js", { as: "script", fetchPriority: "low" });
  return (
    <html lang="hu" className={`${display.variable} ${body.variable}`}>
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body> before React loads. */}
      <body suppressHydrationWarning>
        {/* The business node on every page, so `provider: { "@id": …/#business }` resolves everywhere. The home page adds the full details. */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "@id": `${siteUrl}/#business`,
            name: "Nutooka",
            legalName: siteConfig.company.legalName,
            url: siteUrl,
            telephone: siteConfig.chat.whatsapp ? `+${siteConfig.chat.whatsapp}` : undefined,
            address: { "@type": "PostalAddress", ...siteConfig.company.postalAddress },
            areaServed: siteConfig.company.areaServed.map((name) => ({ "@type": "Place", name })),
          }}
        />
        <EmotionRegistry>
          <ThemeRegistry>{children}</ThemeRegistry>
        </EmotionRegistry>
        <Analytics />
      </body>
    </html>
  );
}
