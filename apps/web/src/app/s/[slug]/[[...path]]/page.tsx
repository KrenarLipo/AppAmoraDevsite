import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactSection, CtaBand, heroImages, Hero, Highlights, Intro, PageBody, PageHeader, SubscribeSection } from "@/components/site/site-sections";
import { SiteFrame, themeStyle } from "@/components/site/site-frame";
import { renderMarkdown } from "@/lib/markdown";
import { mediaUrl } from "@/lib/settings/schema";
import { CONTACT_SLUG, HOME_SLUG, pick } from "@/lib/sites/content";
import { isSiteLanguage, type SiteLanguage } from "@/lib/sites/languages";
import { getPublicSite, siteHref, type PublicSite } from "@/lib/sites/public";
import { siteStrings } from "@/lib/sites/strings";

type Params = PageProps<"/s/[slug]/[[...path]]">["params"];

// Sites are created after the build, so every one is rendered on its first visit and then
// cached. Cache Components needs at least one param to validate the route.
export function generateStaticParams() {
  return [{ slug: "__none__", path: [] }];
}

/** "/s/acme" → home in the default language; "/s/acme/it/about" → the Italian About page. */
function resolve(site: PublicSite, path: string[] = []) {
  let [first, ...rest] = path;
  let language: SiteLanguage = site.content.defaultLanguage;
  if (first && isSiteLanguage(first) && site.languages.includes(first)) {
    language = first;
    [first, ...rest] = rest;
  }
  if (rest.length > 0) return null;
  const slug = first ?? HOME_SLUG;
  const page = site.pages.find((p) => p.slug === slug);
  return page ? { language, page } : { language, page: null };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, path } = await params;
  const site = await getPublicSite(slug);
  if (!site) return {};
  const resolved = resolve(site, path);
  const language = resolved?.language ?? site.content.defaultLanguage;
  const fallback = site.content.defaultLanguage;
  const page = resolved?.page;
  const title = page && page.slug !== HOME_SLUG ? `${pick(titles(page), language, fallback)} · ${site.content.brandName}` : site.content.brandName;
  const description = pick(site.content.hero.text, language, fallback);
  const own = site.content.slideshow[0] ?? site.content.logo;
  return {
    title,
    description,
    icons: site.content.logo ? { icon: mediaUrl(site.content.logo) } : undefined,
    alternates: {
      languages: Object.fromEntries(site.languages.map((l) => [l, siteHref(site, l, page?.slug ?? "")])),
    },
    openGraph: { title, description, siteName: site.content.brandName, images: [own ? mediaUrl(own) : heroImages(site)[0]!.src] },
  };
}

export default function ClientSitePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SitePage params={params} />
    </Suspense>
  );
}

async function SitePage({ params }: { params: Params }) {
  const { slug, path } = await params;
  const site = await getPublicSite(slug);
  if (!site) notFound();

  if (!site.online) {
    const t = siteStrings[site.content.defaultLanguage];
    return (
      <div style={themeStyle(site)} className="flex min-h-screen flex-col items-center justify-center gap-3 bg-(--site-bg) px-6 text-center text-(--site-text)">
        <p className="text-2xl font-bold" style={{ fontFamily: "var(--site-heading-font)" }}>
          {site.content.brandName}
        </p>
        <h1 className="text-lg">{t.offlineTitle}</h1>
        <p className="text-(--site-muted)">{t.offlineBody}</p>
      </div>
    );
  }

  const resolved = resolve(site, path);
  const language = resolved?.language ?? site.content.defaultLanguage;
  const page = resolved?.page;
  const fallback = site.content.defaultLanguage;

  if (!page) {
    const t = siteStrings[language];
    return (
      <SiteFrame site={site} language={language} currentPage="__none__">
        <section className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-4 py-24 sm:px-6">
          <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--site-heading-font)" }}>
            {t.notFound}
          </h1>
          <a href={siteHref(site, language)} className="font-semibold text-(--site-primary) underline underline-offset-4">
            {t.backHome}
          </a>
        </section>
      </SiteFrame>
    );
  }

  const body = page.translations[language]?.body || page.translations[fallback]?.body || "";
  const html = body.trim() ? renderMarkdown(body) : "";

  return (
    <SiteFrame site={site} language={language} currentPage={page.slug}>
      {page.slug === HOME_SLUG ? (
        <>
          <Hero site={site} language={language} />
          <Highlights site={site} language={language} />
          <Intro site={site} html={html} />
          <CtaBand site={site} language={language} />
          <SubscribeSection site={site} language={language} />
        </>
      ) : (
        <>
          <PageHeader title={pick(titles(page), language, fallback)} />
          <PageBody html={html} />
          {page.slug === CONTACT_SLUG && <ContactSection site={site} language={language} />}
          {page.slug !== CONTACT_SLUG && <CtaBand site={site} language={language} />}
        </>
      )}
    </SiteFrame>
  );
}

function titles(page: PublicSite["pages"][number]) {
  return Object.fromEntries(Object.entries(page.translations).map(([l, t]) => [l, t.title]));
}
