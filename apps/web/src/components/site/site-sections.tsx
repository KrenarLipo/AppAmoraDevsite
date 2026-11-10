import Image from "next/image";
import type { CSSProperties } from "react";
import { mediaUrl } from "@/lib/settings/schema";
import { CONTACT_SLUG, pick } from "@/lib/sites/content";
import type { SiteLanguage } from "@/lib/sites/languages";
import { nicheDefaults } from "@/lib/sites/niche-defaults";
import { siteHref, type PublicSite } from "@/lib/sites/public";
import { siteStrings } from "@/lib/sites/strings";
import { getTheme } from "@/lib/sites/templates";
import { Reveal } from "./reveal";
import { ContactForm, SubscribeForm } from "./site-forms";
import { SiteIcon } from "./site-icon";
import { Slideshow } from "./slideshow";

export const headingStyle = { fontFamily: "var(--site-heading-font)", textTransform: "var(--site-heading-transform)" } as CSSProperties;
const rise = (delay: number) => ({ "--delay": `${delay}ms` }) as CSSProperties;

type Props = { site: PublicSite; language: SiteLanguage };

/** The client's slideshow photos, or the template's photos until they add their own. */
export function heroImages(site: PublicSite) {
  if (site.limits.slideshow && site.content.slideshow.length > 0) {
    return site.content.slideshow.map((img) => ({ src: mediaUrl(img), width: img.width, height: img.height }));
  }
  return nicheDefaults[site.template].images.slice(0, 2);
}

function introImage(site: PublicSite) {
  const own = site.limits.slideshow && site.content.introImage;
  return own ? { src: mediaUrl(own), width: own.width, height: own.height } : nicheDefaults[site.template].images[2]!;
}

