"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MarkdownField } from "@/components/markdown-field";
import type { PageTexts } from "@/lib/sites/content";
import type { SiteLanguage } from "@/lib/sites/languages";
import { savePage, uploadSiteImage } from "../actions";
import { Card, Field, LanguageTabs, SaveBar, inputClass, useEditor } from "../ui";

type Page = { id: string | null; slug: string; showInMenu: boolean; translations: PageTexts };

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function PageEditor({
  initial,
  kind,
  languages,
  defaultLanguage,
  siteUrl,
}: {
  initial: Page;
  kind: "home" | "contact" | "normal";
  languages: SiteLanguage[];
  defaultLanguage: SiteLanguage;
  siteUrl: string;
}) {
  const router = useRouter();
  const [language, setLanguage] = useState<SiteLanguage>(defaultLanguage);
  const [slugTouched, setSlugTouched] = useState(initial.id !== null);
  const editor = useEditor(initial, async (page) => {
    const result = await savePage(page);
    if (result.ok && page.id === null) {
      router.replace(`/dashboard/pages/${result.id}`);
    }
    return result;
  });
  const page = editor.value;
  const text = page.translations[language];
  const setText = (patch: Partial<PageTexts[SiteLanguage]>) =>
    editor.setValue((p) => {
      const translations = { ...p.translations, [language]: { ...p.translations[language], ...patch } };
      const slug = kind === "normal" && !slugTouched && language === defaultLanguage && patch.title !== undefined ? slugify(patch.title) : p.slug;
      return { ...p, translations, slug };
    });

  return (
    <div className="flex max-w-5xl flex-col gap-6 pb-28">
      <div className="flex flex-col gap-2">
        <Link href="/dashboard/pages" className="text-sm font-medium text-muted hover:text-ink">
          ← All pages
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">{page.id ? text.title || page.translations[defaultLanguage].title || "Edit page" : "New page"}</h1>
        {kind === "home" && <p className="text-muted">This text appears under the welcome section. Edit the welcome section in Home page.</p>}
        {kind === "contact" && <p className="text-muted">Your contact details and a contact form are added below this text automatically.</p>}
      </div>

      <Card title="Content">
        <LanguageTabs languages={languages} active={language} onChange={setLanguage} filled={(l) => page.translations[l].title !== ""} />
        {language !== defaultLanguage && !page.translations[language].title && (
          <p className="rounded-lg bg-cream px-3 py-2 text-sm text-muted">Not translated yet: visitors see the main language until you add a title and text here.</p>
        )}
        <Field label="Title">
          <input
            value={text.title}
            maxLength={120}
            placeholder={language === defaultLanguage ? "" : page.translations[defaultLanguage].title}
            onChange={(e) => setText({ title: e.target.value })}
            className={`${inputClass} h-12 text-lg font-semibold`}
          />
        </Field>
        <MarkdownField
          key={language}
          value={text.body}
          onChange={(body) => setText({ body })}
          uploadImage={(data) => uploadSiteImage("page", data)}
          sitePreview
        />
      </Card>

      {kind === "normal" && (
        <Card title="Settings">
          <Field label="Web address">
            <span className="flex items-center rounded-[10px] border border-line-strong bg-cream focus-within:border-ink">
              <span className="pl-3 text-sm text-muted">{siteUrl}/</span>
              <input
                value={page.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  editor.setValue((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }));
                }}
                className="h-11 min-w-0 flex-1 bg-transparent pr-3 text-[15px] font-normal"
              />
            </span>
          </Field>
          <label className="flex items-center gap-3 font-medium">
            <input
              type="checkbox"
              checked={page.showInMenu}
              onChange={(e) => editor.setValue((p) => ({ ...p, showInMenu: e.target.checked }))}
              className="size-5 accent-amora"
            />
            Show in the menu
          </label>
        </Card>
      )}

      <SaveBar dirty={editor.dirty || page.id === null} pending={editor.pending} onSave={() => editor.save()} message={editor.message} label={page.id ? "Save page" : "Create page"} />
    </div>
  );
}
