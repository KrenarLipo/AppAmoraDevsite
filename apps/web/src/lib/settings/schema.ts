import { z } from "zod";
import en from "@/i18n/dictionaries/en";
import it from "@/i18n/dictionaries/it";
import sq from "@/i18n/dictionaries/sq";
import { locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { localePath } from "@/i18n/utils";

// ─── Shapes ─────────────────────────────────────────────────────────────────

/** Text in every site language. English is required; empty translations fall back to it. */
const localized = z.object({
  en: z.string().trim().min(1).max(80),
  it: z.string().trim().max(80),
  sq: z.string().trim().max(80),
} satisfies Record<Locale, z.ZodString>);
export type Localized = z.infer<typeof localized>;

const optionalLocalized = z.object({
  en: z.string().trim().max(200),
  it: z.string().trim().max(200),
  sq: z.string().trim().max(200),
} satisfies Record<Locale, z.ZodString>);

/** A site path ("/pricing", localized automatically), an https:// link or a mailto: link. */
export const hrefSchema = z
  .string()
  .trim()
  .max(300)
  .refine((v) => /^\/(?!\/)/.test(v) || /^https:\/\/[^\s]+$/.test(v) || /^mailto:[^\s]+$/.test(v), {
    message: "Use a site path like /pricing, a full https:// link or a mailto: address.",
  });

const menuLink = z.object({
  id: z.string().min(1).max(64),
  label: localized,
  href: hrefSchema,
  visible: z.boolean(),
});
export type MenuLink = z.infer<typeof menuLink>;

const footerColumn = z.object({
  id: z.string().min(1).max(64),
  title: localized,
  links: z.array(menuLink).max(12),
});
export type FooterColumn = z.infer<typeof footerColumn>;

export const menusSchema = z.object({
  header: z.array(menuLink).max(10),
  footer: z.array(footerColumn).max(5),
});
export type Menus = z.infer<typeof menusSchema>;

const imageRef = z
  .object({
    id: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: optionalLocalized.optional(),
  })
  .nullable();
export type ImageRef = z.infer<typeof imageRef>;

export const imagesSchema = z.object({
  logo: imageRef.default(null),
  logoDark: imageRef.default(null),
  social: imageRef.default(null),
  hero: imageRef.default(null),
  about: imageRef.default(null),
  /** Blog cover images by post slug. */
  blogCovers: z.record(z.string(), imageRef).default({}),
});
export type SiteImages = z.infer<typeof imagesSchema>;

export const imageSlots = ["logo", "logoDark", "social", "hero", "about"] as const;
export type ImageSlot = (typeof imageSlots)[number];

// ─── Defaults: exactly what the site showed before menus became editable ────

const dictionaries: Record<Locale, Dictionary> = { en, it, sq };

function fromDictionaries(pick: (d: Dictionary) => string): Localized {
  return Object.fromEntries(locales.map((l) => [l, pick(dictionaries[l])])) as Localized;
}

function link(id: string, href: string, pick: (d: Dictionary) => string): MenuLink {
  return { id, href, label: fromDictionaries(pick), visible: true };
}

export const defaultMenus: Menus = {
  header: [
    link("services", "/services", (d) => d.nav.services),
    link("templates", "/templates", (d) => d.nav.templates),
    link("pricing", "/pricing", (d) => d.nav.pricing),
    link("blog", "/blog", (d) => d.nav.blog),
    link("about", "/about", (d) => d.nav.about),
    link("contact", "/contact", (d) => d.nav.contact),
  ],
  footer: [
    {
      id: "footer-services",
      title: fromDictionaries((d) => d.footer.services),
      links: [
        link("f-ai-agents", "/services/ai-agents", (d) => d.services.items["ai-agents"].name),
        link("f-vibe-coding", "/services/vibe-coding", (d) => d.services.items["vibe-coding"].name),
        link("f-ai-seo", "/services/ai-seo", (d) => d.services.items["ai-seo"].name),
      ],
    },
    {
      id: "footer-platform",
      title: fromDictionaries((d) => d.footer.platform),
      links: [
        link("f-templates", "/templates", (d) => d.nav.templates),
        link("f-pricing", "/pricing", (d) => d.nav.pricing),
      ],
    },
    {
      id: "footer-company",
      title: fromDictionaries((d) => d.footer.company),
      links: [
        link("f-about", "/about", (d) => d.nav.about),
        link("f-blog", "/blog", (d) => d.nav.blog),
        link("f-contact", "/contact", (d) => d.nav.contact),
      ],
    },
  ],
};

export const defaultImages: SiteImages = imagesSchema.parse({});

// ─── Helpers for rendering ──────────────────────────────────────────────────

/** The text for a locale, falling back to English when a translation is empty. */
export function localizedText(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value.en;
}

/** Turns a stored href into a real URL for the current locale. */
export function resolveHref(href: string, locale: Locale): { href: string; external: boolean } {
  if (href.startsWith("/")) return { href: localePath(locale, href), external: false };
  return { href, external: href.startsWith("https://") };
}

export function mediaUrl(image: NonNullable<ImageRef>): string {
  return `/media/${image.id}`;
}
