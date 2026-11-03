import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// AI crawlers are welcome: being quoted by AI assistants is part of the AI SEO strategy.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
