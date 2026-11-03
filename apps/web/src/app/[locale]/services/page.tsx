import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/cta-band";
import { ServicesSection } from "@/components/sections/services";
import { getDictionary, getLocale } from "@/i18n";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return pageMetadata({ locale, path: "/services", title: t.nav.services, description: t.services.title });
}

export default function ServicesPage() {
  return (
    <>
      <ServicesSection headingAs="h1" />
      <CtaBand />
    </>
  );
}
