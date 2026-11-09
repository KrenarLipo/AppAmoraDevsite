import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { getDictionary, getLocale } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { googleEnabled } from "@/lib/auth";
import { trialPath } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.auth.metaTitle, robots: { index: false, follow: true } };
}

export default async function LoginPage() {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const formProps = {
    labels: t.auth,
    // Clients land in their dashboard; the dashboard sends admins on to /admin.
    callbackURL: "/dashboard",
    loginPath: localePath(locale, "/login"),
    googleEnabled,
    recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  };

  return (
    <section className="container-page py-10 md:py-16">
      <div className="flex flex-wrap overflow-hidden rounded-3xl border border-line bg-white">
        <div className="relative flex min-h-[220px] flex-[1_1_380px] flex-col justify-end gap-4 overflow-hidden bg-ink p-8 text-paper md:p-12">
          <span aria-hidden="true" className="absolute -top-24 -right-24 size-80 rounded-full border-[48px] border-amora" />
          <p className="relative max-w-sm font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-bold tracking-[-0.03em]">
            {t.auth.panelTitle}
          </p>
          <p className="relative max-w-sm text-mist">{t.auth.panelBody}</p>
        </div>

        <div className="flex flex-[1_1_420px] justify-center px-6 py-10 md:px-12 md:py-14">
          <div className="flex w-full max-w-[400px] flex-col gap-7">
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-3xl font-bold tracking-tight">{t.auth.title}</h1>
              <p className="text-muted">{t.auth.subtitle}</p>
            </div>
            {/* The form reads ?error= from the URL, which is only known at request time. */}
            <Suspense fallback={<LoginForm {...formProps} />}>
              <LoginForm {...formProps} readError />
            </Suspense>
            <p className="text-[15px] text-muted">
              {t.auth.noAccount}{" "}
              <Link href={localePath(locale, trialPath)} className="font-semibold text-ink underline decoration-amora decoration-2 underline-offset-4">
                {t.auth.startTrial}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