function ContactButton({ site, language, className = "" }: Props & { className?: string }) {
  const label = pick(site.content.hero.button, language, site.content.defaultLanguage);
  if (!label || !site.pages.some((p) => p.slug === CONTACT_SLUG)) return null;
  return (
    <a
      href={siteHref(site, language, CONTACT_SLUG)}
      className={`group inline-flex h-13 items-center gap-2 rounded-(--site-radius) bg-(--site-primary) px-7 font-semibold text-(--site-on-primary) shadow-[0_10px_30px_-12px_var(--site-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-14px_var(--site-primary)] ${className}`}
    >
      {label}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}

export function Hero({ site, language }: Props) {
  const { content } = site;
  const fallback = content.defaultLanguage;
  const layout = getTheme(site.template).hero;
  const images = heroImages(site);
  const headline = pick(content.hero.headline, language, fallback);
  const text = pick(content.hero.text, language, fallback);

  const copy = (
    <>
      <p className="site-rise text-sm font-semibold tracking-[0.18em] uppercase opacity-80" style={rise(0)}>
        {content.brandName}
      </p>
      <h1 style={{ ...headingStyle, ...rise(120) }} className="site-rise text-[clamp(2.4rem,6.5vw,4.5rem)] leading-[1.02] font-bold tracking-tight text-balance">
        {headline}
      </h1>
      {text && (
        <p style={rise(260)} className="site-rise max-w-xl text-lg leading-relaxed opacity-85 sm:text-xl">
          {text}
        </p>
      )}
      <div style={rise(400)} className="site-rise">
        <ContactButton site={site} language={language} />
      </div>
    </>
  );

  if (layout === "overlay") {
    return (
      <section className="relative flex min-h-[86svh] items-end overflow-hidden bg-(--site-surface) text-white">
        <div className="absolute inset-0">
          <Slideshow images={images} cover />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
        </div>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 pt-32 pb-20 sm:px-6 sm:pb-28">{copy}</div>
      </section>
    );
  }

  if (layout === "centered") {
    return (
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-(--site-primary) opacity-[0.08] blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
          <div className="flex flex-col items-center gap-6">{copy}</div>
          <div style={rise(520)} className="site-rise w-full max-w-5xl overflow-hidden rounded-(--site-radius) shadow-[0_40px_80px_-40px_rgba(0,0,0,0.45)]">
            <div className="aspect-[16/8]">
              <Slideshow images={images} cover />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-12 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col items-start gap-6">{copy}</div>
        <div style={rise(300)} className="site-rise relative min-w-0 flex-[1_1_380px]">
          <div aria-hidden className="absolute -inset-3 -z-0 hidden translate-x-4 translate-y-4 rounded-(--site-radius) bg-(--site-primary) opacity-20 sm:block" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-(--site-radius) shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)] sm:aspect-[4/4.4]">
            <Slideshow images={images} cover />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Highlights({ site, language }: Props) {
  const { highlights, defaultLanguage } = site.content;
  const items = highlights.items.filter((item) => pick(item.title, language, defaultLanguage));
  if (!highlights.enabled || items.length === 0) return null;
  return (
    <section className="bg-(--site-surface)">
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:grid-cols-3 sm:px-6 sm:py-20">
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 120}>
            <article className="group flex h-full flex-col gap-4 rounded-(--site-radius) border border-(--site-text)/8 bg-(--site-bg) p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,0.45)]">
              <span className="flex size-13 items-center justify-center rounded-(--site-radius) bg-(--site-primary)/12 text-(--site-primary) transition-transform duration-300 group-hover:scale-110">
                <SiteIcon icon={item.icon} />
              </span>
              <h2 style={headingStyle} className="text-xl font-bold">
                {pick(item.title, language, defaultLanguage)}
              </h2>
              <p className="leading-relaxed text-(--site-muted)">{pick(item.text, language, defaultLanguage)}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** The home page text next to a photo. */
export function Intro({ site, html }: { site: PublicSite; html: string }) {
  if (!html) return null;
  const image = introImage(site);
  return (
    <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-12 px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="min-w-0 flex-[1_1_360px]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-(--site-radius)">
          <Image src={image.src} alt="" fill sizes="(min-width: 1024px) 540px, 100vw" className="object-cover transition-transform duration-700 hover:scale-105" />
        </div>
      </Reveal>
      <Reveal delay={150} className="min-w-0 flex-[1_1_420px]">
        {/* Markdown written by the client; raw HTML is stripped (src/lib/markdown.ts). */}
        <div className="site-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </Reveal>
    </section>
  );
}

export function CtaBand({ site, language }: Props) {
  const { cta, defaultLanguage } = site.content;
  const title = pick(cta.title, language, defaultLanguage);
  if (!cta.enabled || !title) return null;
  const image = heroImages(site)[0];
  return (
    <section className="px-4 pb-20 sm:px-6">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative isolate overflow-hidden rounded-(--site-radius) bg-(--site-primary) px-6 py-14 text-(--site-on-primary) sm:px-12 sm:py-20">
          {image && <Image src={image.src} alt="" fill sizes="1152px" className="-z-10 object-cover opacity-20 mix-blend-luminosity" />}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <h2 style={headingStyle} className="max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-bold text-balance">
              {title}
            </h2>
            <ContactButton site={site} language={language} className="!bg-(--site-on-primary) !text-(--site-primary)" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function PageHeader({ title }: { title: string }) {
  return (
    <section className="border-b border-(--site-text)/8 bg-(--site-surface)">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h1 style={{ ...headingStyle, ...rise(0) }} className="site-rise text-[clamp(2.2rem,5.5vw,3.75rem)] leading-tight font-bold tracking-tight">
          {title}
        </h1>
      </div>
    </section>
  );
}

export function PageBody({ html }: { html: string }) {
  if (!html) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <Reveal>
        {/* Markdown written by the client; raw HTML is stripped (src/lib/markdown.ts). */}
        <div className="site-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </Reveal>
    </section>
  );
}

export function ContactSection({ site, language }: Props) {
  const t = siteStrings[language];
  const { contact } = site.content;
  const hours = pick(contact.hours, language, site.content.defaultLanguage);
  const details = [
    contact.phone && { label: t.phone, value: contact.phone, href: `tel:${contact.phone.replace(/[^+\d]/g, "")}` },
    contact.email && { label: t.email, value: contact.email, href: `mailto:${contact.email}` },
    contact.address && { label: t.address, value: contact.address, href: `https://maps.google.com/?q=${encodeURIComponent(contact.address)}` },
  ].filter((d): d is { label: string; value: string; href: string } => Boolean(d));

  return (
    <section className="mx-auto flex max-w-6xl flex-wrap gap-10 px-4 pb-24 sm:px-6">
      {(details.length > 0 || hours) && (
        <Reveal className="min-w-0 flex-[1_1_280px]">
          <dl className="flex flex-col gap-6">
            {details.map((d) => (
              <div key={d.label} className="flex flex-col gap-1 border-l-2 border-(--site-primary) pl-4">
                <dt className="text-sm text-(--site-muted)">{d.label}</dt>
                <dd>
                  <a href={d.href} className="text-lg font-semibold break-words transition-colors hover:text-(--site-primary)">
                    {d.value}
                  </a>
                </dd>
              </div>
            ))}
            {hours && (
              <div className="flex flex-col gap-1 border-l-2 border-(--site-primary) pl-4">
                <dt className="text-sm text-(--site-muted)">{t.hours}</dt>
                <dd className="whitespace-pre-line">{hours}</dd>
              </div>
            )}
          </dl>
        </Reveal>
      )}
      <Reveal delay={120} className="min-w-0 flex-[1_1_420px]">
        <div className="rounded-(--site-radius) bg-(--site-surface) p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.45)] sm:p-8">
          <ContactForm slug={site.slug} language={language} labels={t} />
        </div>
      </Reveal>
    </section>
  );
}

export function SubscribeSection({ site, language }: Props) {
  if (!site.limits.subscribers || !site.content.subscribe.enabled) return null;
  const title = pick(site.content.subscribe.title, language, site.content.defaultLanguage);
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-(--site-radius) border border-(--site-text)/10 px-6 py-10 sm:px-10">
          <h2 style={headingStyle} className="text-2xl font-bold sm:text-3xl">
            {title}
          </h2>
          <SubscribeForm slug={site.slug} language={language} labels={siteStrings[language]} />
        </div>
      </Reveal>
    </section>
  );
}
