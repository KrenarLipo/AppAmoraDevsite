import { ButtonLink } from "@/components/button-link";
import { getDictionary, getLocale } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { trialPath } from "@/lib/site";

export async function CtaBand() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <section className="container-page pb-24">
      <div className="relative flex flex-wrap items-center justify-between gap-8 overflow-hidden rounded-3xl bg-ink p-10 text-paper md:p-14">
        <span
          aria-hidden="true"
          className="absolute -right-24 -bottom-24 size-72 rounded-full border-[40px] border-amora"
        />
        <div className="relative flex max-w-xl flex-col gap-3">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-bold tracking-[-0.03em]">
            {t.ctaBand.title}
          </h2>
          <p className="text-lg text-mist">{t.ctaBand.body}</p>
        </div>
        <div className="relative flex flex-wrap gap-3">
          <ButtonLink href={localePath(locale, trialPath)}>{t.ctaBand.primary}</ButtonLink>
          <ButtonLink href={localePath(locale, "/contact")} variant="ghostDark">
            {t.ctaBand.secondary}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
