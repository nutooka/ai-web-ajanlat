import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeRegistry } from "@/components/ThemeRegistry";
import { siteConfig } from "@/config/site";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${siteConfig.name} – azonnali weboldal-árajánlat`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.tagline,
  openGraph: { title: siteConfig.name, description: siteConfig.tagline, locale: "hu_HU", type: "website" },
};

export const viewport: Viewport = { themeColor: "#F6F6F3" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu" className={`${display.variable} ${body.variable}`}>
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>{children}</ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
