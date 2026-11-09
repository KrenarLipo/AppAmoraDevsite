import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/icons";
import { mediaUrl } from "@/lib/settings/schema";
import { CONTACT_SLUG, pick } from "@/lib/sites/content";
import { fontFamilies } from "@/lib/sites/fonts";
import { siteLanguageNames, type SiteLanguage } from "@/lib/sites/languages";
import { siteHref, type PublicSite } from "@/lib/sites/public";
import { siteStrings } from "@/lib/sites/strings";
import { getTheme } from "@/lib/sites/templates";
import { SiteMenu } from "./site-menu";

/** CSS variables for a site's theme, with the client's own colors and fonts on top. */
export function themeStyle(site: Pick<PublicSite, "template" | "content" | "limits">): CSSProperties {
  const theme = getTheme(site.template);
  const custom = site.limits.design;
  const primary = (custom && site.content.colors.primary) || theme.colors.primary;
  const background = (custom && site.content.colors.background) || theme.colors.background;
  const heading = (custom && site.content.fonts.heading) || theme.fonts.heading;
  const body = (custom && site.content.fonts.body) || theme.fonts.body;
  return {
    "--site-bg": background,
    "--site-surface": theme.colors.surface,
    "--site-text": theme.colors.text,
    "--site-muted": theme.colors.muted,
    "--site-primary": primary,
    "--site-on-primary": readableOn(primary, theme.colors.onPrimary),
    "--site-radius": `${theme.radius}px`,
    "--site-heading-font": fontFamilies[heading],
    "--site-body-font": fontFamilies[body],
    "--site-heading-transform": theme.uppercaseHeadings ? "uppercase" : "none",
  } as CSSProperties;
}

/** Dark or light text on a button color, so a custom color stays readable. */
function readableOn(hex: string, fallback: string): string {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) return fallback;
  const [r, g, b] = match.slice(1).map((h) => parseInt(h, 16) / 255);
  const luminance = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  return luminance > 0.6 ? "#111111" : "#FFFFFF";
}

type Props = { site: PublicSite; language: SiteLanguage; currentPage: string; children: ReactNode };

export function SiteFrame({ site, language, currentPage, children }: Props) {
  const t = siteStrings[language];
  const { content } = site;
  const fallback = content.defaultLanguage;
  const menu = site.pages
    .filter((p) => p.showInMenu)
    .map((p) => ({ href: siteHref(site, language, p.slug), label: pick(objTitles(p.translations), language, fallback), active: p.slug === currentPage }));
  const languages = site.languages.map((l) => ({ code: l, name: siteLanguageNames[l], href: siteHref(site, l, currentPage), active: l === language }));
  const ctaLabel = pick(content.hero.button, language, fallback);
  const cta = ctaLabel && site.pages.some((p) => p.slug === CONTACT_SLUG) ? { label: ctaLabel, href: siteHref(site, language, CONTACT_SLUG) } : null;
  const tagline = pick(content.hero.text, language, fallback);
  const whatsapp = site.limits.whatsapp && content.contact.whatsapp ? content.contact.whatsapp.replace(/\D/g, "") : null;
  const social = [
    { href: content.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: content.social.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: content.social.facebook, label: "Facebook", Icon: FacebookIcon },
  ].filter((s) => s.href);

  return (
    <div
      lang={language}
      style={{ ...themeStyle(site), fontFamily: "var(--site-body-font)" }}
      className="flex min-h-screen flex-col bg-(--site-bg) text-(--site-text)"
    >
      <header className="sticky top-0 z-30 border-b border-(--site-text)/10 bg-(--site-bg)/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
          <a href={siteHref(site, language)} className="flex min-w-0 items-center gap-3">
            {content.logo ? (
              <Image
                src={mediaUrl(content.logo)}
                alt={content.brandName}
                width={content.logo.width}
                height={content.logo.height}
                className="h-9 w-auto max-w-[180px] object-contain sm:h-11"
              />
            ) : (
              <span className="truncate text-xl font-bold" style={{ fontFamily: "var(--site-heading-font)" }}>
                {content.brandName}
              </span>
            )}
          </a>
          <SiteMenu items={menu} languages={languages} labels={{ menu: t.menu, close: t.close }} cta={cta} />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-(--site-surface)">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-14 pb-8 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div className="flex flex-col gap-4">
              <span className="text-2xl font-bold" style={{ fontFamily: "var(--site-heading-font)" }}>
                {content.brandName}
              </span>
              {tagline && <p className="max-w-sm text-sm leading-relaxed text-(--site-muted)">{tagline}</p>}
              {social.length > 0 && (
                <div className="flex gap-2">
                  {social.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex size-11 items-center justify-center rounded-(--site-radius) border border-(--site-text)/15 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--site-primary) hover:text-(--site-primary)"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <nav className="flex flex-col gap-2.5 text-sm">
              {menu.map((item) => (
                <a key={item.href} href={item.href} className="text-(--site-muted) transition-colors hover:text-(--site-text)">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-2.5 text-sm text-(--site-muted)">
              {content.contact.address && <span>{content.contact.address}</span>}
              {content.contact.phone && (
                <a href={`tel:${content.contact.phone.replace(/[^+\d]/g, "")}`} className="transition-colors hover:text-(--site-text)">
                  {content.contact.phone}
                </a>
              )}
              {content.contact.email && (
                <a href={`mailto:${content.contact.email}`} className="break-all transition-colors hover:text-(--site-text)">
                  {content.contact.email}
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--site-text)/10 pt-6 text-xs text-(--site-muted)">
            <span>
              © {site.year} {content.brandName}
            </span>
            {site.limits.badge && (
              <a href="https://appamora.com" target="_blank" rel="noopener" className="font-semibold transition-colors hover:text-(--site-text)">
                {t.madeWith}
              </a>
            )}
          </div>
        </div>
      </footer>

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.whatsapp}
          title={t.whatsapp}
          className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.3Z" />
          </svg>
        </a>
      )}
    </div>
  );
}

function objTitles(translations: PublicSite["pages"][number]["translations"]) {
  return Object.fromEntries(Object.entries(translations).map(([l, t]) => [l, t.title]));
}
