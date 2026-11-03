import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { getDictionary, getLocale, type Dictionary } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { serviceSlugs } from "@/lib/catalog";
import { getSiteImages } from "@/lib/settings";
import { localizedText, mediaUrl } from "@/lib/settings/schema";
import { trialPath } from "@/lib/site";

export async function Hero() {
  const locale = await getLocale();
  const [t, { hero }] = await Promise.all([getDictionary(locale), getSiteImages()]);

  return (
    <section className="container-page flex flex-wrap items-center gap-14 pt-16 pb-24 md:pt-22">
      <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-7">
        <p className="flex flex-wrap gap-2.5 font-mono text-[13px] tracking-[0.08em] text-muted uppercase">
          {serviceSlugs.map((slug, i) => (
            <span key={slug} className="flex gap-2.5">
              {i > 0 && <span className="text-amora">/</span>}
              {t.services.items[slug].name}
            </span>
          ))}
        </p>
        <h1 className="font-display text-[clamp(2.75rem,7vw,4.25rem)] leading-[1.02] font-bold tracking-[-0.035em] text-balance">
          {t.hero.titleStart} <span className="text-amora">{t.hero.titleAccent}</span>
        </h1>
        <p className="max-w-[520px] text-[19px] leading-relaxed text-muted">{t.hero.subtitle}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={localePath(locale, trialPath)}>
            {t.hero.primaryCta}
            <ArrowRightIcon size={18} />
          </ButtonLink>
          <ButtonLink href={localePath(locale, "/services")} variant="outline">
            {t.hero.secondaryCta}
          </ButtonLink>
        </div>
        <ul className="flex flex-wrap gap-6 text-sm text-muted">
          {t.hero.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2">
              <CheckIcon size={16} className="text-ink" />
              {perk}
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0 flex-[1_1_480px]">
        {hero ? (
          <Image
            src={mediaUrl(hero)}
            alt={localizedText(hero.alt, locale)}
            width={hero.width}
            height={hero.height}
            sizes="(min-width: 1024px) 560px, 100vw"
            priority
            className="h-auto w-full rounded-[18px] shadow-[0_30px_60px_-30px_rgba(14,17,22,0.35)]"
          />
        ) : (
          <HeroMock labels={t.hero.mock} />
        )}
      </div>
    </section>
  );
}

/** Illustration of the client dashboard. Decorative, so hidden from assistive tech. */
function HeroMock({ labels }: { labels: Dictionary["hero"]["mock"] }) {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_30px_60px_-30px_rgba(14,17,22,0.35)]"
    >
      <div className="flex h-11 items-center gap-2 border-b border-line px-4">
        <span className="size-2.5 rounded-full bg-line" />
        <span className="size-2.5 rounded-full bg-line" />
        <span className="size-2.5 rounded-full bg-line" />
        <span className="ml-3 flex h-[26px] flex-1 items-center rounded-[7px] bg-paper px-3 font-mono text-xs text-muted">
          yourbusiness.appamora.com
        </span>
      </div>
      <div className="flex min-h-[360px]">
        <div className="hidden w-[150px] shrink-0 flex-col gap-1.5 border-r border-line px-3.5 py-[18px] text-[13px] sm:flex">
          <span className="mb-1.5 font-mono text-[11px] text-muted uppercase">{labels.dashboard}</span>
          <span className="rounded-lg bg-ink px-2.5 py-2 font-semibold text-paper">{labels.slideshow}</span>
          <span className="px-2.5 py-2">{labels.pages}</span>
          <span className="px-2.5 py-2">{labels.languages}</span>
          <span className="px-2.5 py-2">{labels.subscribers}</span>
          <span className="px-2.5 py-2">{labels.theme}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3.5 bg-cream p-[18px]">
          <div className="relative flex h-[170px] flex-col justify-end gap-1.5 overflow-hidden rounded-xl bg-ink p-[18px]">
            <span className="absolute -top-10 -right-10 size-[200px] rounded-full border-[28px] border-amora" />
            <span className="relative font-display text-2xl font-bold text-paper">{labels.slideTitle}</span>
            <span className="relative text-xs text-mist">{labels.slideHint}</span>
          </div>
          <div className="flex gap-2.5">
            <span className="h-14 flex-1 rounded-lg border-2 border-amora bg-ink" />
            <span className="h-14 flex-1 rounded-lg bg-[#E9E6DD]" />
            <span className="h-14 flex-1 rounded-lg bg-[#DAD6CB]" />
            <span className="flex h-14 flex-1 items-center justify-center rounded-lg border-[1.5px] border-dashed border-[#B9B5A9] text-xl text-muted">
              +
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <div className="flex-[1_1_140px] rounded-[10px] border border-line bg-white p-3">
              <span className="font-mono text-[11px] text-muted uppercase">{labels.languages}</span>
              <div className="mt-2 flex gap-1.5 text-xs">
                <span className="rounded-md bg-ink px-2 py-0.5 text-paper">EN</span>
                <span className="rounded-md bg-ink px-2 py-0.5 text-paper">IT</span>
                <span className="rounded-md border border-line-strong px-2 py-0.5">+ SQ</span>
              </div>
            </div>
            <div className="flex-[1_1_140px] rounded-[10px] border border-line bg-white p-3">
              <span className="font-mono text-[11px] text-muted uppercase">{labels.theme}</span>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="size-[22px] rounded-full bg-amora" />
                <span className="size-[22px] rounded-full bg-[#2F5BFF]" />
                <span className="size-[22px] rounded-full bg-[#13A36B]" />
                <span className="ml-1 text-xs">Space Grotesk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
