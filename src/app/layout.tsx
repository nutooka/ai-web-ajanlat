import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { preload } from "react-dom";
import { ThemeRegistry } from "@/components/ThemeRegistry";
import { siteConfig } from "@/config/site";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Weboldal készítés azonnali árajánlattal | Nutooka", template: "%s | Nutooka" },
  description: siteConfig.tagline,
  applicationName: "Nutooka",
  openGraph: { siteName: "Nutooka", title: "Weboldal készítés azonnali árajánlattal", description: siteConfig.tagline, locale: "hu_HU", type: "website" },
  twitter: { card: "summary_large_image" },
  // Pages are indexed, their images are not (no Google Images results).
  robots: { index: true, follow: true, noimageindex: true },
};

export const viewport: Viewport = { themeColor: "#0E0F12" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Start fetching the analytics script early. It also makes the measurement visible in the HTML (site audits look for it).
  if (process.env.VERCEL) preload("/_vercel/insights/script.js", { as: "script" });
  return (
    <html lang="hu" className={`${display.variable} ${body.variable}`}>
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body> before React loads. */}
      <body suppressHydrationWarning>
        <AppRouterCacheProvider>
          <ThemeRegistry>{children}</ThemeRegistry>
        </AppRouterCacheProvider>
        <Analytics />
      </body>
    </html>
  );
}
