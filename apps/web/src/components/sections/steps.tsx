import { getDictionary } from "@/i18n";
import { SectionHeading } from "./section-heading";

export async function StepsSection() {
  const t = await getDictionary();

  return (
    <section className="container-page flex flex-col gap-12 py-24">
      <SectionHeading eyebrow={t.steps.eyebrow} title={t.steps.title} />
      <ol className="flex flex-wrap gap-5">
        {t.steps.items.map((step, i) => (
          <li key={step.title} className="flex flex-[1_1_300px] flex-col gap-3 border-t-2 border-ink pt-6">
            <span className="font-mono text-sm text-amora uppercase">
              {t.steps.stepLabel} 0{i + 1}
            </span>
            <h3 className="font-display text-2xl font-bold">{step.title}</h3>
            <p className="leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
