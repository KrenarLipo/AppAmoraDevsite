import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/button-link";
import { CheckIcon } from "@/components/icons";
import { serviceIcons } from "@/components/sections/services";
import { getDictionary, getLocale } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { isServiceSlug, serviceSlugs } from "@/lib/catalog";
import { jsonLd, pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!isServiceSlug(slug)) return {};
  const locale = await getLocale();
  const service = (await getDictionary(locale)).services.items[slug];
  return pageMetadata({ locale, path: `/services/${slug}`, title: service.name, description: service.summary });
}

export default async function ServicePage({ params }: PageProps<"/[locale]/services/[slug]">) {
  const { slug } = await params;
  if (!isServiceSlug(slug)) notFound();

  const locale = await getLocale();
  const t = await getDictionary(locale);
  const service = t.services.items[slug];
  const Icon = serviceIcons[slug];
  const contactHref = localePath(locale, "/contact");

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    areaServed: "Europe",
    availableLanguage: ["en", "it", "sq", "de", "fr"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <section className="container-page flex flex-wrap gap-14 pt-16 pb-24">
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-6">
          <Link href={localePath(locale, "/services")} className="eyebrow text-amora hover:underline">
            ← {t.nav.services}
          </Link>
          <span className="flex size-16 items-center justify-center rounded-2xl bg-ink text-paper">
            <Icon size={32} />
          </span>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[1.03] font-bold tracking-[-0.035em]">
            {service.name}
          </h1>
          <p className="text-xl leading-relaxed text-ink">{service.summary}</p>
          <p className="text-[17px] leading-[1.75] text-muted">{service.description}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href={contactHref}>{t.services.bookCall}</ButtonLink>
          </div>
        </div>
        <aside className="flex-[1_1_360px] self-start rounded-[18px] bg-ink p-8 text-paper">
          <h2 className="eyebrow mb-6 text-amora-bright">{t.services.whatYouGet}</h2>
          <ul className="flex flex-col gap-4">
            {service.deliverables.map((item) => (
              <li key={item} className="flex gap-3 leading-snug">
                <CheckIcon size={20} className="mt-0.5 shrink-0 text-amora-bright" />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="container-page pb-24">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-line bg-white p-10">
          <div className="flex max-w-xl flex-col gap-2">
            <h2 className="font-display text-3xl font-bold tracking-tight">{t.services.ctaTitle}</h2>
            <p className="text-muted">{t.services.ctaBody}</p>
          </div>
          <ButtonLink href={contactHref} variant="dark">
            {t.services.ctaButton} →
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
