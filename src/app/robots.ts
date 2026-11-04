import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Personal and shared offers and the API are not for search results.
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/ajanlat", "/a/"] },
      // Our images stay out of Google Images (the owner's choice); pages are still indexed normally.
      { userAgent: "Googlebot-Image", disallow: "/" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
