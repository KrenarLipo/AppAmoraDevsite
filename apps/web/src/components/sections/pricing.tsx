import { ButtonLink } from "@/components/button-link";
import { CheckIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n";
import { format, localePath } from "@/i18n/utils";
import { plans, type PlanId } from "@/lib/catalog";
import { getSiteInfo } from "@/lib/settings";
import { formatEur, priceValues } from "@/lib/settings/site-info";
import { trialPath } from "@/lib/site";
import { SectionHeading } from "./section-heading";

export async function PricingSection({ withFaq = false, headingAs = "h2" }: { withFaq?: boolean; headingAs?: "h1" | "h2" }) {
  const locale = await getLocale();
  const [t, info] = await Promise.all([getDictionary(locale), getSiteInfo()]);
  const values = priceValues(info, locale);
  const prices: Record<PlanId, number | null> = { starter: info.pricing.starter, pro: info.pricing.pro, custom: null };

  const ctaHref: Record<PlanId, string> = {
    starter: localePath(locale, trialPath),
    pro: localePath(locale, trialPath),
    custom: localePath(locale, "/contact"),
  };

  return (
    <section id="pricing" className="bg-sand">
      <div className="container-page flex flex-col gap-12 py-24">
        <SectionHeading
          as={headingAs}
          align="center"
          eyebrow={t.pricing.eyebrow}
          title={t.pricing.title}
          body={t.pricing.subtitle}
        />
        <div className="flex flex-wrap items-stretch gap-5">
          {(Object.keys(plans) as PlanId[]).map((id) => {
            const plan = plans[id];
            const copy = t.pricing.plans[id];
            const dark = plan.highlighted;
            return (
              <article
                key={id}
                className={`relative flex flex-[1_1_320px] flex-col gap-5 rounded-[18px] p-8 ${dark ? "bg-ink text-paper" : "border border-line bg-white"}`}
              >
                {dark && (
                  <span className="absolute top-6 right-6 rounded-md bg-amora px-2.5 py-1 font-mono text-[11px] text-white uppercase">
                    {t.pricing.mostPopular}
                  </span>
                )}
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display text-[22px] font-bold">{copy.name}</h3>
                  <p className={`text-[15px] ${dark ? "text-mist" : "text-muted"}`}>{copy.tagline}</p>
                </div>
                {prices[id] !== null ? (
                  <p className="font-display text-5xl font-bold tracking-[-0.03em]">
                    {formatEur(prices[id], locale)}
                    <span className={`font-sans text-base font-medium tracking-normal ${dark ? "text-mist" : "text-muted"}`}>
                      {" "}
                      {t.pricing.perMonth}
                    </span>
                  </p>
                ) : (
                  <p className="flex flex-col gap-1.5">
                    <span className="font-display text-5xl font-bold tracking-[-0.03em]">{t.pricing.plans.custom.price}</span>
                    <span className="text-[15px] font-medium text-muted">{t.pricing.plans.custom.priceNote}</span>
                  </p>
                )}
                <ul className="flex flex-col gap-3 text-[15px]">
                  {copy.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <CheckIcon size={18} className={`mt-0.5 shrink-0 ${dark ? "text-amora-bright" : "text-amora"}`} />
                      {format(feature, values)}
                    </li>
                  ))}
                </ul>
                <ButtonLink href={ctaHref[id]} variant={dark ? "primary" : "outline"} className="mt-auto">
                  {copy.cta}
                </ButtonLink>
              </article>
            );
          })}
        </div>

        {withFaq && (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pt-8">
            <h2 className="font-display text-3xl font-bold tracking-tight">{t.pricing.faqTitle}</h2>
            {t.pricing.faq.map((item) => (
              <details key={item.q} className="group rounded-xl border border-line bg-white px-6 open:pb-5">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {item.q}
                  <span className="text-xl text-amora transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="leading-relaxed text-muted">{format(item.a, values)}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
