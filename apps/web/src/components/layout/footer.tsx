import { cacheLife } from "next/cache";
import { InstagramIcon, TikTokIcon } from "@/components/icons";
import { SiteLogo } from "@/components/site-logo";
import { localeNames, locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { getMenus } from "@/lib/settings";
import { localizedText, resolveHref } from "@/lib/settings/schema";
import { siteConfig } from "@/lib/site";
import { NavLink } from "./nav-link";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const locale = await getLocale();
  const [t, menus] = await Promise.all([getDictionary(locale), getMenus()]);

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
            <div className="flex gap-2">
              <a
                href={siteConfig.social.instagram}
                aria-label={t.footer.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-11 items-center justify-center rounded-xl border border-panel-line text-paper transition-colors hover:border-paper"
              >
                <InstagramIcon />
              </a>
              <a
                href={siteConfig.social.tiktok}
                aria-label={t.footer.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-11 items-center justify-center rounded-xl border border-panel-line text-paper transition-colors hover:border-paper"
              >
                <TikTokIcon />
              </a>
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
          <span>
            © {await currentYear()} AppAmora. {t.footer.rights}
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
