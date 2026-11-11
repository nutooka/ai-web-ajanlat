import type { MetadataRoute } from "next";
import { services } from "@/config/services";
import { siteUrl } from "@/config/site";

/** Last real content change per page – bump the one you edit (search and AI crawlers use it for freshness). */
const UPDATED = {
  home: new Date("2026-11-11"),
  services: new Date("2026-11-10"),
  article: new Date("2026-11-10"),
  maintenance: new Date("2026-11-11"),
  audit: new Date("2026-11-10"),
  planner: new Date("2026-11-10"),
  privacy: new Date("2026-11-10"),
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: UPDATED.home, changeFrequency: "weekly", priority: 1 },
    ...services.map((service) => ({ url: `${siteUrl}/${service.slug}`, lastModified: UPDATED.services, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${siteUrl}/mennyibe-kerul-egy-weboldal`, lastModified: UPDATED.article, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/karbantartas`, lastModified: UPDATED.maintenance, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/atvilagitas`, lastModified: UPDATED.audit, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/tervezo`, lastModified: UPDATED.planner, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/adatkezeles`, lastModified: UPDATED.privacy, changeFrequency: "yearly", priority: 0.2 },
  ];
}
