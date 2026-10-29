import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Personal and shared offers and the API are not for search results.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ajanlat", "/a/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
