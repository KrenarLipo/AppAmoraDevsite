import { mediaUrl } from "@/lib/settings/schema";
import { CONTACT_SLUG, pick } from "@/lib/sites/content";
import type { SiteLanguage } from "@/lib/sites/languages";
import { siteHref, type PublicSite } from "@/lib/sites/public";
import { siteStrings } from "@/lib/sites/strings";
import { getTheme } from "@/lib/sites/templates";
import { ContactForm, SubscribeForm } from "./site-forms";
import { Slideshow } from "./slideshow";

const headingStyle = { fontFamily: "var(--site-heading-font)", textTransform: "var(--site-heading-transform)" } as const;

export function Hero({ site, language }: { site: PublicSite; language: SiteLanguage }) {
  const { content } = site;
  const fallback = content.defaultLanguage;
  const layout = getTheme(site.template).hero;
  const images = site.limits.slideshow ? content.slideshow : [];
  const headline = pick(content.hero.headline, language, fallback);
  const text = pick(content.hero.text, language, fallback);
  const button = pick(content.hero.button, language, fallback);
  const hasContact = site.pages.some((p) => p.slug === CONTACT_SLUG);

  const copy = (
    <>
      <h1 style={headingStyle} className="text-[clamp(2.25rem,6vw,4rem)] leading-[1.05] font-bold tracking-tight text-balance">
        {headline}
      </h1>
      {text && <p className="max-w-xl text-lg leading-relaxed opacity-85 sm:text-xl">{text}</p>}
      {button && hasContact && (
        <a
          href={siteHref(site, language, CONTACT_SLUG)}
          className="inline-flex h-13 items-center rounded-(--site-radius) bg-(--site-primary) px-7 font-semibold text-(--site-on-primary) transition-opacity hover:opacity-90"
        >
          {button}
        </a>
      )}
    </>
  );

  if (layout === "overlay") {
    return (
      <section className={`relative flex items-end overflow-hidden bg-(--site-surface) ${images.length ? "min-h-[70vh]" : ""}`}>
        {images.length > 0 && (
          <div className="absolute inset-0">
            <Slideshow images={images.map((img) => ({ src: mediaUrl(img), width: img.width, height: img.height }))} cover />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          </div>
        )}
        <div className={`relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-24 ${images.length ? "text-white" : ""}`}>
          {copy}
        </div>
      </section>
    );
  }

  if (layout === "centered") {
    return (
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="flex flex-col items-center gap-6">{copy}</div>
        {images.length > 0 && (
          <div className="w-full overflow-hidden rounded-(--site-radius)">
            <Slideshow images={images.map((img) => ({ src: mediaUrl(img), width: img.width, height: img.height }))} />
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-10 px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex min-w-0 flex-[1_1_420px] flex-col items-start gap-6">{copy}</div>
      {images.length > 0 && (
        <div className="min-w-0 flex-[1_1_380px] overflow-hidden rounded-(--site-radius)">
          <Slideshow images={images.map((img) => ({ src: mediaUrl(img), width: img.width, height: img.height }))} />
        </div>
      )}
    </section>
  );
}

export function PageBody({ html, title }: { html: string; title?: string }) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
      {title && (
        <h1 style={headingStyle} className="text-[clamp(2rem,5vw,3.25rem)] leading-tight font-bold tracking-tight">
          {title}
        </h1>
      )}
      {/* Markdown written by the client; raw HTML is stripped (src/lib/markdown.ts). */}
      <div className="site-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

export function ContactSection({ site, language }: { site: PublicSite; language: SiteLanguage }) {
  const t = siteStrings[language];
  const { contact } = site.content;
  const hours = pick(contact.hours, language, site.content.defaultLanguage);
  const details = [
    contact.phone && { label: t.phone, value: contact.phone, href: `tel:${contact.phone.replace(/[^+\d]/g, "")}` },
    contact.email && { label: t.email, value: contact.email, href: `mailto:${contact.email}` },
    contact.address && { label: t.address, value: contact.address, href: `https://maps.google.com/?q=${encodeURIComponent(contact.address)}` },
  ].filter((d): d is { label: string; value: string; href: string } => Boolean(d));

  return (
    <section className="mx-auto flex max-w-6xl flex-wrap gap-10 px-4 pb-20 sm:px-6">
      {(details.length > 0 || hours) && (
        <dl className="flex min-w-0 flex-[1_1_280px] flex-col gap-5">
          {details.map((d) => (
            <div key={d.label} className="flex flex-col gap-1">
              <dt className="text-sm text-(--site-muted)">{d.label}</dt>
              <dd>
                <a href={d.href} className="text-lg font-semibold break-words hover:text-(--site-primary)">
                  {d.value}
                </a>
              </dd>
            </div>
          ))}
          {hours && (
            <div className="flex flex-col gap-1">
              <dt className="text-sm text-(--site-muted)">{t.hours}</dt>
              <dd className="whitespace-pre-line">{hours}</dd>
            </div>
          )}
        </dl>
      )}
      <div className="min-w-0 flex-[1_1_420px] rounded-(--site-radius) bg-(--site-surface) p-6 sm:p-8">
        <ContactForm slug={site.slug} language={language} labels={t} />
      </div>
    </section>
  );
}

export function SubscribeSection({ site, language }: { site: PublicSite; language: SiteLanguage }) {
  if (!site.limits.subscribers || !site.content.subscribe.enabled) return null;
  const title = pick(site.content.subscribe.title, language, site.content.defaultLanguage);
  return (
    <section className="bg-(--site-surface)">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-12 sm:px-6">
        <h2 style={headingStyle} className="text-2xl font-bold sm:text-3xl">
          {title}
        </h2>
        <SubscribeForm slug={site.slug} language={language} labels={siteStrings[language]} />
      </div>
    </section>
  );
}
