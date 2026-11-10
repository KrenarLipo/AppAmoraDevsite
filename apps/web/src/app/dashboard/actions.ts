"use server";

import { getDb, Prisma } from "@appamora/db";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import type { TemplateId } from "@/lib/catalog";
import { recordActivity } from "@/lib/activity";
import { requireClient, type ClientContext } from "@/lib/client";
import { deleteImage, storeImage, type StoredImage } from "@/lib/media";
import {
  CONTACT_SLUG,
  HOME_SLUG,
  PAGE_SLUG_PATTERN,
  pageTextsSchema,
  siteContentSchema,
  type SiteContent,
} from "@/lib/sites/content";
import { siteTag } from "@/lib/sites/public";
import { templateOrder, themes } from "@/lib/sites/templates";

export type Result = { ok: true } | { ok: false; error: string };

const LOCKED: { ok: false; error: string } = { ok: false, error: "Your free trial has ended. Choose a plan in Billing to keep editing." };

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form.";
}

/** Validates and stores new site content, then refreshes the public site. */
async function writeContent(ctx: ClientContext, content: SiteContent): Promise<Result> {
  const parsed = siteContentSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  await getDb().site.update({ where: { id: ctx.site.id }, data: { content: parsed.data as unknown as Prisma.InputJsonValue } });
  updateTag(siteTag(ctx.client.slug));
  refresh();
  return { ok: true };
}

function done(ctx: ClientContext): Result {
  updateTag(siteTag(ctx.client.slug));
  refresh();
  return { ok: true };
}

// ─── Images ─────────────────────────────────────────────────────────────────

export type UploadResult = { ok: true; image: StoredImage } | { ok: false; error: string };

/** Stores an image for the logo, the slideshow or a page. It's used once the form is saved. */
export async function uploadSiteImage(kind: "logo" | "slide" | "page", formData: FormData): Promise<UploadResult> {
  const ctx = await requireClient();
  if (ctx.locked && kind !== "logo") return LOCKED;
  if (kind === "slide" && !ctx.limits.slideshow) return { ok: false, error: "The slideshow is part of the Starter and Pro plans." };
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose an image first." };
  try {
    const image = await storeImage(file, kind === "logo" ? "logo" : kind === "slide" ? "hero" : "blogCover");
    return { ok: true, image };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Upload failed." };
  }
}

// ─── Design: template, brand, colors, fonts ─────────────────────────────────

const designSchema = z.object({
  template: z.enum(templateOrder as [TemplateId, ...TemplateId[]]),
  brandName: siteContentSchema.shape.brandName,
  logo: siteContentSchema.shape.logo,
  colors: siteContentSchema.shape.colors,
  fonts: siteContentSchema.shape.fonts,
});

export async function saveDesign(input: unknown): Promise<Result> {
  const ctx = await requireClient();
  const parsed = designSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const design = parsed.data;
  const current = ctx.site.content;

  // A locked account can still change its name and logo; everything else stays as it was.
  const next: SiteContent = ctx.locked
    ? { ...current, brandName: design.brandName, logo: design.logo }
    : {
        ...current,
        brandName: design.brandName,
        logo: design.logo,
        colors: ctx.limits.design ? design.colors : current.colors,
        fonts: ctx.limits.design ? design.fonts : current.fonts,
      };

  let template = ctx.site.template;
  if (!ctx.locked && design.template !== template) {
    if (templateOrder.indexOf(design.template) >= ctx.limits.templates) {
      return { ok: false, error: "This template is part of the Starter and Pro plans." };
    }
    template = design.template;
  }

  const result = await writeContent(ctx, next);
  if (!result.ok) return result;
  if (template !== ctx.site.template) {
    await getDb().site.update({ where: { id: ctx.site.id }, data: { template } });
  }
  if (current.logo && current.logo.id !== next.logo?.id) await deleteImage(current.logo.id);

  const changes = [
    template !== ctx.site.template && `Changed the template to ${themes[template].name}`,
    next.brandName !== current.brandName && `Renamed the website to “${next.brandName}”`,
    next.logo?.id !== current.logo?.id && (next.logo ? "Changed the logo" : "Removed the logo"),
    JSON.stringify(next.colors) !== JSON.stringify(current.colors) && "Changed the colors",
    JSON.stringify(next.fonts) !== JSON.stringify(current.fonts) && "Changed the fonts",
  ].filter((c): c is string => Boolean(c));
  for (const change of changes) await recordActivity(ctx, "design", change);
  return done(ctx);
}

// ─── Home page: hero, slideshow, subscriber box ─────────────────────────────

const homeSchema = z.object({
  hero: siteContentSchema.shape.hero,
  slideshow: siteContentSchema.shape.slideshow,
  subscribe: siteContentSchema.shape.subscribe,
  highlights: siteContentSchema.shape.highlights,
  introImage: siteContentSchema.shape.introImage,
  cta: siteContentSchema.shape.cta,
});

export async function saveHome(input: unknown): Promise<Result> {
  const ctx = await requireClient();
  if (ctx.locked) return LOCKED;
  const parsed = homeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const current = ctx.site.content;
  const next: SiteContent = {
    ...current,
    hero: parsed.data.hero,
    slideshow: ctx.limits.slideshow ? parsed.data.slideshow : current.slideshow,
    subscribe: { ...parsed.data.subscribe, enabled: ctx.limits.subscribers && parsed.data.subscribe.enabled },
    highlights: parsed.data.highlights,
    introImage: ctx.limits.slideshow ? parsed.data.introImage : current.introImage,
    cta: parsed.data.cta,
  };
  const result = await writeContent(ctx, next);
  if (result.ok) {
    await recordActivity(ctx, "home", "Edited the home page");
    const kept = new Set(next.slideshow.map((s) => s.id));
    for (const old of current.slideshow) if (!kept.has(old.id)) await deleteImage(old.id);
    if (current.introImage && current.introImage.id !== next.introImage?.id) await deleteImage(current.introImage.id);
  }
  return result;
}

