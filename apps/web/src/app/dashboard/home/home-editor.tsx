"use client";

import Image from "next/image";
import { useState } from "react";
import { mediaUrl } from "@/lib/settings/schema";
import type { SiteContent } from "@/lib/sites/content";
import type { SiteLanguage } from "@/lib/sites/languages";
import { saveHome } from "../actions";
import { Card, Field, ImageUpload, LanguageTabs, SaveBar, UpgradeNote, buttonClass, inputClass, useEditor } from "../ui";

type Home = Pick<SiteContent, "hero" | "slideshow" | "subscribe">;

export function HomeEditor({
  initial,
  languages,
  defaultLanguage,
  slideshowAllowed,
  subscribersAllowed,
  locked,
}: {
  initial: Home;
  languages: SiteLanguage[];
  defaultLanguage: SiteLanguage;
  slideshowAllowed: boolean;
  subscribersAllowed: boolean;
  locked: boolean;
}) {
  const editor = useEditor(initial, saveHome);
  const home = editor.value;
  const [language, setLanguage] = useState<SiteLanguage>(defaultLanguage);
  const setHero = (key: keyof Home["hero"], text: string) =>
    editor.setValue((h) => ({ ...h, hero: { ...h.hero, [key]: { ...h.hero[key], [language]: text } } }));
  const placeholder = (key: keyof Home["hero"]) => (language === defaultLanguage ? "" : home.hero[key][defaultLanguage]);

  if (locked) return <UpgradeNote>Your trial has ended. Choose a plan to edit your home page again.</UpgradeNote>;

  return (
    <>
      <Card title="Welcome section" description="A short headline, one or two sentences, and a button that opens your contact page.">
        <LanguageTabs languages={languages} active={language} onChange={setLanguage} filled={(l) => home.hero.headline[l] !== ""} />
        <Field label="Headline">
          <input value={home.hero.headline[language]} maxLength={140} placeholder={placeholder("headline")} onChange={(e) => setHero("headline", e.target.value)} className={`${inputClass} text-lg font-semibold`} />
        </Field>
        <Field label="Text">
          <textarea value={home.hero.text[language]} maxLength={400} rows={3} placeholder={placeholder("text")} onChange={(e) => setHero("text", e.target.value)} className={`${inputClass} h-auto py-2.5`} />
        </Field>
        <Field label="Button text" hint="Leave empty to hide the button.">
          <input value={home.hero.button[language]} maxLength={40} placeholder={placeholder("button")} onChange={(e) => setHero("button", e.target.value)} className={inputClass} />
        </Field>
      </Card>

      <Card title="Slideshow" description="Up to 6 photos that change every few seconds. Landscape photos work best.">
        {!slideshowAllowed ? (
          <UpgradeNote>The slideshow is part of the Starter and Pro plans.</UpgradeNote>
        ) : (
          <>
            {home.slideshow.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-3">
                {home.slideshow.map((image, index) => (
                  <li key={image.id} className="flex flex-col gap-2">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand">
                      <Image src={mediaUrl(image)} alt="" fill sizes="240px" className="object-cover" />
                      <span className="absolute top-2 left-2 rounded bg-ink/80 px-1.5 py-0.5 text-xs font-semibold text-paper">{index + 1}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        aria-label="Move earlier"
                        onClick={() => editor.setValue((h) => ({ ...h, slideshow: swap(h.slideshow, index, index - 1) }))}
                        className={`${buttonClass} h-9 flex-1 border border-line-strong px-2`}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === home.slideshow.length - 1}
                        aria-label="Move later"
                        onClick={() => editor.setValue((h) => ({ ...h, slideshow: swap(h.slideshow, index, index + 1) }))}
                        className={`${buttonClass} h-9 flex-1 border border-line-strong px-2`}
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => editor.setValue((h) => ({ ...h, slideshow: h.slideshow.filter((_, i) => i !== index) }))}
                        className={`${buttonClass} h-9 flex-1 border border-line-strong px-2 text-amora-dark`}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {home.slideshow.length < 6 && (
              <div className="self-start">
                <ImageUpload
                  kind="slide"
                  label="+ Add photo"
                  onUploaded={(image) => editor.setValue((h) => ({ ...h, slideshow: [...h.slideshow, { ...image }] }))}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <Card title="Subscriber box" description="A sign-up box at the bottom of your home page. New subscribers appear under Subscribers.">
        {!subscribersAllowed ? (
          <UpgradeNote>The subscriber form and list are part of the Starter and Pro plans.</UpgradeNote>
        ) : (
          <>
            <label className="flex items-center gap-3 font-medium">
              <input
                type="checkbox"
                checked={home.subscribe.enabled}
                onChange={(e) => editor.setValue((h) => ({ ...h, subscribe: { ...h.subscribe, enabled: e.target.checked } }))}
                className="size-5 accent-amora"
              />
              Show the subscriber box
            </label>
            <Field label={`Title (${language.toUpperCase()})`}>
              <input
                value={home.subscribe.title[language]}
                maxLength={120}
                placeholder={language === defaultLanguage ? "" : home.subscribe.title[defaultLanguage]}
                onChange={(e) => editor.setValue((h) => ({ ...h, subscribe: { ...h.subscribe, title: { ...h.subscribe.title, [language]: e.target.value } } }))}
                className={inputClass}
              />
            </Field>
          </>
        )}
      </Card>

      <SaveBar dirty={editor.dirty} pending={editor.pending} onSave={() => editor.save()} message={editor.message} />
    </>
  );
}

function swap<T>(list: T[], a: number, b: number): T[] {
  const next = [...list];
  [next[a], next[b]] = [next[b]!, next[a]!];
  return next;
}
