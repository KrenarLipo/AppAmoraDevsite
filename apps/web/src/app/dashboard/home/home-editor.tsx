"use client";

import Image from "next/image";
import { useState } from "react";
import { mediaUrl } from "@/lib/settings/schema";
import type { SiteContent } from "@/lib/sites/content";
import type { SiteLanguage } from "@/lib/sites/languages";
import { iconIds, type IconId } from "@/lib/sites/niche-defaults";
import { saveHome } from "../actions";
import { Card, Field, ImageUpload, LanguageTabs, SaveBar, UpgradeNote, buttonClass, inputClass, useEditor } from "../ui";

type Home = Pick<SiteContent, "hero" | "slideshow" | "subscribe" | "highlights" | "introImage" | "cta">;

const iconLabels: Record<IconId, string> = {
  sparkle: "Sparkle", heart: "Heart", clock: "Clock", leaf: "Leaf", shield: "Shield", star: "Star",
  users: "People", chart: "Growth", cup: "Coffee", dumbbell: "Fitness", map: "Location", check: "Check",
};

export function HomeEditor({
  initial,
  languages,
  defaultLanguage,
  slideshowAllowed,
  subscribersAllowed,
  locked,
  templatePhotos,
}: {
  templatePhotos: string[];
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
        {home.slideshow.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">Your site shows the template&apos;s photos until you add your own:</p>
            <div className="flex gap-2">
              {templatePhotos.slice(0, 2).map((src) => (
                <div key={src} className="relative aspect-[4/3] w-32 overflow-hidden rounded-lg bg-sand">
                  <Image src={src} alt="" fill sizes="128px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
        {!slideshowAllowed ? (
          <UpgradeNote>Using your own photos is part of the Starter and Pro plans.</UpgradeNote>
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

      <Card title="Highlights" description="Three short reasons to choose you, shown under the welcome section.">
        <label className="flex items-center gap-3 font-medium">
          <input
            type="checkbox"
            checked={home.highlights.enabled}
            onChange={(e) => editor.setValue((h) => ({ ...h, highlights: { ...h.highlights, enabled: e.target.checked } }))}
            className="size-5 accent-amora"
          />
          Show the highlights
        </label>
        <div className="grid gap-4 lg:grid-cols-3">
          {home.highlights.items.map((item, index) => {
            const setItem = (patch: Partial<typeof item>) =>
              editor.setValue((h) => ({
                ...h,
                highlights: { ...h.highlights, items: h.highlights.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) },
              }));
            return (
              <div key={index} className="flex flex-col gap-3 rounded-xl border border-line p-4">
                <Field label="Icon">
                  <select value={item.icon} onChange={(e) => setItem({ icon: e.target.value as IconId })} className={inputClass}>
                    {iconIds.map((icon) => (
                      <option key={icon} value={icon}>
                        {iconLabels[icon]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={`Title (${language.toUpperCase()})`}>
                  <input
                    value={item.title[language]}
                    maxLength={80}
                    placeholder={language === defaultLanguage ? "" : item.title[defaultLanguage]}
                    onChange={(e) => setItem({ title: { ...item.title, [language]: e.target.value } })}
                    className={inputClass}
                  />
                </Field>
                <Field label={`Text (${language.toUpperCase()})`}>
                  <textarea
                    value={item.text[language]}
                    maxLength={240}
                    rows={3}
                    placeholder={language === defaultLanguage ? "" : item.text[defaultLanguage]}
                    onChange={(e) => setItem({ text: { ...item.text, [language]: e.target.value } })}
                    className={`${inputClass} h-auto py-2.5`}
                  />
                </Field>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Intro photo" description="Shown next to your home page text (edit the text in Pages → Home).">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative aspect-[4/3] w-48 overflow-hidden rounded-xl bg-sand">
            <Image src={home.introImage ? mediaUrl(home.introImage) : templatePhotos[2]!} alt="" fill sizes="192px" className="object-cover" />
          </div>
          {slideshowAllowed ? (
            <div className="flex flex-wrap gap-2">
              <ImageUpload kind="slide" label={home.introImage ? "Replace photo" : "Use my own photo"} onUploaded={(image) => editor.setValue((h) => ({ ...h, introImage: image }))} />
              {home.introImage && (
                <button type="button" onClick={() => editor.setValue((h) => ({ ...h, introImage: null }))} className={`${buttonClass} border border-line-strong`}>
                  Use template photo
                </button>
              )}
            </div>
          ) : (
            <UpgradeNote>Using your own photos is part of the Starter and Pro plans.</UpgradeNote>
          )}
        </div>
      </Card>

      <Card title="Closing banner" description="A colored band near the bottom of your pages, with your contact button.">
        <label className="flex items-center gap-3 font-medium">
          <input
            type="checkbox"
            checked={home.cta.enabled}
            onChange={(e) => editor.setValue((h) => ({ ...h, cta: { ...h.cta, enabled: e.target.checked } }))}
            className="size-5 accent-amora"
          />
          Show the closing banner
        </label>
        <Field label={`Title (${language.toUpperCase()})`}>
          <input
            value={home.cta.title[language]}
            maxLength={140}
            placeholder={language === defaultLanguage ? "" : home.cta.title[defaultLanguage]}
            onChange={(e) => editor.setValue((h) => ({ ...h, cta: { ...h.cta, title: { ...h.cta.title, [language]: e.target.value } } }))}
            className={inputClass}
          />
        </Field>
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
