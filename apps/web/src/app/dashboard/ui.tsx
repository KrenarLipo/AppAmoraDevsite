"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import type { StoredImage } from "@/lib/media";
import { prepareImage } from "@/lib/prepare-image";
import { siteLanguageNames, type SiteLanguage } from "@/lib/sites/languages";
import { uploadSiteImage, type Result } from "./actions";

export const inputClass =
  "h-11 w-full min-w-0 rounded-[10px] border border-line-strong bg-cream px-3 text-[15px] text-ink transition-colors focus:border-ink disabled:opacity-60";
export const cardClass = "flex flex-col gap-4 rounded-2xl border border-line bg-white p-5";
export const buttonClass =
  "flex h-11 cursor-pointer items-center justify-center rounded-[10px] px-4 text-[15px] font-semibold transition-colors disabled:cursor-default disabled:opacity-50";

export function Card({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className={cardClass}>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

/** Shown on features the current plan doesn't include. */
export function UpgradeNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-sand px-4 py-3 text-sm">
      <span aria-hidden>🔒</span>
      <span>{children}</span>
      <Link href="/dashboard/billing" className="font-semibold underline decoration-amora underline-offset-4">
        See plans
      </Link>
    </p>
  );
}

/** The fixed bar at the bottom of an edit page, with unsaved-changes warning. */
export function SaveBar({ dirty, pending, onSave, message, label = "Save changes", disabled }: {
  dirty: boolean;
  pending: boolean;
  onSave: () => void;
  message: { ok: boolean; text: string } | null;
  label?: string;
  disabled?: boolean;
}) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:left-60">
      <div className="flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 md:px-10">
        <button
          type="button"
          onClick={onSave}
          disabled={pending || !dirty || disabled}
          className={`${buttonClass} bg-amora px-6 text-white hover:bg-amora-dark`}
        >
          {pending ? "Saving…" : label}
        </button>
        <span role="status" className="min-w-0 flex-1 text-sm font-medium">
          {message && (!message.ok || !dirty) ? (
            <span className={message.ok ? "text-[#0F7A50]" : "text-amora-dark"}>{message.text}</span>
          ) : dirty ? (
            <span className="font-normal text-muted">Unsaved changes</span>
          ) : null}
        </span>
      </div>
    </div>
  );
}

/** Form state with a saved snapshot, a save action and a status message. */
export function useEditor<T>(initial: T, save: (value: T) => Promise<Result | { ok: true; id: string }>) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  return {
    value,
    setValue,
    dirty: JSON.stringify(value) !== saved,
    pending,
    message,
    save: (successText = "Saved. Your website is updated.") =>
      startTransition(async () => {
        setMessage(null);
        const result = await save(value);
        if (result.ok) {
          setSaved(JSON.stringify(value));
          setMessage({ ok: true, text: successText });
        } else setMessage({ ok: false, text: result.error });
      }),
  };
}

export function ImageUpload({
  kind,
  label,
  onUploaded,
  disabled,
}: {
  kind: "logo" | "slide" | "page";
  label: string;
  onUploaded: (image: StoredImage) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const id = `upload-${kind}-${label.replace(/\W/g, "")}`;

  function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const data = new FormData();
      data.set("file", await prepareImage(file));
      const result = await uploadSiteImage(kind, data);
      if (inputRef.current) inputRef.current.value = "";
      if (result.ok) onUploaded(result.image);
      else setError(result.error);
    });
  }

  return (
    <span className="flex flex-col gap-1">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="sr-only"
        disabled={disabled || pending}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <label
        htmlFor={id}
        className={`${buttonClass} bg-ink text-paper hover:bg-panel ${disabled || pending ? "pointer-events-none opacity-50" : ""}`}
      >
        {pending ? "Uploading…" : label}
      </label>
      {error && (
        <span role="alert" className="text-sm text-amora-dark">
          {error}
        </span>
      )}
    </span>
  );
}

export function LanguageTabs({
  languages,
  active,
  onChange,
  filled,
}: {
  languages: SiteLanguage[];
  active: SiteLanguage;
  onChange: (language: SiteLanguage) => void;
  filled: (language: SiteLanguage) => boolean;
}) {
  if (languages.length < 2) return null;
  return (
    <div role="tablist" aria-label="Language" className="flex gap-1 overflow-x-auto rounded-xl bg-sand p-1">
      {languages.map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={active === l}
          onClick={() => onChange(l)}
          className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold whitespace-nowrap ${active === l ? "bg-white shadow-sm" : "text-muted hover:text-ink"}`}
        >
          {siteLanguageNames[l]}
          <span className={`size-2 rounded-full ${filled(l) ? "bg-[#0F7A50]" : "bg-line-strong"}`} />
        </button>
      ))}
    </div>
  );
}
