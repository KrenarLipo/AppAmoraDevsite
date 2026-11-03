import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { SiteLogo } from "@/components/site-logo";
import { localeNames } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { getMenus } from "@/lib/settings";
import { localizedText, resolveHref } from "@/lib/settings/schema";
import { trialPath } from "@/lib/site";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";

export async function Header() {
  const locale = await getLocale();
  const [t, menus] = await Promise.all([getDictionary(locale), getMenus()]);

  const links = menus.header
    .filter((item) => item.visible)
    .map((item) => ({ id: item.id, label: localizedText(item.label, locale), ...resolveHref(item.href, locale) }));
  const trialHref = localePath(locale, trialPath);
  const loginHref = localePath(locale, "/login");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        {t.nav.skipToContent}
      </a>
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link href={localePath(locale)} aria-label={t.nav.home} className="shrink-0">
          <SiteLogo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 text-[15px] font-medium lg:flex">
          {links.map((link) => (
            <NavLink key={link.id} {...link} className="transition-colors hover:text-amora" />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} label={t.nav.language} names={localeNames} />
          <Link
            href={loginHref}
            className="hidden h-11 items-center px-2 text-[15px] font-semibold transition-colors hover:text-amora md:flex"
          >
            {t.nav.login}
          </Link>
          <div className="hidden sm:block">
            <ButtonLink href={trialHref} variant="dark" size="md">
              {t.nav.startTrial}
            </ButtonLink>
          </div>
          <MobileMenu
            links={links}
            cta={{ href: trialHref, label: t.nav.startTrial }}
            login={{ href: loginHref, label: t.nav.login }}
            openLabel={t.nav.openMenu}
            closeLabel={t.nav.closeMenu}
          />
        </div>
      </div>
    </header>
  );
}
