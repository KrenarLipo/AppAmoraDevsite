import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { defaultLocale, type Locale } from "@/i18n/config";

// Posts live in content/blog/<locale>/<slug>.md. A post that has no translation
// for the current locale falls back to the English version.
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tag: string;
  readingMinutes: number;
  /** Locale the post is actually written in (differs from the page locale on fallback). */
  locale: Locale;
};

export type Post = PostMeta & { html: string };

function slugsIn(locale: Locale): string[] {
  const dir = path.join(BLOG_DIR, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.slice(0, -3));
}

function readPost(locale: Locale, slug: string): Post | null {
  const file = path.join(BLOG_DIR, locale, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const words = content.trim().split(/\s+/).length;
  return {
    slug,
    title: String(data.title),
    description: String(data.description ?? ""),
    date: String(data.date),
    tag: String(data.tag ?? ""),
    readingMinutes: Math.max(1, Math.round(words / 200)),
    locale,
    html: marked.parse(content, { async: false }),
  };
}

export function getAllSlugs(): string[] {
  return slugsIn(defaultLocale);
}

export function getPost(locale: Locale, slug: string): Post | null {
  return readPost(locale, slug) ?? readPost(defaultLocale, slug);
}

/** All posts for a locale, newest first. */
export function getPosts(locale: Locale): PostMeta[] {
  const slugs = new Set([...slugsIn(defaultLocale), ...slugsIn(locale)]);
  return [...slugs]
    .map((slug) => getPost(locale, slug))
    .filter((post): post is Post => post !== null)
    .map(({ html: _html, ...meta }) => meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(date),
  );
}
