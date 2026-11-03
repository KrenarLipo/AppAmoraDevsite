"use client";

import Image from "next/image";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { locales } from "@/i18n/config";
import { prepareImage } from "@/lib/prepare-image";
import { mediaUrl, type ImageRef } from "@/lib/settings/schema";
import { removeImage, saveImageAlt, uploadImage, type ActionResult } from "./actions";

type Props = {
  target: string;
  title: string;
  description: string;
  image: ImageRef;
  /** Shown when nothing is uploaded, e.g. "Using the built-in logo". */
  emptyLabel: string;
  /** Ask for a description of the image (for screen readers and SEO). */
  withAlt?: boolean;
  /** Preview the image on a dark background (for the dark-background logo). */
  darkPreview?: boolean;
  /** CSS aspect ratio for the preview box, e.g. "1200 / 630". */
  aspect?: string;
};

const languageNames = { en: "English", it: "Italian", sq: "Albanian" } as const;

const buttonClass =
  "flex h-11 cursor-pointer items-center justify-center rounded-[10px] px-4 text-[15px] font-semibold transition-colors disabled:cursor-default disabled:opacity-50";

export function ImageSlot({ target, title, description, image, emptyLabel, withAlt, darkPreview, aspect = "16 / 10" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const report = (result: ActionResult, success: string) =>
    setStatus(result.ok ? { type: "success", text: success } : { type: "error", text: result.error });

  function onFileChosen(file: File | undefined) {
    if (!file) return;
    setStatus(null);
    startTransition(async () => {
      const prepared = await prepareImage(file);
      const data = new FormData();
      data.set("file", prepared);
      report(await uploadImage(target, data), "Image saved. It's live on the site.");
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function onRemove() {
    if (!confirm(`Remove the ${title.toLowerCase()}?`)) return;
    startTransition(async () => report(await removeImage(target), "Image removed."));
  }

  function onSaveAlt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const alt = Object.fromEntries(locales.map((l) => [l, String(form.get(`alt-${l}`) ?? "")]));
    startTransition(async () => report(await saveImageAlt(target, alt), "Description saved."));
  }

  const inputId = `upload-${target.replace(/[^a-z0-9]/gi, "-")}`;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>

      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-line ${darkPreview ? "bg-ink" : "bg-cream"}`}
        style={{ aspectRatio: aspect }}
      >
        {image ? (
          <Image src={mediaUrl(image)} alt="" fill sizes="(min-width: 768px) 400px, 100vw" className="object-contain p-2" />
        ) : (
          <span className={`px-4 text-center text-sm ${darkPreview ? "text-mist" : "text-muted"}`}>{emptyLabel}</span>
        )}
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold">Working…</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="sr-only"
          disabled={pending}
          onChange={(e) => onFileChosen(e.target.files?.[0])}
        />
        <label htmlFor={inputId} className={`${buttonClass} bg-ink text-paper hover:bg-panel ${pending ? "pointer-events-none opacity-50" : ""}`}>
          {image ? "Replace image" : "Upload image"}
        </label>
        {image && (
          <button type="button" onClick={onRemove} disabled={pending} className={`${buttonClass} border border-line-strong text-amora-dark hover:border-amora-dark`}>
            Remove
          </button>
        )}
      </div>

      {status && (
        <p role={status.type === "error" ? "alert" : "status"} className={`text-sm font-medium ${status.type === "error" ? "text-amora-dark" : "text-[#0F7A50]"}`}>
          {status.text}
        </p>
      )}

      {withAlt && image && (
        <form onSubmit={onSaveAlt} className="flex flex-col gap-3 border-t border-line pt-4">
          <p className="text-sm font-semibold">
            Image description <span className="font-normal text-muted">(read by screen readers and Google)</span>
          </p>
          {locales.map((l) => (
            <label key={l} className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{languageNames[l]}</span>
              <input
                name={`alt-${l}`}
                defaultValue={image.alt?.[l] ?? ""}
                maxLength={200}
                className="h-11 rounded-[10px] border border-line-strong bg-cream px-3 text-[15px] focus:border-ink"
              />
            </label>
          ))}
          <button type="submit" disabled={pending} className={`${buttonClass} self-start border border-line-strong hover:border-ink`}>
            Save description
          </button>
        </form>
      )}
    </article>
  );
}
