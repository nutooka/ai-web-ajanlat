import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Image files and the image optimizer tell search engines not to index them (no Google Images).
  // The share image (/opengraph-image) is left alone: Facebook and others still need it.
  headers() {
    const noIndex = [{ key: "X-Robots-Tag", value: "noindex, noimageindex" }];
    // Basic security headers for every response. No full CSP: MUI/Next inline styles and scripts would need nonces.
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/references/:path*", headers: noIndex },
      { source: "/_next/image", headers: noIndex },
    ];
  },
};

export default nextConfig;
