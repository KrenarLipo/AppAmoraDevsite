import { getDb } from "@appamora/db";
import { cacheLife, cacheTag } from "next/cache";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { readingMinutes, renderMarkdown } from "./markdown";
import { imageRefSchema, type ImageRef } from "./settings/schema";

// Posts are stored in the database and edited at /admin/blog. A post that has no
// translation for the current locale falls back to the English version.

/** Saving a post calls updateTag(BLOG_TAG), so the blog updates on the next request. */
export const BLOG_TAG = "blog";

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, e.g. "2026-11-03". */
  date: string;
  tag: string;
  readingMinutes: number;
  /** Locale the post is actually written in (differs from the page locale on fallback). */
  locale: Locale;
  cover: ImageRef;
};

export type Post = PostMeta & { html: string };

type Row = {
  slug: string;
  publishedAt: Date;
  tag: string;
  cover: unknown;
  translations: { locale: string; title: string; description: string; body: string }[];
};

function toMeta(row: Row, locale: Locale): (PostMeta & { body: string }) | null {
  const text =
    row.translations.find((t) => t.locale === locale) ?? row.translations.find((t) => t.locale === defaultLocale);
  if (!text || !hasLocale(text.locale)) return null;
  const cover = imageRefSchema.safeParse(row.cover ?? null);
  return {
    slug: row.slug,
    title: text.title,
    description: text.description,
    date: row.publishedAt.toISOString().slice(0, 10),
    tag: row.tag,
    readingMinutes: readingMinutes(text.body),
    locale: text.locale,
    cover: cover.success ? cover.data : null,
    body: text.body,
  };
}

const rowSelect = {
  slug: true,
  publishedAt: true,
  tag: true,
  cover: true,
  translations: { select: { locale: true, title: true, description: true, body: true } },
} as const;

/** All published posts, newest first, with every translation. Cached until a post is saved. */
async function publishedRows(): Promise<Row[]> {
  "use cache";
  cacheTag(BLOG_TAG);
  try {
    const rows = await getDb().blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: rowSelect,
    });
    cacheLife("max");
    return rows;
  } catch (error) {
    // No database (e.g. a build without DATABASE_URL): show no posts, but retry soon.
    console.error("Could not read the blog posts", error);
    cacheLife("minutes");
    return [];
  }
}

export async function getPublishedSlugs(): Promise<string[]> {
  return (await publishedRows()).map((row) => row.slug);
}

/**
 * One published post. Cached per slug (not taken from the full list), so a post published
 * after the build is read fresh on its first visit instead of from the build's cached list.
 */
async function publishedRow(slug: string): Promise<Row | null> {
  "use cache";
  cacheTag(BLOG_TAG);
  try {
    const row = await getDb().blogPost.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: rowSelect,
    });
    cacheLife("max");
    return row;
  } catch (error) {
    console.error(`Could not read the blog post "${slug}"`, error);
    cacheLife("minutes");
    return null;
  }
}

export async function getPost(locale: Locale, slug: string): Promise<Post | null> {
  const row = await publishedRow(slug);
  const post = row && toMeta(row, locale);
  if (!post) return null;
  const { body, ...meta } = post;
  return { ...meta, html: renderMarkdown(body) };
}

/** Published posts for a locale, newest first. */
export async function getPosts(locale: Locale): Promise<PostMeta[]> {
  return (await publishedRows())
    .map((row) => toMeta(row, locale))
    .filter((post) => post !== null)
    .map(({ body: _body, ...meta }) => meta);
}

export function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(date),
  );
}
