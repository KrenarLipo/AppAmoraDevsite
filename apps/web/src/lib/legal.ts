import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { defaultLocale, type Locale } from "@/i18n/config";
import { format } from "@/i18n/utils";
import { siteConfig } from "./site";

// Legal texts live in content/legal/<locale>/<doc>.md, like blog posts.
// Placeholders such as {company} or {email} are filled from siteConfig, so the
// business details are kept in one place (src/lib/site.ts).
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

function read(locale: Locale, doc: LegalDoc, pageLocale: Locale): LegalPage | null {
  const file = path.join(LEGAL_DIR, locale, `${doc}.md`);
  if (!fs.existsSync(file)) return null;

  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const filled = format(content, {
    company: siteConfig.legal.company,
    ceo: siteConfig.legal.ceo,
    taxId: siteConfig.legal.taxId,
    phone: siteConfig.legal.phone,
    phoneLink: siteConfig.legal.phone.replace(/\s/g, ""),
    address: siteConfig.legal.address[pageLocale],
    country: siteConfig.legal.country[pageLocale],
    email: siteConfig.email,
    site: siteConfig.url.replace(/^https?:\/\//, ""),
    trialDays: siteConfig.trialDays,
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

export function getLegalPage(locale: Locale, doc: LegalDoc): LegalPage {
  const page = read(locale, doc, locale) ?? read(defaultLocale, doc, locale);
  if (!page) throw new Error(`Missing content/legal/${defaultLocale}/${doc}.md`);
  return page;
}
