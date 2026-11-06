import { BlogTeaser } from "@/components/sections/blog-teaser";
import { BuilderSection } from "@/components/sections/builder";
import { CtaBand } from "@/components/sections/cta-band";
import { Hero } from "@/components/sections/hero";
import { PricingSection } from "@/components/sections/pricing";
import { ServicesSection } from "@/components/sections/services";
import { StepsSection } from "@/components/sections/steps";
import { getDictionary } from "@/i18n";
import { jsonLd } from "@/lib/metadata";
import { getSiteInfo } from "@/lib/settings";
import { activeSocialLinks } from "@/lib/settings/site-info";
import { siteConfig } from "@/lib/site";

export default async function HomePage() {
  const [t, info] = await Promise.all([getDictionary(), getSiteInfo()]);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    email: info.contact.email,
    ...(info.contact.phone && { telephone: info.contact.phone }),
    description: t.meta.description,
    sameAs: activeSocialLinks(info).map((link) => link.href),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organization)} />
      <Hero />
      <ServicesSection />
      <BuilderSection />
      <StepsSection />
      <PricingSection />
      <BlogTeaser />
      <CtaBand />
    </>
  );
}
