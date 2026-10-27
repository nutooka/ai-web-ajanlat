import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/tervezo`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/adatkezeles`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
