import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { localePath } from "@/i18n/utils";
import { getPosts } from "@/lib/blog";
import { serviceSlugs } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

const staticPaths = ["/", "/services", "/templates", "/pricing", "/blog", "/about", "/contact", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths: { path: string; lastModified?: string }[] = [
    ...staticPaths.map((path) => ({ path })),
    ...serviceSlugs.map((slug) => ({ path: `/services/${slug}` })),
    ...(await getPosts("en")).map((post) => ({ path: `/blog/${post.slug}`, lastModified: post.date })),
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
