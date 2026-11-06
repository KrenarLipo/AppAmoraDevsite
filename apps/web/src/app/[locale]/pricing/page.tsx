import type { Metadata } from "next";
import { PricingSection } from "@/components/sections/pricing";
import { getDictionary, getLocale } from "@/i18n";
import { format } from "@/i18n/utils";
import { jsonLd, pageMetadata } from "@/lib/metadata";
import { getSiteInfo } from "@/lib/settings";
import { priceValues } from "@/lib/settings/site-info";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return pageMetadata({ locale, path: "/pricing", title: t.nav.pricing, description: t.pricing.subtitle });
}

export default async function PricingPage() {
  const locale = await getLocale();
  const [t, info] = await Promise.all([getDictionary(locale), getSiteInfo()]);
  const values = priceValues(info, locale);

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.pricing.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: format(item.a, values) },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faq)} />
      <PricingSection withFaq headingAs="h1" />
    </>
  );
}
