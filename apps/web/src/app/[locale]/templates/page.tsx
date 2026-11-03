import type { Metadata } from "next";
import { ButtonLink } from "@/components/button-link";
import { FeatureStrip, TemplateGrid } from "@/components/sections/builder";
import { SectionHeading } from "@/components/sections/section-heading";
import { StepsSection } from "@/components/sections/steps";
import { getDictionary, getLocale } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { pageMetadata } from "@/lib/metadata";
import { trialPath } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return pageMetadata({
    locale,
    path: "/templates",
    title: t.templatesPage.title,
    description: t.templatesPage.subtitle,
  });
}

export default async function TemplatesPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <>
      <section className="bg-ink text-paper">
        <div className="container-page flex flex-col gap-14 pt-16 pb-24">
          <SectionHeading
            as="h1"
            tone="dark"
            eyebrow={t.builder.eyebrow}
            title={t.templatesPage.title}
            body={t.templatesPage.subtitle}
          />
          <TemplateGrid names={t.templates} defaultBadge={t.builder.defaultBadge} />
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-panel-line p-6">
            <p className="text-mist">{t.templatesPage.comingSoon}</p>
            <ButtonLink href={localePath(locale, trialPath)}>{t.templatesPage.waitlist}</ButtonLink>
          </div>
          <FeatureStrip features={t.builder.features} />
        </div>
      </section>
      <StepsSection />
    </>
  );
}
