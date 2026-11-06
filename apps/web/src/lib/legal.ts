import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { defaultLocale, type Locale } from "@/i18n/config";
import { format } from "@/i18n/utils";
import { getSiteInfo } from "./settings";
import { localizedLineText, priceValues, type SiteInfo } from "./settings/site-info";
import { siteConfig } from "./site";

// Legal texts live in content/legal/<locale>/<doc>.md, like blog posts.
// Placeholders such as {company} or {email} are filled from the site settings
// (edited at /admin/settings), so the business details are kept in one place.
const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

export const legalDocs = ["privacy", "terms"] as const;
export type LegalDoc = (typeof legalDocs)[number];

export type LegalPage = {
  title: string;
  description: string;
  /** ISO date of the last change. */
  updated: string;
  html: string;
  /** Locale the text is actually written in (differs from the page locale on fallback). */
  locale: Locale;
};

function read(locale: Locale, doc: LegalDoc, pageLocale: Locale, info: SiteInfo): LegalPage | null {
  const file = path.join(LEGAL_DIR, locale, `${doc}.md`);
  if (!fs.existsSync(file)) return null;

  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const filled = format(content, {
    company: info.company.name,
    ceo: info.company.ceo,
    taxId: info.company.taxId,
    phone: info.contact.phone,
    phoneLink: info.contact.phone.replace(/[^+\d]/g, ""),
    address: localizedLineText(info.company.address, pageLocale),
    country: localizedLineText(info.company.country, pageLocale),
    email: info.contact.email,
    site: siteConfig.url.replace(/^https?:\/\//, ""),
    ...priceValues(info, pageLocale),
  })
    // Site links like (/pricing) get the visitor's language: (/it/pricing).
    .replace(/\]\(\/(?!\/)/g, `](/${pageLocale}/`);

  return {
    title: String(data.title),
    description: String(data.description ?? ""),
    updated: data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : String(data.updated),
    html: marked.parse(filled, { async: false }),
    locale,
  };
}

export async function getLegalPage(locale: Locale, doc: LegalDoc): Promise<LegalPage> {
  const info = await getSiteInfo();
  const page = read(locale, doc, locale, info) ?? read(defaultLocale, doc, locale, info);
  if (!page) throw new Error(`Missing content/legal/${defaultLocale}/${doc}.md`);
  return page;
}
