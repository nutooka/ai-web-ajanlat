import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // The personal offer page and the API are not for search results.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ajanlat"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
