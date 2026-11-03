import { ButtonLink } from "@/components/button-link";
import { getDictionary, getLocale } from "@/i18n";
import { localePath } from "@/i18n/utils";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getDictionary(locale);

  return (
    <section className="container-page flex flex-col items-start gap-6 py-32">
      <p className="eyebrow text-amora">404</p>
      <h1 className="font-display text-5xl font-bold tracking-[-0.03em]">{t.notFound.title}</h1>
      <p className="text-lg text-muted">{t.notFound.body}</p>
      <ButtonLink href={localePath(locale)} variant="dark">
        {t.notFound.home}
      </ButtonLink>
    </section>
  );
}