// ─── Contact details, social links, languages ───────────────────────────────

const detailsSchema = z.object({
  contact: siteContentSchema.shape.contact,
  social: siteContentSchema.shape.social,
  languages: siteContentSchema.shape.languages,
  defaultLanguage: siteContentSchema.shape.defaultLanguage,
});

export async function saveDetails(input: unknown): Promise<Result> {
  const ctx = await requireClient();
  if (ctx.locked) return LOCKED;
  const parsed = detailsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { languages, defaultLanguage } = parsed.data;
  if (languages.length > ctx.limits.languages) {
    return {
      ok: false,
      error: `Your plan includes ${ctx.limits.languages} ${ctx.limits.languages === 1 ? "language" : "languages"}. Upgrade to add more.`,
    };
  }
  if (!languages.includes(defaultLanguage)) return { ok: false, error: "The main language must be one of the chosen languages." };
  const result = await writeContent(ctx, { ...ctx.site.content, ...parsed.data, languages: [...new Set(languages)] });
  if (result.ok) await recordActivity(ctx, "details", "Updated contact details and languages");
  return result;
}

// ─── Pages ──────────────────────────────────────────────────────────────────

const pageSchema = z.object({
  id: z.string().nullable(),
  slug: z.string().trim().max(60),
  showInMenu: z.boolean(),
  translations: pageTextsSchema,
});

export async function savePage(input: unknown): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const ctx = await requireClient();
  if (ctx.locked) return LOCKED;
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const page = parsed.data;
  const db = getDb();
  const main = ctx.site.content.defaultLanguage;
  if (!page.translations[main].title) return { ok: false, error: "Add a title in your main language." };

  const existing = page.id ? await db.sitePage.findFirst({ where: { id: page.id, siteId: ctx.site.id } }) : null;
  if (page.id && !existing) return { ok: false, error: "This page was deleted." };

  // The home and contact pages keep their addresses.
  const fixed = existing && (existing.slug === HOME_SLUG || existing.slug === CONTACT_SLUG);
  const slug = fixed ? existing.slug : page.slug;
  if (!fixed && !PAGE_SLUG_PATTERN.test(slug)) return { ok: false, error: "Web address: use lowercase letters, numbers and dashes." };
  if (!fixed && (slug === CONTACT_SLUG || /^(en|it|sq|de|fr)$/.test(slug))) return { ok: false, error: "This web address is reserved. Choose another." };

  const translations = page.translations as unknown as Prisma.InputJsonValue;
  try {
    if (existing) {
      await db.sitePage.update({
        where: { id: existing.id },
        data: { slug, showInMenu: existing.slug === HOME_SLUG ? true : page.showInMenu, translations },
      });
      await recordActivity(ctx, "pages", `Edited the page “${page.translations[main].title}”`);
      done(ctx);
      return { ok: true, id: existing.id };
    }
    const count = await db.sitePage.count({ where: { siteId: ctx.site.id } });
    if (count >= ctx.limits.pages) {
      return { ok: false, error: `Your plan includes ${ctx.limits.pages} pages. Upgrade to add more.` };
    }
    const created = await db.sitePage.create({
      data: { siteId: ctx.site.id, slug, showInMenu: page.showInMenu, position: count, translations },
    });
    await recordActivity(ctx, "pages", `Added the page “${page.translations[main].title}”`);
    done(ctx);
    return { ok: true, id: created.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "Another page already uses this web address." };
    }
    throw error;
  }
}

export async function deletePage(id: string): Promise<Result> {
  const ctx = await requireClient();
  if (ctx.locked) return LOCKED;
  const db = getDb();
  const page = await db.sitePage.findFirst({ where: { id, siteId: ctx.site.id } });
  if (!page) return { ok: true };
  if (page.slug === HOME_SLUG) return { ok: false, error: "The home page can't be deleted." };
  await db.sitePage.delete({ where: { id } });
  const title = (page.translations as Record<string, { title?: string }>)[ctx.site.content.defaultLanguage]?.title ?? page.slug;
  await recordActivity(ctx, "pages", `Deleted the page “${title}”`);
  return done(ctx);
}

export async function movePage(id: string, direction: -1 | 1): Promise<Result> {
  const ctx = await requireClient();
  if (ctx.locked) return LOCKED;
  const db = getDb();
  const pages = await db.sitePage.findMany({ where: { siteId: ctx.site.id }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
  const index = pages.findIndex((p) => p.id === id);
  const target = index + direction;
  // The home page always stays first.
  if (index < 1 || target < 1 || target >= pages.length) return { ok: true };
  const order = [...pages];
  [order[index], order[target]] = [order[target]!, order[index]!];
  await db.$transaction(order.map((p, position) => db.sitePage.update({ where: { id: p.id }, data: { position } })));
  await recordActivity(ctx, "pages", "Reordered the menu");
  return done(ctx);
}

// ─── Messages and subscribers ───────────────────────────────────────────────

export async function setMessageRead(id: string, read: boolean) {
  const ctx = await requireClient();
  await getDb().siteMessage.updateMany({ where: { id, siteId: ctx.site.id }, data: { read } });
  refresh();
}

export async function deleteMessage(id: string) {
  const ctx = await requireClient();
  await getDb().siteMessage.deleteMany({ where: { id, siteId: ctx.site.id } });
  refresh();
}

export async function deleteSubscriber(id: string) {
  const ctx = await requireClient();
  await getDb().subscriber.deleteMany({ where: { id, siteId: ctx.site.id } });
  refresh();
}
