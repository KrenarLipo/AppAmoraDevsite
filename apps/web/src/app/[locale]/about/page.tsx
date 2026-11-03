import type { Metadata } from "next";
import Image from "next/image";
import { InstagramIcon, TikTokIcon } from "@/components/icons";
import { CtaBand } from "@/components/sections/cta-band";
import { getDictionary, getLocale } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getSiteImages } from "@/lib/settings";
import { localizedText, mediaUrl } from "@/lib/settings/schema";
import { siteConfig } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return pageMetadata({ locale, path: "/about", title: t.nav.about, description: t.about.body });
}

export default async function AboutPage() {
  const locale = await getLocale();
  const [t, { about: photo }] = await Promise.all([getDictionary(locale), getSiteImages()]);

  return (
    <>
      <section className="container-page flex flex-wrap gap-14 pt-16 pb-20">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
          <p className="eyebrow text-amora">{t.about.eyebrow}</p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[1.03] font-bold tracking-[-0.035em] text-balance">
            {t.about.title}
          </h1>
          <p className="text-xl leading-relaxed text-muted">{t.about.body}</p>
          <p className="text-lg leading-relaxed text-muted">{t.about.story}</p>
        </div>
        <div className="flex flex-[1_1_300px] flex-col gap-5 self-start">
        {photo && (
          <Image
            src={mediaUrl(photo)}
            alt={localizedText(photo.alt, locale)}
            width={photo.width}
            height={photo.height}
            sizes="(min-width: 1024px) 420px, 100vw"
            className="h-auto w-full rounded-[18px] object-cover"
          />
        )}
        <aside className="flex flex-col justify-between gap-8 rounded-[18px] bg-ink p-8 text-paper">
          <p className="eyebrow text-amora-bright">{t.about.follow}</p>
          <div className="flex flex-col gap-3">
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center gap-3 rounded-xl border border-panel-line px-4 font-semibold transition-colors hover:border-paper"
            >
              <InstagramIcon size={22} /> Instagram
            </a>
            <a
              href={siteConfig.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center gap-3 rounded-xl border border-panel-line px-4 font-semibold transition-colors hover:border-paper"
            >
              <TikTokIcon size={22} /> TikTok
            </a>
          </div>
        </aside>
        </div>
      </section>

      <section className="container-page flex flex-col gap-10 pb-24">
        <h2 className="font-display text-3xl font-bold tracking-tight">{t.about.valuesTitle}</h2>
        <ul className="flex flex-wrap gap-5">
          {t.about.values.map((value, i) => (
            <li key={value.title} className="flex flex-[1_1_300px] flex-col gap-3 border-t-2 border-ink pt-6">
              <span className="font-mono text-sm text-amora">0{i + 1}</span>
              <h3 className="font-display text-2xl font-bold">{value.title}</h3>
              <p className="leading-relaxed text-muted">{value.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
