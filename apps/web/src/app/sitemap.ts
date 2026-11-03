import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { localePath } from "@/i18n/utils";
import { getAllSlugs, getPost } from "@/lib/blog";
import { serviceSlugs } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

const staticPaths = ["/", "/services", "/templates", "/pricing", "/blog", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: { path: string; lastModified?: string }[] = [
    ...staticPaths.map((path) => ({ path })),
    ...serviceSlugs.map((slug) => ({ path: `/services/${slug}` })),
    ...getAllSlugs().map((slug) => ({ path: `/blog/${slug}`, lastModified: getPost("en", slug)?.date })),
  ];

  return paths.flatMap(({ path, lastModified }) =>
    locales.map((locale) => ({
      url: `${siteConfig.url}${localePath(locale, path)}`,
      ...(lastModified && { lastModified }),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${siteConfig.url}${localePath(l, path)}`])),
      },
    })),
  );
}
