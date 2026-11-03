import type { Metadata } from "next";
import { defaultLocale, locales, ogLocales, type Locale } from "@/i18n/config";
import { localePath } from "@/i18n/utils";
import { getSiteImages } from "./settings";
import { mediaUrl, type ImageRef } from "./settings/schema";
import { siteConfig } from "./site";

type PageMeta = {
  locale: Locale;
  /** Path without the locale prefix, e.g. "/pricing". */
  path: string;
  title?: string;
  description: string;
  type?: "website" | "article";
  /** Preview image for shared links; defaults to the social image set in the admin. */
  image?: ImageRef;
};

/** Canonical URL, hreflang alternates and Open Graph for one localized page. */
export async function pageMetadata({ locale, path, title, description, type = "website", image }: PageMeta): Promise<Metadata> {
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, localePath(l, path)]));
  languages["x-default"] = localePath(defaultLocale, path);

  const preview = image ?? (await getSiteImages()).social;
  const images = preview ? [{ url: mediaUrl(preview), width: preview.width, height: preview.height }] : undefined;

  return {
    ...(title && { title }),
    description,
    alternates: { canonical: localePath(locale, path), languages },
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: ogLocales[locale],
      url: localePath(locale, path),
      ...(title && { title }),
      description,
      ...(images && { images }),
    },
    ...(images && { twitter: { card: "summary_large_image", images: images.map((i) => i.url) } }),
  };
}

/** Renders a JSON-LD block for search engines and AI crawlers. */
export function jsonLd(data: Record<string, unknown>) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
