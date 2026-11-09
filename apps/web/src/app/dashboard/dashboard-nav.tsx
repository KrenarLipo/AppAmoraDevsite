"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/design", label: "Design" },
  { href: "/dashboard/home", label: "Home page" },
  { href: "/dashboard/pages", label: "Pages" },
  { href: "/dashboard/details", label: "Contact & languages" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/subscribers", label: "Subscribers" },
  { href: "/dashboard/billing", label: "Plan & billing" },
];

export function DashboardNav() {
  return (
    <Suspense fallback={<NavLinks pathname={null} />}>
      <WithPathname />
    </Suspense>
  );
}

function WithPathname() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Dashboard"
      className="flex gap-1 overflow-x-auto px-3 pb-3 text-[15px] [scrollbar-width:none] md:flex-col md:overflow-visible md:px-0 md:pb-0"
    >
      {items.map(({ href, label }) => {
        const active = pathname !== null && (href === "/dashboard" ? pathname === href : pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-11 shrink-0 items-center rounded-[10px] px-3 font-medium whitespace-nowrap transition-colors ${active ? "bg-panel-line text-white" : "text-mist hover:text-paper"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
