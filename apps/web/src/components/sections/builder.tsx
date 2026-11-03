import { ButtonLink } from "@/components/button-link";
import { getDictionary, getLocale } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { templates } from "@/lib/catalog";
import { SectionHeading } from "./section-heading";
import { TemplateCard } from "./template-card";

/** Dark section presenting the website builder: the six templates and its main features. */
export async function BuilderSection() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <section id="templates" className="bg-ink text-paper">
      <div className="container-page flex flex-col gap-14 py-24">
        <SectionHeading
          tone="dark"
          eyebrow={t.builder.eyebrow}
          title={t.builder.title}
          body={t.builder.subtitle}
          action={
            <ButtonLink href={localePath(locale, "/templates")} variant="light">
              {t.builder.cta} →
            </ButtonLink>
          }
        />
        <TemplateGrid defaultBadge={t.builder.defaultBadge} names={t.templates} />
        <FeatureStrip features={t.builder.features} />
      </div>
    </section>
  );
}

export function TemplateGrid({
  names,
  defaultBadge,
}: {
  names: Record<(typeof templates)[number]["id"], { name: string; description: string }>;
  defaultBadge: string;
}) {
  return (
    <div className="flex flex-wrap gap-5">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          name={names[template.id].name}
          description={names[template.id].description}
          defaultBadge={defaultBadge}
        />
      ))}
    </div>
  );
}

export function FeatureStrip({ features }: { features: { title: string; body: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-px overflow-hidden rounded-2xl border border-panel-line bg-panel-line">
      {features.map((feature) => (
        <li key={feature.title} className="flex flex-[1_1_220px] flex-col gap-2 bg-ink p-6">
          <span className="font-display text-lg font-semibold">{feature.title}</span>
          <span className="text-sm leading-normal text-mist">{feature.body}</span>
        </li>
      ))}
    </ul>
  );
}
