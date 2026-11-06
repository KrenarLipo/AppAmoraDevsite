import { cacheLife } from "next/cache";
import { SocialIcon } from "@/components/social-links";
import { SiteLogo } from "@/components/site-logo";
import { localeNames, locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n";
import { format, localePath } from "@/i18n/utils";
import { getMenus, getSiteInfo } from "@/lib/settings";
import { activeSocialLinks } from "@/lib/settings/site-info";
import { localizedText, resolveHref } from "@/lib/settings/schema";
import { NavLink } from "./nav-link";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const locale = await getLocale();
  const [t, menus, info] = await Promise.all([getDictionary(locale), getMenus(), getSiteInfo()]);

  const columns = menus.footer
    .map((column) => ({
      id: column.id,
      title: localizedText(column.title, locale),
      links: column.links
        .filter((item) => item.visible)
        .map((item) => ({ id: item.id, label: localizedText(item.label, locale), ...resolveHref(item.href, locale) })),
    }))
    .filter((column) => column.links.length > 0);

  return (
    <footer className="bg-ink text-mist">
      <div className="container-page flex flex-col gap-10 pt-14 pb-10">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="flex max-w-xs flex-col gap-4">
            <SiteLogo tone="dark" height={30} />
            <p className="text-sm leading-relaxed">{t.footer.tagline}</p>
            <div className="flex flex-wrap gap-2">
              {activeSocialLinks(info).map((link) => (
                <a
                  key={link.network}
                  href={link.href}
                  aria-label={format(t.footer.social, { network: link.name })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-11 items-center justify-center rounded-xl border border-panel-line text-paper transition-colors hover:border-paper"
                >
                  <SocialIcon network={link.network} />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-14 gap-y-8 text-sm">
            {columns.map((col) => (
              <div key={col.id} className="flex flex-col gap-2.5">
                <span className="font-semibold text-paper">{col.title}</span>
                {col.links.map((link) => (
                  <NavLink key={link.id} {...link} className="transition-colors hover:text-paper" />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4 border-t border-panel-line pt-6 text-[13px]">
          <span className="flex flex-wrap gap-x-4 gap-y-2">
            <span>
              © {await currentYear()} AppAmora. {t.footer.rights}
            </span>
            <a href={localePath(locale, "/privacy")} className="transition-colors hover:text-paper">
              {t.legal.privacy}
            </a>
            <a href={localePath(locale, "/terms")} className="transition-colors hover:text-paper">
              {t.legal.terms}
            </a>
          </span>
          <span className="flex gap-4">
            {locales.map((l) => (
              <a
                key={l}
                href={localePath(l)}
                hrefLang={l}
                lang={l}
                className={l === locale ? "text-paper" : "transition-colors hover:text-paper"}
              >
                {localeNames[l]}
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
