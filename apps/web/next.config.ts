import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: ["@appamora/db"],
  serverExternalPackages: ["sharp"],
  images: {
    // Only uploaded media is optimized by next/image.
    localPatterns: [{ pathname: "/media/**", search: "" }],
  },
  experimental: {
    serverActions: {
      // Image uploads are shrunk in the browser first; this leaves room under Vercel's 4.5 MB request cap.
      bodySizeLimit: "4mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
