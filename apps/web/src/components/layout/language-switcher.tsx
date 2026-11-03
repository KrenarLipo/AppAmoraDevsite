"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

/** Saved for a year so the proxy sends returning visitors to the same language. */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

type Props = {
  locale: Locale;
  label: string;
  names: Record<Locale, string>;
};

export function LanguageSwitcher({ locale, label, names }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Swap the first path segment, keeping the rest of the URL.
  const hrefFor = (target: Locale) => pathname.replace(/^\/[^/]+/, `/${target}`);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-1.5 rounded-lg border border-line-strong px-3 font-mono text-[13px] uppercase transition-colors hover:border-ink"
      >
        {locale}
        <ChevronDownIcon size={14} />
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 min-w-40 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg">
          {locales.map((target) => (
            <li key={target}>
              {/* A plain <a>: switching locale changes the root layout, so a full load is expected. */}
              <a
                href={hrefFor(target)}
                hrefLang={target}
                lang={target}
                aria-current={target === locale ? "true" : undefined}
                onClick={() => rememberLocale(target)}
                className={`flex h-11 items-center justify-between gap-4 px-4 text-[15px] hover:bg-paper ${target === locale ? "font-semibold" : ""}`}
              >
                {names[target]}
                <span className="font-mono text-xs text-muted uppercase">{target}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
