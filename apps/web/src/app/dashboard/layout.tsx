import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { siteFontVariables } from "@/lib/sites/fonts";
import { AccountBanner, CurrentUser } from "./account-banner";
import { DashboardNav } from "./dashboard-nav";
import { DashboardSignOut } from "./sign-out";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · AppAmora" },
  robots: { index: false, follow: false },
};

// The client dashboard is its own root layout. The shell renders instantly;
// everything that reads the session streams in behind Suspense.
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <html lang="en" className={siteFontVariables}>
      <body className="min-h-screen">
        <div className="flex min-h-screen flex-col bg-paper md:flex-row">
          <aside className="sticky top-0 z-20 flex flex-col bg-ink text-paper md:h-screen md:w-60 md:shrink-0 md:gap-6 md:px-4 md:py-6">
            <div className="flex h-16 items-center justify-between gap-3 px-4 md:h-auto md:px-2">
              <Link href="/dashboard" aria-label="Dashboard home">
                <Logo tone="dark" size={28} />
              </Link>
              <div className="md:hidden">
                <DashboardSignOut />
              </div>
            </div>
            <DashboardNav />
            <div className="mt-auto hidden flex-col gap-3 border-t border-panel-line pt-4 md:flex">
              <Suspense fallback={<span className="h-5" />}>
                <CurrentUser />
              </Suspense>
            </div>
          </aside>
          <main className="min-w-0 flex-1">
            <Suspense fallback={null}>
              <AccountBanner />
            </Suspense>
            <div className="px-4 py-6 sm:px-6 md:px-10 md:py-8">
              <Suspense fallback={<p className="text-muted">Loading…</p>}>{children}</Suspense>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
