"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { locales, type Locale } from "@/i18n/config";
import type { PostInput, PostTranslation } from "@/lib/blog-admin";
import { readingMinutes, renderMarkdown } from "@/lib/markdown";
import { prepareImage } from "@/lib/prepare-image";
import { mediaUrl } from "@/lib/settings/schema";
import { deletePost, savePost, uploadPostImage } from "./actions";
import { StatusBadge } from "./status-badge";

const languageNames: Record<Locale, string> = { en: "English", it: "Italian", sq: "Albanian" };

const inputClass =
  "h-11 w-full rounded-[10px] border border-line-strong bg-cream px-3 text-[15px] text-ink transition-colors focus:border-ink";
const cardClass = "flex flex-col gap-3 rounded-2xl border border-line bg-white p-5";
const buttonClass =
  "flex h-11 cursor-pointer items-center justify-center rounded-[10px] px-4 text-[15px] font-semibold transition-colors disabled:cursor-default disabled:opacity-50";

/** "Ç'është AI SEO?" → "cesht-ai-seo" style web addresses. */
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

type Message = { type: "error" | "success"; lines: string[] };

export function PostEditor({ initial }: { initial: PostInput }) {
  const router = useRouter();
  const [post, setPost] = useState<PostInput>(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [locale, setLocale] = useState<Locale>("en");
  // New posts get their web address from the English title until it's edited by hand.
  const [slugTouched, setSlugTouched] = useState(initial.id !== null);
  const [message, setMessage] = useState<Message | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(post) !== saved;
  const isNew = post.id === null;
  const wasPublished = !isNew && JSON.parse(saved).status === "PUBLISHED";
  const savedSlug: string = JSON.parse(saved).slug;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update(patch: Partial<PostInput>) {
    setPost((p) => ({ ...p, ...patch }));
  }

  function updateText(l: Locale, patch: Partial<PostTranslation>) {
    setPost((p) => {
      const translations = { ...p.translations, [l]: { ...p.translations[l], ...patch } };
      const slug = l === "en" && patch.title !== undefined && !slugTouched ? slugify(patch.title) : p.slug;
      return { ...p, translations, slug };
    });
  }

  function save() {
    const next = post;
    const status = post.status;
    setMessage(null);
    startTransition(async () => {
      const result = await savePost(next);
      if (!result.ok) {
        setMessage({ type: "error", lines: result.errors });
        return;
      }
      const stored = { ...next, id: result.id };
      setPost(stored);
      setSaved(JSON.stringify(stored));
      setSlugTouched(true);
      setMessage({
        type: "success",
        lines: [status === "PUBLISHED" ? "Saved. The post is live on the website." : "Saved as a draft. Only you can see it."],
      });
      if (isNew) router.replace(`/admin/blog/${result.id}`);
    });
  }

  function remove() {
    if (!post.id || !confirm("Delete this post in all languages? This can't be undone.")) return;
    const id = post.id;
    startTransition(async () => {
      await deletePost(id);
      setSaved(JSON.stringify(post)); // nothing left to warn about
      router.push("/admin/blog");
    });
  }

  const filled = (l: Locale) => post.translations[l].title.trim() !== "" || post.translations[l].body.trim() !== "";

  return (
    <div className="flex max-w-6xl flex-col gap-6 pb-28">
      <div className="flex flex-col gap-2">
        <Link href="/admin/blog" className="text-sm font-medium text-muted hover:text-ink">
          ← All posts
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight">{isNew ? "New post" : "Edit post"}</h1>
          {!isNew && <StatusBadge status={JSON.parse(saved).status} />}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Text, per language */}
        <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-white p-4 sm:p-5">
          <div role="tablist" aria-label="Language" className="flex gap-1 rounded-xl bg-sand p-1">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={locale === l}
                onClick={() => setLocale(l)}
                className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${locale === l ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
              >
                <span className="sm:hidden">{l.toUpperCase()}</span>
                <span className="hidden sm:inline">{languageNames[l]}</span>
                <span
                  aria-label={filled(l) ? "has text" : "empty"}
                  className={`size-2 rounded-full ${filled(l) ? "bg-[#0F7A50]" : "bg-line-strong"}`}
                />
              </button>
            ))}
          </div>

          {locale !== "en" && !filled(locale) && (
            <p className="rounded-lg bg-cream px-3 py-2 text-sm text-muted">
              Not translated yet. Visitors reading in {languageNames[locale]} see the English version until you add a title
              and text here.
            </p>
          )}

          <TranslationFields
            key={locale}
            locale={locale}
            text={post.translations[locale]}
            onChange={(patch) => updateText(locale, patch)}
            englishTitle={post.translations.en.title}
          />
        </section>

        {/* Settings */}
        <aside className="flex flex-col gap-4">
          <div className={cardClass}>
            <h2 className="font-semibold">Visibility</h2>
            <div className="flex gap-1 rounded-xl bg-sand p-1">
              {(["DRAFT", "PUBLISHED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={post.status === s}
                  onClick={() => update({ status: s })}
                  className={`h-10 flex-1 rounded-lg text-sm font-semibold transition-colors ${post.status === s ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                >
                  {s === "DRAFT" ? "Draft" : "Published"}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted">
              {post.status === "DRAFT" ? "Drafts are only visible here." : "Published posts appear on the blog and the homepage."}
            </p>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Date shown on the post
              <input type="date" value={post.date} onChange={(e) => update({ date: e.target.value })} className={inputClass} />
            </label>
            {wasPublished && (
              <a
                href={`/en/blog/${savedSlug}`}
                target="_blank"
                rel="noopener"
                className="text-sm font-semibold text-ink underline decoration-amora underline-offset-4"
              >
                View on website ↗
              </a>
            )}
          </div>

          <div className={cardClass}>
            <h2 className="font-semibold">Details</h2>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Web address
              <div className="flex items-center rounded-[10px] border border-line-strong bg-cream focus-within:border-ink">
                <span className="pl-3 text-muted">/blog/</span>
                <input
                  value={post.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") });
                  }}
                  onBlur={() => update({ slug: slugify(post.slug) })}
                  placeholder="my-first-post"
                  className="h-11 min-w-0 flex-1 bg-transparent pr-3 text-[15px] font-normal"
                />
              </div>
            </label>
            {wasPublished && post.slug !== savedSlug && (
              <p className="text-sm text-amora-dark">
                Changing the address breaks links that people already shared, and menu links to this post.
              </p>
            )}
            <label className="flex flex-col gap-1 text-sm font-medium">
              Tag
              <input
                value={post.tag}
                onChange={(e) => update({ tag: e.target.value })}
                placeholder="AI SEO"
                maxLength={40}
                list="post-tags"
                className={inputClass}
              />
              <datalist id="post-tags">
                <option value="AI Agents" />
                <option value="Vibe Coding" />
                <option value="AI SEO" />
              </datalist>
            </label>
          </div>

          <CoverField cover={post.cover} onChange={(cover) => update({ cover })} />

          {!isNew && (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className={`${buttonClass} border border-line-strong bg-white text-amora-dark hover:border-amora-dark`}
            >
              Delete post
            </button>
          )}
        </aside>
      </div>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:left-60">
        <div className="flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 md:px-10">
          <button
            type="button"
            onClick={() => save()}
            disabled={pending || (!dirty && !isNew)}
            className={`${buttonClass} bg-amora px-6 text-white hover:bg-amora-dark`}
          >
            {pending ? "Saving…" : post.status === "PUBLISHED" ? (wasPublished ? "Update post" : "Publish") : "Save draft"}
          </button>
          <span role="status" className="min-w-0 flex-1 text-sm">
            {message && (message.type === "error" || !dirty) ? (
              <span className={message.type === "error" ? "font-medium text-amora-dark" : "font-medium text-[#0F7A50]"}>
                {message.lines.join(" · ")}
              </span>
            ) : dirty ? (
              <span className="text-muted">Unsaved changes</span>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}

function TranslationFields({
  locale,
  text,
  onChange,
  englishTitle,
}: {
  locale: Locale;
  text: PostTranslation;
  onChange: (patch: Partial<PostTranslation>) => void;
  englishTitle: string;
}) {
  return (
    <div lang={locale} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Title
        <input
          value={text.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={locale === "en" ? "What AI SEO means for local businesses" : englishTitle}
          maxLength={160}
          className={`${inputClass} h-12 font-display text-lg font-semibold`}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        <span>
          Summary <span className="font-normal text-muted">(shown on blog cards and in Google results)</span>
        </span>
        <textarea
          value={text.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          maxLength={300}
          className={`${inputClass} h-auto resize-y py-2.5 leading-relaxed`}
        />
        <span className="self-end text-xs font-normal text-muted">{text.description.length}/300</span>
      </label>
      <MarkdownField value={text.body} onChange={(body) => onChange({ body })} />
    </div>
  );
}

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

function MarkdownField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
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
      const result = await uploadPostImage(data);
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
        <span className="text-sm font-medium">Text</span>
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
              id="post-image-upload"
              onChange={(e) => onImageChosen(e.target.files?.[0])}
            />
            <label
              htmlFor="post-image-upload"
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
            <div className="prose-amora" dangerouslySetInnerHTML={{ __html: preview }} />
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

function CoverField({ cover, onChange }: { cover: PostInput["cover"]; onChange: (cover: PostInput["cover"]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onFileChosen(file: File | undefined) {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const data = new FormData();
      data.set("file", await prepareImage(file));
      const result = await uploadPostImage(data);
      if (fileRef.current) fileRef.current.value = "";
      if (result.ok) onChange(result.image);
      else setError(result.error);
    });
  }

  return (
    <div className={cardClass}>
      <h2 className="font-semibold">Cover image</h2>
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border border-line bg-cream">
        {cover ? (
          <Image src={mediaUrl(cover)} alt="" fill sizes="320px" className="object-cover" />
        ) : (
          <span className="px-4 text-center text-sm text-muted">No cover: the card shows a colored block</span>
        )}
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold">Uploading…</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          id="cover-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => onFileChosen(e.target.files?.[0])}
        />
        <label
          htmlFor="cover-upload"
          className={`${buttonClass} bg-ink text-paper hover:bg-panel ${pending ? "pointer-events-none opacity-50" : ""}`}
        >
          {cover ? "Replace" : "Upload image"}
        </label>
        {cover && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`${buttonClass} border border-line-strong text-amora-dark hover:border-amora-dark`}
          >
            Remove
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-amora-dark">
          {error}
        </p>
      )}
      <p className="text-xs text-muted">Saved together with the post.</p>
    </div>
  );
}
