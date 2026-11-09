"use client";

import Image from "next/image";
import type { TemplateId } from "@/lib/catalog";
import { mediaUrl, type ImageRef } from "@/lib/settings/schema";
import { fontFamilies } from "@/lib/sites/fonts-client";
import { fontIds, fontNames, templateOrder, themes, type FontId } from "@/lib/sites/templates";
import { saveDesign } from "../actions";
import { Card, Field, ImageUpload, SaveBar, UpgradeNote, buttonClass, inputClass, useEditor } from "../ui";

type Design = {
  template: TemplateId;
  brandName: string;
  logo: ImageRef;
  colors: { primary: string | null; background: string | null };
  fonts: { heading: FontId | null; body: FontId | null };
};

export function DesignEditor({
  initial,
  templatesAllowed,
  designAllowed,
  locked,
  siteUrl,
}: {
  initial: Design;
  templatesAllowed: number;
  designAllowed: boolean;
  locked: boolean;
  siteUrl: string;
}) {
  const editor = useEditor(initial, saveDesign);
  const design = editor.value;
  const set = (patch: Partial<Design>) => editor.setValue((d) => ({ ...d, ...patch }));
  const theme = themes[design.template];
  const canDesign = designAllowed && !locked;

  return (
    <>
      <Card title="Template" description="Your texts and images stay the same when you switch.">
        {locked && <UpgradeNote>Your trial has ended: you can change your name and logo, but not the template.</UpgradeNote>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templateOrder.map((id, index) => {
            const t = themes[id];
            const available = index < templatesAllowed;
            const selected = design.template === id;
            return (
              <button
                key={id}
                type="button"
                disabled={!available || locked}
                onClick={() => set({ template: id })}
                aria-pressed={selected}
                className={`flex flex-col gap-3 rounded-2xl border-2 p-3 text-left transition-colors disabled:cursor-not-allowed ${selected ? "border-amora" : "border-line hover:border-ink"} ${!available ? "opacity-60" : ""}`}
              >
                <TemplateThumb id={id} />
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{t.name}</span>
                  {selected && <span className="rounded bg-amora px-1.5 py-0.5 text-[11px] font-semibold text-white">In use</span>}
                  {!available && <span className="rounded bg-sand px-1.5 py-0.5 text-[11px] font-semibold">🔒 Starter</span>}
                </span>
                <span className="text-sm text-muted">{t.description}</span>
              </button>
            );
          })}
        </div>
        {templatesAllowed < templateOrder.length && !locked && (
          <UpgradeNote>The free trial includes 3 templates. Starter and Pro include all 6.</UpgradeNote>
        )}
      </Card>

      <Card title="Name and logo">
        <Field label="Business name" hint="Shown at the top of your website when there's no logo, and in the footer.">
          <input value={design.brandName} maxLength={80} onChange={(e) => set({ brandName: e.target.value })} className={inputClass} />
        </Field>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-24 w-48 items-center justify-center rounded-xl border border-line p-3" style={{ background: theme.colors.background }}>
            {design.logo ? (
              <Image src={mediaUrl(design.logo)} alt="" width={design.logo.width} height={design.logo.height} className="max-h-full w-auto object-contain" />
            ) : (
              <span className="text-center text-sm" style={{ color: theme.colors.muted }}>
                No logo: your name is shown
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <ImageUpload kind="logo" label={design.logo ? "Replace logo" : "Upload logo"} onUploaded={(logo) => set({ logo })} />
            {design.logo && (
              <button type="button" onClick={() => set({ logo: null })} className={`${buttonClass} border border-line-strong text-amora-dark`}>
                Remove
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted">Tip: a PNG or SVG with a transparent background looks best.</p>
      </Card>

      <Card title="Colors" description="Leave as they are to use the template's colors.">
        {!designAllowed && !locked && <UpgradeNote>Custom colors and fonts are part of the Starter and Pro plans.</UpgradeNote>}
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            label="Main color (buttons and links)"
            value={design.colors.primary}
            fallback={theme.colors.primary}
            disabled={!canDesign}
            onChange={(primary) => set({ colors: { ...design.colors, primary } })}
          />
          <ColorField
            label="Background"
            value={design.colors.background}
            fallback={theme.colors.background}
            disabled={!canDesign}
            onChange={(background) => set({ colors: { ...design.colors, background } })}
          />
        </div>
      </Card>

      <Card title="Fonts">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["heading", "body"] as const).map((key) => {
            const current = design.fonts[key] ?? theme.fonts[key];
            return (
              <Field key={key} label={key === "heading" ? "Headings" : "Text"}>
                <select
                  value={design.fonts[key] ?? ""}
                  disabled={!canDesign}
                  onChange={(e) => set({ fonts: { ...design.fonts, [key]: (e.target.value || null) as FontId | null } })}
                  className={inputClass}
                >
                  <option value="">Template font ({fontNames[theme.fonts[key]]})</option>
                  {fontIds.map((f) => (
                    <option key={f} value={f}>
                      {fontNames[f]}
                    </option>
                  ))}
                </select>
                <span className="rounded-lg bg-cream px-3 py-2 text-lg font-normal" style={{ fontFamily: fontFamilies[current] }}>
                  {key === "heading" ? design.brandName || "Your business" : "The quick brown fox jumps over the lazy dog."}
                </span>
              </Field>
            );
          })}
        </div>
      </Card>

      <p className="text-sm text-muted">
        After saving,{" "}
        <a href={siteUrl} target="_blank" rel="noopener" className="font-semibold text-ink underline decoration-amora underline-offset-4">
          open your website ↗
        </a>{" "}
        to see the result.
      </p>

      <SaveBar dirty={editor.dirty} pending={editor.pending} onSave={() => editor.save()} message={editor.message} />
    </>
  );
}

function ColorField({
  label,
  value,
  fallback,
  disabled,
  onChange,
}: {
  label: string;
  value: string | null;
  fallback: string;
  disabled: boolean;
  onChange: (value: string | null) => void;
}) {
  const shown = value ?? fallback;
  return (
    <Field label={label}>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={shown}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label={label}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-[10px] border border-line-strong bg-white p-1 disabled:cursor-not-allowed"
        />
        <input
          value={shown}
          disabled={disabled}
          onChange={(e) => onChange(/^#[0-9a-fA-F]{6}$/.test(e.target.value) ? e.target.value.toUpperCase() : value)}
          className={`${inputClass} font-mono uppercase`}
        />
        {value && !disabled && (
          <button type="button" onClick={() => onChange(null)} className="shrink-0 px-2 text-sm font-semibold text-muted hover:text-ink">
            Reset
          </button>
        )}
      </span>
    </Field>
  );
}

/** A small drawing of the template, in its own colors. */
function TemplateThumb({ id }: { id: TemplateId }) {
  const t = themes[id];
  const c = t.colors;
  return (
    <span className="flex aspect-[16/10] flex-col gap-2 overflow-hidden p-3" style={{ background: c.background, borderRadius: Math.min(t.radius, 12) }}>
      <span className="flex items-center justify-between">
        <span className="h-2 w-10 rounded-full" style={{ background: c.text, opacity: 0.8 }} />
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-5 rounded-full" style={{ background: c.muted }} />
          ))}
        </span>
      </span>
      {t.hero === "overlay" ? (
        <span className="flex flex-1 flex-col justify-end gap-1 rounded p-2" style={{ background: c.surface }}>
          <span className="h-2.5 w-3/4 rounded-full" style={{ background: c.text }} />
          <span className="h-3 w-12 rounded" style={{ background: c.primary }} />
        </span>
      ) : t.hero === "centered" ? (
        <span className="flex flex-1 flex-col items-center gap-1.5 pt-1">
          <span className="h-2.5 w-2/3 rounded-full" style={{ background: c.text }} />
          <span className="h-3 w-12 rounded" style={{ background: c.primary }} />
          <span className="w-full flex-1 rounded" style={{ background: c.surface }} />
        </span>
      ) : (
        <span className="flex flex-1 gap-2">
          <span className="flex flex-1 flex-col justify-center gap-1.5">
            <span className="h-2.5 w-full rounded-full" style={{ background: c.text }} />
            <span className="h-2 w-2/3 rounded-full" style={{ background: c.muted }} />
            <span className="h-3 w-12 rounded" style={{ background: c.primary }} />
          </span>
          <span className="flex-1 rounded" style={{ background: c.surface }} />
        </span>
      )}
    </span>
  );
}
