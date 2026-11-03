import type { Metadata } from "next";
import { PricingSection } from "@/components/sections/pricing";
import { getDictionary, getLocale } from "@/i18n";
import { jsonLd, pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return pageMetadata({ locale, path: "/pricing", title: t.nav.pricing, description: t.pricing.subtitle });
}

export default async function PricingPage() {
  const t = await getDictionary();

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.pricing.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faq)} />
      <PricingSection withFaq headingAs="h1" />
    </>
  );
}
