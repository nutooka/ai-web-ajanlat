import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Image files and the image optimizer tell search engines not to index them (no Google Images).
  // The share image (/opengraph-image) is left alone: Facebook and others still need it.
  headers() {
    const noIndex = [{ key: "X-Robots-Tag", value: "noindex, noimageindex" }];
    return [
      { source: "/references/:path*", headers: noIndex },
      { source: "/_next/image", headers: noIndex },
    ];
  },
};

export default nextConfig;
