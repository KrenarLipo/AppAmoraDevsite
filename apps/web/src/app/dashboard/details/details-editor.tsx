"use client";

import { useState } from "react";
import type { SiteContent } from "@/lib/sites/content";
import { siteLanguageNames, siteLanguages, type SiteLanguage } from "@/lib/sites/languages";
import { saveDetails } from "../actions";
import { Card, Field, LanguageTabs, SaveBar, UpgradeNote, inputClass, useEditor } from "../ui";

type Details = Pick<SiteContent, "contact" | "social" | "languages" | "defaultLanguage">;

export function DetailsEditor({ initial, maxLanguages, whatsappAllowed }: { initial: Details; maxLanguages: number; whatsappAllowed: boolean }) {
  const editor = useEditor(initial, saveDetails);
  const d = editor.value;
  const [language, setLanguage] = useState<SiteLanguage>(initial.defaultLanguage);
  const setContact = (patch: Partial<Details["contact"]>) => editor.setValue((v) => ({ ...v, contact: { ...v.contact, ...patch } }));
  const setSocial = (patch: Partial<Details["social"]>) => editor.setValue((v) => ({ ...v, social: { ...v.social, ...patch } }));

  function toggleLanguage(l: SiteLanguage, on: boolean) {
    editor.setValue((v) => {
      const languages = on ? [...v.languages, l] : v.languages.filter((x) => x !== l);
      const defaultLanguage = languages.includes(v.defaultLanguage) ? v.defaultLanguage : (languages[0] ?? v.defaultLanguage);
      return { ...v, languages, defaultLanguage };
    });
  }

  const activeLanguages = d.languages.filter((l) => siteLanguages.includes(l));

  return (
    <>
      <Card title="Contact details" description="Leave a field empty to hide it.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input type="tel" value={d.contact.phone} onChange={(e) => setContact({ phone: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Email" hint="Messages from your contact form arrive in Messages here.">
            <input type="email" value={d.contact.email} onChange={(e) => setContact({ email: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Address" hint="Visitors can tap it to open Google Maps.">
            <input value={d.contact.address} onChange={(e) => setContact({ address: e.target.value })} className={inputClass} />
          </Field>
          <Field label="WhatsApp number" hint="With country code, e.g. +355681234567. Adds a chat button to every page.">
            <input
              type="tel"
              value={d.contact.whatsapp}
              disabled={!whatsappAllowed}
              onChange={(e) => setContact({ whatsapp: e.target.value.replace(/[^\d+]/g, "") })}
              className={inputClass}
            />
          </Field>
        </div>
        {!whatsappAllowed && <UpgradeNote>The WhatsApp chat button is part of the Starter and Pro plans.</UpgradeNote>}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Opening hours</span>
          <LanguageTabs languages={activeLanguages} active={language} onChange={setLanguage} filled={(l) => d.contact.hours[l] !== ""} />
          <textarea
            value={d.contact.hours[language]}
            rows={4}
            maxLength={300}
            placeholder={"Mon–Fri 9:00–18:00\nSat 9:00–13:00"}
            onChange={(e) => setContact({ hours: { ...d.contact.hours, [language]: e.target.value } })}
            className={`${inputClass} h-auto py-2.5`}
          />
        </div>
      </Card>

      <Card title="Social links" description="Full addresses starting with https://. Empty ones are hidden.">
        <div className="grid gap-4 sm:grid-cols-3">
          {(["instagram", "tiktok", "facebook"] as const).map((key) => (
            <Field key={key} label={{ instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook" }[key]}>
              <input type="url" value={d.social[key]} placeholder="https://" onChange={(e) => setSocial({ [key]: e.target.value })} className={inputClass} />
            </Field>
          ))}
        </div>
      </Card>

      <Card
        title="Languages"
        description={`Your plan includes ${maxLanguages} ${maxLanguages === 1 ? "language" : "languages"}. Visitors can switch between them at the top of your site.`}
      >
        <div className="flex flex-col gap-2">
          {siteLanguages.map((l) => {
            const on = d.languages.includes(l);
            const blocked = !on && d.languages.length >= maxLanguages;
            return (
              <div key={l} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-2">
                <label className={`flex min-h-10 items-center gap-3 font-medium ${blocked ? "opacity-50" : ""}`}>
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={blocked || (on && d.languages.length === 1)}
                    onChange={(e) => toggleLanguage(l, e.target.checked)}
                    className="size-5 accent-amora"
                  />
                  {siteLanguageNames[l]}
                </label>
                {on && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="default-language"
                      checked={d.defaultLanguage === l}
                      onChange={() => editor.setValue((v) => ({ ...v, defaultLanguage: l }))}
                      className="size-4 accent-amora"
                    />
                    Main language
                  </label>
                )}
              </div>
            );
          })}
        </div>
        {d.languages.length >= maxLanguages && maxLanguages < siteLanguages.length && (
          <UpgradeNote>{maxLanguages === 1 ? "Starter includes 2 languages, Pro all 5." : "Pro includes all 5 languages."}</UpgradeNote>
        )}
      </Card>

      <SaveBar dirty={editor.dirty} pending={editor.pending} onSave={() => editor.save()} message={editor.message} />
    </>
  );
}
