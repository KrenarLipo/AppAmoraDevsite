import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm, ContactFormFromQuery } from "@/components/contact-form";
import { MailIcon } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getSiteInfo } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return pageMetadata({ locale, path: "/contact", title: t.nav.contact, description: t.contact.subtitle });
}

export default async function ContactPage() {
  const locale = await getLocale();
  const [t, info] = await Promise.all([getDictionary(locale), getSiteInfo()]);
  const formProps = { locale, labels: t.contact.form, interests: t.contact.interests };

  return (
    <section className="container-page pt-16 pb-24">
      <div className="flex flex-wrap gap-12 rounded-3xl border border-line bg-white p-8 md:p-12">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-5">
          <p className="eyebrow text-amora">{t.contact.eyebrow}</p>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
            {t.contact.title}
          </h1>
          <p className="text-lg text-muted">{t.contact.subtitle}</p>
          <p className="mt-auto flex flex-wrap items-center gap-2 pt-6 text-muted">
            <MailIcon size={20} className="text-ink" />
            {t.contact.emailUs}
            <a href={`mailto:${info.contact.email}`} className="font-semibold text-ink underline decoration-amora decoration-2 underline-offset-4">
              {info.contact.email}
            </a>
          </p>
        </div>
        <div className="relative min-w-0 flex-[1_1_400px]">
          {/* The query string is only known in the browser, so the prerendered form starts without it. */}
          <Suspense fallback={<ContactForm {...formProps} />}>
            <ContactFormFromQuery {...formProps} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
