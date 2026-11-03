import Link from "next/link";
import type { ComponentType } from "react";
import { BotIcon, CodeIcon, SearchSparkIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { serviceSlugs, type ServiceSlug } from "@/lib/catalog";
import { SectionHeading } from "./section-heading";

export const serviceIcons: Record<ServiceSlug, ComponentType<{ size?: number }>> = {
  "ai-agents": BotIcon,
  "vibe-coding": CodeIcon,
  "ai-seo": SearchSparkIcon,
};

export async function ServicesSection({ headingAs = "h2" }: { headingAs?: "h1" | "h2" }) {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <section id="services" className="container-page flex flex-col gap-12 py-24">
      <SectionHeading
        as={headingAs}
        eyebrow={t.services.eyebrow}
        title={t.services.title}
        action={
          <Link
            href={localePath(locale, "/contact")}
            className="border-b-2 border-ink pb-1 font-semibold transition-colors hover:border-amora hover:text-amora"
          >
            {t.services.bookCall} →
          </Link>
        }
      />
      <div className="flex flex-wrap gap-5">
        {serviceSlugs.map((slug, i) => {
          const service = t.services.items[slug];
          const Icon = serviceIcons[slug];
          // The middle card is dark, as in the design.
          const dark = i === 1;
          return (
            <article
              key={slug}
              className={`flex flex-[1_1_320px] flex-col gap-[18px] rounded-[18px] p-8 ${dark ? "bg-ink text-paper" : "border border-line bg-white"}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex size-[52px] items-center justify-center rounded-[14px] ${dark ? "bg-amora text-white" : "bg-ink text-paper"}`}
                >
                  <Icon size={26} />
                </span>
                <span className={`font-mono text-[13px] ${dark ? "text-mist" : "text-muted"}`}>0{i + 1}</span>
              </div>
              <h3 className="font-display text-[28px] font-bold tracking-[-0.02em]">{service.name}</h3>
              <p className={`leading-relaxed ${dark ? "text-mist" : "text-muted"}`}>{service.summary}</p>
              <ul className="flex flex-col gap-2.5 text-[15px]">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5">
                    <span className={dark ? "text-amora-bright" : "text-amora"} aria-hidden="true">
                      →
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                href={localePath(locale, `/services/${slug}`)}
                className={`mt-auto flex min-h-11 items-center font-semibold transition-colors ${dark ? "text-paper hover:text-amora-bright" : "hover:text-amora"}`}
              >
                {t.services.learnMore} <span className="sr-only">: {service.name}</span> →
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
