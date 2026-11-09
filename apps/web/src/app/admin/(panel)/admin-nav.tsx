"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/menus", label: "Menus" },
  { href: "/admin/settings", label: "Site settings" },
];

// On routes with an unknown param (/admin/messages/[id]) the pathname is only known at
// request time, so the nav first renders without a highlight, then streams it in.
export function AdminNav() {
  return (
    <Suspense fallback={<NavLinks pathname={null} />}>
      <NavWithPathname />
    </Suspense>
  );
}

function NavWithPathname() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Admin"
      className="flex gap-1 overflow-x-auto px-3 pb-3 text-[15px] [scrollbar-width:none] md:flex-col md:overflow-visible md:px-0 md:pb-0"
    >
      {items.map(({ href, label }) => {
        if (!href) {
          return (
            <span key={label} className="flex h-11 shrink-0 items-center justify-between gap-2 px-3 whitespace-nowrap text-mist/60">
              {label}
              <span className="rounded bg-panel px-1.5 py-0.5 font-mono text-[10px] uppercase">Soon</span>
            </span>
          );
        }
        const active = pathname !== null && (href === "/admin" ? pathname === href : pathname.startsWith(href));
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
