"use client";

import Link from "next/link";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { NavLink } from "./nav-link";

type Props = {
  links: { id: string; href: string; label: string; external: boolean }[];
  cta: { href: string; label: string };
  login: { href: string; label: string };
  openLabel: string;
  closeLabel: string;
};

export function MobileMenu({ links, cta, login, openLabel, closeLabel }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex size-11 items-center justify-center rounded-lg border border-line-strong"
      >
        {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="absolute inset-x-0 top-[72px] max-h-[calc(100dvh-72px)] overflow-y-auto border-b border-line bg-paper px-6 pt-2 pb-6 shadow-lg"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.id}>
                <NavLink
                  {...link}
                  onClick={close}
                  className="flex h-12 items-center border-b border-line font-display text-lg font-semibold"
                />
              </li>
            ))}
          </ul>
          <Link
            href={cta.href}
            onClick={close}
            className="mt-5 flex h-[52px] items-center justify-center rounded-xl bg-amora font-semibold text-white"
          >
            {cta.label}
          </Link>
          <Link
            href={login.href}
            onClick={close}
            className="mt-3 flex h-[52px] items-center justify-center rounded-xl border-[1.5px] border-ink font-semibold"
          >
            {login.label}
          </Link>
        </nav>
      )}
    </div>
  );
}
