import type { MetadataRoute } from "next";
import { services } from "@/config/services";
import { siteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...services.map((service) => ({ url: `${siteUrl}/${service.slug}`, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${siteUrl}/tervezo`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/adatkezeles`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
