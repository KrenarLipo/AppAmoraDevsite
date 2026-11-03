import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n";
import { fontVariables } from "@/lib/fonts";
import { pageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t.meta.title, template: "%s · AppAmora" },
    ...(await pageMetadata({ locale, path: "/", description: t.meta.description })),
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
