import { getDb } from "@appamora/db";
import { cacheLife, cacheTag } from "next/cache";
import type { TemplateId } from "@/lib/catalog";
import { accountState, effectiveLimits, type PlanLimits } from "@/lib/plans";
import { parsePageTexts, parseSiteContent, type PageTexts, type SiteContent } from "./content";
import type { SiteLanguage } from "./languages";

/** Saving anything on a client's site calls updateTag(siteTag(slug)). */
export const siteTag = (slug: string) => `site:${slug}`;

export type PublicPage = { slug: string; showInMenu: boolean; translations: PageTexts };

export type PublicSite = {
  id: string;
  slug: string;
  /** False when the trial ended without payment: the site shows an "offline" notice. */
  online: boolean;
  limits: PlanLimits;
  template: TemplateId;
  content: SiteContent;
  /** Languages actually offered, within the plan's limit. */
  languages: SiteLanguage[];
  pages: PublicPage[];
  /** For the footer's copyright line. */
  year: number;
};

/** A client's site by its public slug. Cached; refreshed on save, and hourly so trial ends take effect. */
export async function getPublicSite(slug: string): Promise<PublicSite | null> {
  "use cache";
  cacheTag(siteTag(slug));
  cacheLife("hours");
  try {
    const client = await getDb().client.findUnique({
      where: { slug },
      include: { site: { include: { pages: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] } } } },
    });
    if (!client?.site) return null;
    const now = new Date();
    const state = accountState(client, now);
    const limits = effectiveLimits(client, state);
    const template = client.site.template as TemplateId;
    const content = parseSiteContent(client.site.content, client.name, template);
    const languages = content.languages.slice(0, limits.languages);
    return {
      id: client.site.id,
      slug: client.slug,
      online: state.kind !== "locked",
      limits,
      template,
      content: { ...content, defaultLanguage: languages.includes(content.defaultLanguage) ? content.defaultLanguage : languages[0]! },
      languages,
      year: now.getFullYear(),
      pages: client.site.pages.slice(0, limits.pages).map((p) => ({
        slug: p.slug,
        showInMenu: p.showInMenu,
        translations: parsePageTexts(p.translations),
      })),
    };
  } catch (error) {
    console.error(`Could not load the site "${slug}"`, error);
    cacheLife("minutes");
    return null;
  }
}

/** Link to a page of a client's site; the default language has no prefix. */
export function siteHref(site: Pick<PublicSite, "slug" | "content">, language: SiteLanguage, page = ""): string {
  const parts = [`/s/${site.slug}`];
  if (language !== site.content.defaultLanguage) parts.push(language);
  if (page) parts.push(page);
  return parts.join("/");
}
