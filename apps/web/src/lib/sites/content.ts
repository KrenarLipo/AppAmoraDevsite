import { z } from "zod";
import type { TemplateId } from "@/lib/catalog";
import { imageRefSchema } from "@/lib/settings/schema";
import { siteLanguages, type SiteLanguage } from "./languages";
import { fontIds, heroDefaults, type FontId } from "./templates";

// The editable content of a client's site, stored as JSON on Site.content.

/** A text in each site language; empty means "not translated" and falls back to the default language. */
const texts = (max: number) =>
  z.object(Object.fromEntries(siteLanguages.map((l) => [l, z.string().trim().max(max)])) as Record<SiteLanguage, z.ZodString>);
export type Texts = Record<SiteLanguage, string>;

export const emptyTexts = (): Texts => ({ en: "", it: "", sq: "", de: "", fr: "" });

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a color like #D7381F");
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+\.[^\s]+$/.test(v), "Use a full link starting with https://");

export const siteContentSchema = z.object({
  brandName: z.string().trim().min(1, "Add your business name").max(80, "At most 80 characters"),
  logo: imageRefSchema,
  /** null = the template's own colors and fonts. */
  colors: z.object({ primary: hexColor.nullable(), background: hexColor.nullable() }),
  fonts: z.object({
    heading: z.enum(fontIds as [FontId, ...FontId[]]).nullable(),
    body: z.enum(fontIds as [FontId, ...FontId[]]).nullable(),
  }),
  hero: z.object({ headline: texts(140), text: texts(400), button: texts(40) }),
  slideshow: z.array(imageRefSchema.unwrap()).max(6, "At most 6 slideshow images"),
  contact: z.object({
    email: z.union([z.literal(""), z.email("Enter a valid email address")]),
    phone: z.string().trim().max(40),
    address: z.string().trim().max(200),
    hours: texts(300),
    /** Phone number for the WhatsApp chat button, digits only with country code. */
    whatsapp: z.string().trim().regex(/^(\+?\d{8,15})?$/, "Use the full number with country code, e.g. +355681234567"),
  }),
  social: z.object({ instagram: optionalUrl, tiktok: optionalUrl, facebook: optionalUrl }),
  languages: z.array(z.enum(siteLanguages)).min(1, "Choose at least one language"),
  defaultLanguage: z.enum(siteLanguages),
  subscribe: z.object({ enabled: z.boolean(), title: texts(120) }),
});
export type SiteContent = z.infer<typeof siteContentSchema>;

export function defaultSiteContent(brandName: string, template: TemplateId, language: SiteLanguage = "en"): SiteContent {
  const hero = heroDefaults[template];
  const fill = (index: 0 | 1): Texts => ({ ...emptyTexts(), en: hero.en[index], it: hero.it[index], sq: hero.sq[index] });
  return {
    brandName,
    logo: null,
    colors: { primary: null, background: null },
    fonts: { heading: null, body: null },
    hero: { headline: fill(0), text: fill(1), button: { ...emptyTexts(), en: "Contact us", it: "Contattaci", sq: "Na kontakto" } },
    slideshow: [],
    contact: { email: "", phone: "", address: "", hours: emptyTexts(), whatsapp: "" },
    social: { instagram: "", tiktok: "", facebook: "" },
    languages: [language],
    defaultLanguage: language,
    subscribe: {
      enabled: false,
      title: { ...emptyTexts(), en: "Get our news and offers", it: "Ricevi novità e offerte", sq: "Merr lajmet dhe ofertat tona" },
    },
  };
}

/** Reads stored content, filling anything missing from the defaults (older or partial data). */
export function parseSiteContent(value: unknown, brandName: string, template: TemplateId): SiteContent {
  const defaults = defaultSiteContent(brandName, template);
  const stored = (value && typeof value === "object" ? value : {}) as Partial<SiteContent>;
  const merged = { ...defaults, ...stored };
  const parsed = siteContentSchema.safeParse(merged);
  return parsed.success ? parsed.data : defaults;
}

/** The text in `language`, else in the site's default language, else English. */
export function pick(texts: Partial<Texts> | undefined, language: SiteLanguage, fallback: SiteLanguage): string {
  return texts?.[language] || texts?.[fallback] || texts?.en || "";
}

// ─── Pages ──────────────────────────────────────────────────────────────────

export type PageTexts = Record<SiteLanguage, { title: string; body: string }>;

const pageText = z.object({ title: z.string().trim().max(120), body: z.string().max(50_000, "The text is too long") });
export const pageTextsSchema = z.object(
  Object.fromEntries(siteLanguages.map((l) => [l, pageText])) as Record<SiteLanguage, typeof pageText>,
);

export const emptyPageTexts = (): PageTexts =>
  Object.fromEntries(siteLanguages.map((l) => [l, { title: "", body: "" }])) as PageTexts;

export function parsePageTexts(value: unknown): PageTexts {
  const parsed = pageTextsSchema.safeParse({ ...emptyPageTexts(), ...(value as object) });
  return parsed.success ? parsed.data : emptyPageTexts();
}

/** Special pages: "" is the home page, "contact" shows the contact details and form. */
export const HOME_SLUG = "";
export const CONTACT_SLUG = "contact";
export const PAGE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function defaultPages(): { slug: string; position: number; translations: PageTexts }[] {
  const page = (en: [string, string], it: [string, string], sq: [string, string]): PageTexts => ({
    ...emptyPageTexts(),
    en: { title: en[0], body: en[1] },
    it: { title: it[0], body: it[1] },
    sq: { title: sq[0], body: sq[1] },
  });
  return [
    {
      slug: HOME_SLUG,
      position: 0,
      translations: page(
        ["Home", "## Welcome\n\nTell visitors in a few sentences who you are and what you offer."],
        ["Home", "## Benvenuti\n\nRacconta in poche frasi chi sei e cosa offri."],
        ["Kryefaqja", "## Mirë se vini\n\nTregoju vizitorëve me pak fjali kush jeni dhe çfarë ofroni."],
      ),
    },
    {
      slug: "about",
      position: 1,
      translations: page(
        ["About us", "Write your story here: how you started, what you believe in and what makes you different."],
        ["Chi siamo", "Scrivi qui la tua storia: come hai iniziato, in cosa credi e cosa ti rende diverso."],
        ["Rreth nesh", "Shkruani këtu historinë tuaj: si filluat, në çfarë besoni dhe çfarë ju bën të veçantë."],
      ),
    },
    {
      slug: CONTACT_SLUG,
      position: 2,
      translations: page(
        ["Contact", "We'd love to hear from you. Send us a message and we'll reply soon."],
        ["Contatti", "Ci farebbe piacere sentirti. Scrivici e ti risponderemo presto."],
        ["Kontakt", "Do të na vinte mirë t'ju dëgjonim. Na shkruani dhe do t'ju përgjigjemi shpejt."],
      ),
    },
  ];
}
