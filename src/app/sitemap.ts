import type { MetadataRoute } from "next";
import { services } from "@/config/services";
import { siteUrl } from "@/config/site";

/** Last content change – bump when page texts or prices change (search and AI crawlers use it for freshness). */
const UPDATED = new Date("2026-10-30");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: UPDATED, changeFrequency: "weekly", priority: 1 },
    ...services.map((service) => ({ url: `${siteUrl}/${service.slug}`, lastModified: UPDATED, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${siteUrl}/mennyibe-kerul-egy-weboldal`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/atvilagitas`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/tervezo`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/adatkezeles`, lastModified: UPDATED, changeFrequency: "yearly", priority: 0.2 },
  ];
}
