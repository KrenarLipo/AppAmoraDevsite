import { getDb } from "@appamora/db";
import { z } from "zod";
import { locales, type Locale } from "@/i18n/config";
import { imageRefSchema, type ImageRef } from "./settings/schema";

// Uncached reads and validation for the blog editor at /admin/blog.

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const translationSchema = z.object({
  title: z.string().trim().max(160, "Title can be at most 160 characters"),
  description: z.string().trim().max(300, "Summary can be at most 300 characters"),
  body: z.string().max(100_000, "The text is too long"),
});
export type PostTranslation = z.infer<typeof translationSchema>;

export const postInputSchema = z
  .object({
    id: z.string().nullable(),
    slug: z
      .string()
      .trim()
      .min(1, "Add a web address")
      .max(80, "Web address can be at most 80 characters")
      .regex(SLUG_PATTERN, "Use only lowercase letters, numbers and dashes in the web address"),
    status: z.enum(["DRAFT", "PUBLISHED"]),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    tag: z.string().trim().max(40, "Tag can be at most 40 characters"),
    cover: imageRefSchema,
    translations: z.object({ en: translationSchema, it: translationSchema, sq: translationSchema }),
  })
  .superRefine((post, ctx) => {
    for (const locale of locales) {
      const { title, body } = post.translations[locale];
      const name = { en: "English", it: "Italian", sq: "Albanian" }[locale];
      const hasTitle = title.length > 0;
      const hasBody = body.trim().length > 0;
      // English is required. Italian and Albanian are optional, but if started they need both.
      if (locale === "en" || hasTitle || hasBody) {
        if (!hasTitle) ctx.addIssue({ code: "custom", path: ["translations", locale, "title"], message: `${name}: add a title` });
        if (!hasBody) ctx.addIssue({ code: "custom", path: ["translations", locale, "body"], message: `${name}: write the post text` });
      }
    }
  });
export type PostInput = z.infer<typeof postInputSchema>;

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  date: string;
  tag: string;
  languages: Locale[];
  cover: ImageRef;
  updatedAt: Date;
};

function parseCover(value: unknown): ImageRef {
  const parsed = imageRefSchema.safeParse(value ?? null);
  return parsed.success ? parsed.data : null;
}

export async function readAllPostsForEdit(): Promise<PostListItem[]> {
  const rows = await getDb().blogPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { translations: { select: { locale: true, title: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.translations.find((t) => t.locale === "en")?.title ?? row.slug,
    status: row.status,
    date: row.publishedAt.toISOString().slice(0, 10),
    tag: row.tag,
    languages: locales.filter((l) => row.translations.some((t) => t.locale === l)),
    cover: parseCover(row.cover),
    updatedAt: row.updatedAt,
  }));
}

const emptyTranslation: PostTranslation = { title: "", description: "", body: "" };

export function emptyPost(): PostInput {
  return {
    id: null,
    slug: "",
    status: "DRAFT",
    date: new Date().toISOString().slice(0, 10),
    tag: "",
    cover: null,
    translations: { en: { ...emptyTranslation }, it: { ...emptyTranslation }, sq: { ...emptyTranslation } },
  };
}

export async function readPostForEdit(id: string): Promise<PostInput | null> {
  const row = await getDb().blogPost.findUnique({ where: { id }, include: { translations: true } });
  if (!row) return null;
  const translation = (locale: Locale): PostTranslation => {
    const t = row.translations.find((tr) => tr.locale === locale);
    return t ? { title: t.title, description: t.description, body: t.body } : { ...emptyTranslation };
  };
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    date: row.publishedAt.toISOString().slice(0, 10),
    tag: row.tag,
    cover: parseCover(row.cover),
    translations: { en: translation("en"), it: translation("it"), sq: translation("sq") },
  };
}

/** Media ids used as images inside markdown, e.g. ![](/media/abc123). */
export function mediaIdsIn(markdown: string): string[] {
  return [...markdown.matchAll(/\/media\/([a-z0-9]+)/gi)].map((m) => m[1]);
}
