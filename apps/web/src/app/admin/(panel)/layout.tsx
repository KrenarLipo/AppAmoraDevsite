import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "./admin-nav";
import { SignOutButton } from "./sign-out-button";

// The shell renders instantly; everything that reads the session streams in behind Suspense.
// Phones: a top bar with a sideways-scrolling menu. Tablets and up: a fixed sidebar.
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col bg-paper md:flex-row">
      <aside className="sticky top-0 z-20 flex flex-col bg-ink text-paper md:h-screen md:w-60 md:shrink-0 md:gap-6 md:px-4 md:py-6">
        <div className="flex h-16 items-center justify-between gap-3 px-4 md:h-auto md:px-2">
          <Link href="/admin" aria-label="Admin home">
            <Logo tone="dark" size={28} />
          </Link>
          <div className="flex items-center gap-1 md:hidden">
            <a href="/en" target="_blank" rel="noopener" className="flex h-11 items-center px-2 text-sm text-mist">
              Website ↗
            </a>
            <SignOutButton />
          </div>
        </div>
        <AdminNav />
        <div className="mt-auto hidden flex-col gap-3 border-t border-panel-line pt-4 md:flex">
          <Suspense fallback={<span className="h-5" />}>
            <CurrentAdmin />
          </Suspense>
          <a href="/en" target="_blank" rel="noopener" className="px-2 text-sm text-mist hover:text-paper">
            View website ↗
          </a>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-8">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}

async function CurrentAdmin() {
  const admin = await requireAdmin();
  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <span className="truncate text-sm text-mist" title={admin.email}>
        {admin.email}
      </span>
      <SignOutButton />
    </div>
  );
}
