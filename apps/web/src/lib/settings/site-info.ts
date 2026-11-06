import { z } from "zod";
import type { Locale } from "@/i18n/config";

// Business details editable at /admin/settings: contact, social links, prices and the
// company details used in the Privacy Policy and Terms. Stored as the "site" setting.

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+\.[^\s]+$/.test(v), "Use a full link starting with https://");

const localizedLine = z.object({
  en: z.string().trim().min(1, "English is required").max(200),
  it: z.string().trim().max(200),
  sq: z.string().trim().max(200),
} satisfies Record<Locale, z.ZodType<string>>);

export const socialNetworks = ["instagram", "tiktok", "facebook", "linkedin", "youtube", "x"] as const;
export type SocialNetwork = (typeof socialNetworks)[number];

export const socialNames: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  x: "X (Twitter)",
};

const price = z.number().int("Use a whole number").min(0, "Can't be negative").max(100_000);

export const siteInfoSchema = z.object({
  contact: z.object({
    email: z.email("Enter a valid email address").max(200),
    phone: z.string().trim().max(40),
  }),
  social: z.object(
    Object.fromEntries(socialNetworks.map((n) => [n, optionalUrl])) as Record<SocialNetwork, typeof optionalUrl>,
  ),
  pricing: z.object({
    starter: price,
    pro: price,
    trialDays: z.number().int("Use a whole number").min(1, "At least 1 day").max(90, "At most 90 days"),
  }),
  company: z.object({
    name: z.string().trim().min(1, "Company name is required").max(120),
    ceo: z.string().trim().max(120),
    taxId: z.string().trim().max(40),
    address: localizedLine,
    country: localizedLine,
  }),
});
export type SiteInfo = z.infer<typeof siteInfoSchema>;

export const defaultSiteInfo: SiteInfo = {
  contact: { email: "klipo90@gmail.com", phone: "+355 68 608 5235" },
  social: {
    instagram: "https://www.instagram.com/theaideveloper2026",
    tiktok: "https://www.tiktok.com/@aicreator6666",
    facebook: "",
    linkedin: "",
    youtube: "",
    x: "",
  },
  pricing: { starter: 20, pro: 85, trialDays: 14 },
  company: {
    name: "AppAmora",
    ceo: "Artan Nikolla",
    taxId: "M11705045O",
    address: {
      en: "Rruga Ali Visha, Nd. 69, Hyrja 23, Ap. 23, Tirana, Albania",
      it: "Rruga Ali Visha, Nd. 69, Hyrja 23, Ap. 23, Tirana, Albania",
      sq: "Rruga Ali Visha, Nd. 69, Hyrja 23, Ap. 23, Tiranë, Shqipëri",
    },
    country: { en: "Albania", it: "Albania", sq: "Shqipëria" },
  },
};

/** "€20" in English, "20 €" in Italian and Albanian. */
export function formatEur(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

/** Fills {trialDays}, {starterPrice} and {proPrice} in dictionary or legal text. */
export function priceValues(info: SiteInfo, locale: Locale) {
  return {
    trialDays: info.pricing.trialDays,
    starterPrice: formatEur(info.pricing.starter, locale),
    proPrice: formatEur(info.pricing.pro, locale),
  };
}

/** Social links that have an address, in display order. */
export function activeSocialLinks(info: SiteInfo): { network: SocialNetwork; href: string; name: string }[] {
  return socialNetworks
    .filter((n) => info.social[n] !== "")
    .map((n) => ({ network: n, href: info.social[n], name: socialNames[n] }));
}

export function localizedLineText(value: SiteInfo["company"]["address"], locale: Locale): string {
  return value[locale] || value.en;
}
