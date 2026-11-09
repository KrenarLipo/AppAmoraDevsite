"use client";

import { useId, useMemo, useRef, useState, useTransition } from "react";
import { readingMinutes, renderMarkdown } from "@/lib/markdown";
import { prepareImage } from "@/lib/prepare-image";

type Tool = { label: string; title: string; apply: (selected: string) => { text: string; select?: [number, number] } };

const tools: Tool[] = [
  { label: "H2", title: "Heading", apply: (s) => ({ text: `\n## ${s || "Heading"}\n`, select: [4, 4 + (s || "Heading").length] }) },
  { label: "H3", title: "Small heading", apply: (s) => ({ text: `\n### ${s || "Heading"}\n`, select: [5, 5 + (s || "Heading").length] }) },
  { label: "B", title: "Bold", apply: (s) => ({ text: `**${s || "bold text"}**`, select: [2, 2 + (s || "bold text").length] }) },
  { label: "I", title: "Italic", apply: (s) => ({ text: `*${s || "italic text"}*`, select: [1, 1 + (s || "italic text").length] }) },
  {
    label: "Link",
    title: "Link",
    apply: (s) => ({ text: `[${s || "link text"}](https://)`, select: [(s || "link text").length + 3, (s || "link text").length + 11] }),
  },
  {
    label: "• List",
    title: "Bullet list",
    apply: (s) => ({ text: "\n" + (s || "Item").split("\n").map((line) => `- ${line}`).join("\n") + "\n" }),
  },
  {
    label: "1. List",
    title: "Numbered list",
    apply: (s) => ({ text: "\n" + (s || "Item").split("\n").map((line, i) => `${i + 1}. ${line}`).join("\n") + "\n" }),
  },
  { label: "❝ Quote", title: "Quote", apply: (s) => ({ text: `\n> ${s || "Quote"}\n` }) },
];

type UploadResult = { ok: true; image: { id: string } } | { ok: false; error: string };

/** Markdown text area with a formatting toolbar, picture upload and a preview. */
export function MarkdownField({
  value,
  onChange,
  uploadImage,
  label = "Text",
  sitePreview = false,
}: {
  value: string;
  onChange: (value: string) => void;
  uploadImage: (data: FormData) => Promise<UploadResult>;
  label?: string;
  /** Preview with the client-site text style instead of AppAmora's. */
  sitePreview?: boolean;
}) {
  const uploadId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [uploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const preview = useMemo(() => (mode === "preview" ? renderMarkdown(value) : ""), [mode, value]);

  /** Replaces the selection with the tool's text, or with `keepSelection` inserts after it. */
  function insert(make: (selected: string) => { text: string; select?: [number, number] }, keepSelection = false) {
    const el = textareaRef.current;
    if (!el) return;
    const end = el.selectionEnd;
    const start = keepSelection ? end : el.selectionStart;
    const { text, select } = make(value.slice(start, end));
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const [from, to] = select ?? [text.length, text.length];
      el.setSelectionRange(start + from, start + to);
    });
  }

  function onImageChosen(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    startUpload(async () => {
      const data = new FormData();
      data.set("file", await prepareImage(file));
      const result = await uploadImage(data);
      if (fileRef.current) fileRef.current.value = "";
      if (!result.ok) {
        setUploadError(result.error);
        return;
      }
      insert(() => ({ text: `\n![Describe the picture](/media/${result.image.id})\n`, select: [3, 23] }), true);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex gap-1 text-sm">
          {(["write", "preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`h-9 rounded-lg px-3 font-semibold ${mode === m ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
            >
              {m === "write" ? "Write" : "Preview"}
            </button>
          ))}
        </div>
      </div>

      {mode === "write" ? (
        <div className="overflow-hidden rounded-[10px] border border-line-strong bg-cream focus-within:border-ink">
          <div className="flex gap-1 overflow-x-auto border-b border-line bg-white p-1.5 [scrollbar-width:none]">
            {tools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                title={tool.title}
                aria-label={tool.title}
                onClick={() => insert(tool.apply)}
                className={`h-9 shrink-0 rounded-md px-2.5 text-sm font-semibold text-ink hover:bg-sand ${tool.label === "B" ? "font-bold" : ""} ${tool.label === "I" ? "italic" : ""}`}
              >
                {tool.label}
              </button>
            ))}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              id={uploadId}
              onChange={(e) => onImageChosen(e.target.files?.[0])}
            />
            <label
              htmlFor={uploadId}
              title="Add a picture"
              className={`flex h-9 shrink-0 cursor-pointer items-center rounded-md px-2.5 text-sm font-semibold text-ink hover:bg-sand ${uploading ? "pointer-events-none opacity-50" : ""}`}
            >
              {uploading ? "Uploading…" : "🖼 Picture"}
            </label>
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={18}
            placeholder={"Start writing…\n\nTip: select words and press B to make them bold, or H2 for a section heading."}
            className="block min-h-[360px] w-full resize-y bg-transparent p-3.5 font-mono text-[14px] leading-relaxed text-ink"
          />
        </div>
      ) : (
        <div className="min-h-[360px] rounded-[10px] border border-line bg-paper p-4 sm:p-6">
          {value.trim() ? (
            <div className={sitePreview ? "site-prose" : "prose-amora"} dangerouslySetInnerHTML={{ __html: preview }} />
          ) : (
            <p className="text-muted">Nothing to preview yet.</p>
          )}
        </div>
      )}
      <div className="flex justify-between gap-3 text-xs text-muted">
        <span className="text-amora-dark">{uploadError}</span>
        <span>
          {value.trim() ? `${value.trim().split(/\s+/).length} words · ${readingMinutes(value)} min read` : ""}
        </span>
      </div>
    </div>
  );
}

