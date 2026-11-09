"use client";

import { useState } from "react";

type Item = { href: string; label: string; active: boolean };
type Language = { code: string; name: string; href: string; active: boolean };

export function SiteMenu({ items, languages, labels }: { items: Item[]; languages: Language[]; labels: { menu: string; close: string } }) {
  const [open, setOpen] = useState(false);
  const languageLinks = languages.length > 1 && (
    <div className="flex gap-1 text-sm">
      {languages.map((l) => (
        <a
          key={l.code}
          href={l.href}
          hrefLang={l.code}
          lang={l.code}
          title={l.name}
          aria-current={l.active ? "true" : undefined}
          className={`flex h-9 min-w-9 items-center justify-center rounded-(--site-radius) px-2 font-semibold uppercase ${l.active ? "bg-(--site-text)/10" : "text-(--site-muted) hover:text-(--site-text)"}`}
        >
          {l.code}
        </a>
      ))}
    </div>
  );

  return (
    <>
      <nav className="hidden items-center gap-6 md:flex">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`font-medium transition-colors ${item.active ? "text-(--site-primary)" : "hover:text-(--site-primary)"}`}
          >
            {item.label}
          </a>
        ))}
        {languageLinks}
      </nav>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        className="flex h-11 items-center gap-2 rounded-(--site-radius) border border-(--site-text)/15 px-4 text-sm font-semibold md:hidden"
      >
        {open ? labels.close : labels.menu}
      </button>
      {open && (
        <div id="site-mobile-menu" className="absolute inset-x-0 top-full border-b border-(--site-text)/10 bg-(--site-bg) md:hidden">
          <nav className="flex flex-col px-4 py-3">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={item.active ? "page" : undefined}
                className={`flex h-12 items-center border-b border-(--site-text)/10 text-lg font-medium ${item.active ? "text-(--site-primary)" : ""}`}
              >
                {item.label}
              </a>
            ))}
            {languageLinks && <div className="pt-3">{languageLinks}</div>}
          </nav>
        </div>
      )}
    </>
  );
}
