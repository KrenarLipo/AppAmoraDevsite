"use client";

import { useState, useTransition } from "react";
import { locales, type Locale } from "@/i18n/config";
import type { FooterColumn, Localized, MenuLink, Menus } from "@/lib/settings/schema";
import { resetMenus, saveMenus } from "./actions";

type Props = {
  initial: Menus;
  /** Site paths offered as suggestions in the link field. */
  pages: { path: string; label: string }[];
};

const languageNames: Record<Locale, string> = { en: "English", it: "Italian", sq: "Albanian" };
const emptyText = (): Localized => ({ en: "", it: "", sq: "" });
const newId = () => crypto.randomUUID();

function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target]!, copy[index]!];
  return copy;
}

const smallButton =
  "flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-line-strong text-lg transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-line-strong";
const inputClass = "h-11 w-full rounded-[10px] border border-line-strong bg-cream px-3 text-[15px] focus:border-ink";

export function MenuEditor({ initial, pages }: Props) {
  const [menus, setMenus] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "error" | "success"; lines: string[] } | null>(null);

  function update(next: Menus) {
    setMenus(next);
    setDirty(true);
    setStatus(null);
  }

  const setHeader = (header: MenuLink[]) => update({ ...menus, header });
  const setFooter = (footer: FooterColumn[]) => update({ ...menus, footer });

  function save() {
    startTransition(async () => {
      const result = await saveMenus(menus);
      if (result.ok) {
        setDirty(false);
        setStatus({ type: "success", lines: ["Menus saved. They're live on the site."] });
      } else {
        setStatus({ type: "error", lines: result.errors });
      }
    });
  }

  function reset() {
    if (!confirm("Go back to the original menus? Your changes will be lost.")) return;
    startTransition(async () => {
      await resetMenus();
      // The page re-renders with the defaults; reload the editor state from them.
      window.location.reload();
    });
  }

  return (
    <div className="flex flex-col gap-10 pb-28">
      <datalist id="site-pages">
        {pages.map((p) => (
          <option key={p.path} value={p.path}>
            {p.label}
          </option>
        ))}
      </datalist>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold">Header menu</h2>
          <p className="text-sm text-muted">The links at the top of every page (and in the phone menu).</p>
        </div>
        <LinkList links={menus.header} onChange={setHeader} max={10} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold">Footer columns</h2>
          <p className="text-sm text-muted">Each column has a title and its own links.</p>
        </div>
        {menus.footer.map((column, ci) => (
          <div key={column.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-sand/60 p-4 md:p-5">
            <div className="flex items-center gap-2">
              <ColumnTitle
                value={column.title}
                onChange={(title) => setFooter(menus.footer.map((c, i) => (i === ci ? { ...c, title } : c)))}
              />
              <div className="flex shrink-0 gap-2">
                <button type="button" aria-label="Move column up" className={smallButton} disabled={ci === 0} onClick={() => setFooter(move(menus.footer, ci, -1))}>
                  ↑
                </button>
                <button type="button" aria-label="Move column down" className={smallButton} disabled={ci === menus.footer.length - 1} onClick={() => setFooter(move(menus.footer, ci, 1))}>
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="Delete column"
                  className={`${smallButton} text-amora-dark`}
                  onClick={() => confirm("Delete this column and its links?") && setFooter(menus.footer.filter((_, i) => i !== ci))}
                >
                  ×
                </button>
              </div>
            </div>
            <LinkList
              links={column.links}
              max={12}
              onChange={(links) => setFooter(menus.footer.map((c, i) => (i === ci ? { ...c, links } : c)))}
            />
          </div>
        ))}
        {menus.footer.length < 5 && (
          <button
            type="button"
            className="flex h-11 items-center justify-center self-start rounded-[10px] border border-dashed border-line-strong px-4 font-semibold hover:border-ink"
            onClick={() => setFooter([...menus.footer, { id: newId(), title: { en: "New column", it: "", sq: "" }, links: [] }])}
          >
            + Add column
          </button>
        )}
      </section>

      {/* Save bar stays visible while scrolling, also on phones. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:left-60">
        <div className="flex max-w-5xl flex-wrap items-center gap-3 px-6 py-3 md:px-10">
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="h-11 rounded-[10px] bg-amora px-6 font-semibold text-white transition-colors hover:bg-amora-dark disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save menus"}
          </button>
          <button type="button" onClick={reset} disabled={pending} className="h-11 rounded-[10px] px-3 text-sm font-semibold text-muted hover:text-ink">
            Reset to original
          </button>
          {dirty && !pending && <span className="text-sm text-muted">Unsaved changes</span>}
          {status && (
            <div role={status.type === "error" ? "alert" : "status"} className={`w-full text-sm font-medium ${status.type === "error" ? "text-amora-dark" : "text-[#0F7A50]"}`}>
              {status.lines.slice(0, 4).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Links as compact rows (name, address, move buttons); "Edit" opens the fields of one link. */
function LinkList({ links, onChange, max }: { links: MenuLink[]; onChange: (links: MenuLink[]) => void; max: number }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const set = (index: number, patch: Partial<MenuLink>) => onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  function add() {
    const link = { id: newId(), label: emptyText(), href: "/", visible: true };
    onChange([...links, link]);
    setOpenId(link.id);
  }

  return (
    <div className="flex flex-col gap-2">
      {links.map((link, index) => {
        const open = openId === link.id;
        return (
          <div
            key={link.id}
            className={`flex flex-col gap-4 rounded-xl border bg-white p-3 ${open ? "border-ink" : link.visible ? "border-line" : "border-dashed border-line-strong"}`}
          >
            <div className="flex items-center gap-2">
              <div className={`flex min-w-0 flex-1 flex-col px-1 ${link.visible ? "" : "opacity-60"}`}>
                <span className="truncate font-semibold">{link.label.en || "New link"}</span>
                <span className="truncate text-sm text-muted">
                  {link.href}
                  {!link.visible && " · hidden"}
                </span>
              </div>
              <button type="button" aria-label={`Move ${link.label.en} up`} className={smallButton} disabled={index === 0} onClick={() => onChange(move(links, index, -1))}>
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${link.label.en} down`}
                className={smallButton}
                disabled={index === links.length - 1}
                onClick={() => onChange(move(links, index, 1))}
              >
                ↓
              </button>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : link.id)}
                className={`h-11 shrink-0 rounded-[10px] px-3 text-sm font-semibold transition-colors ${open ? "bg-ink text-paper" : "border border-line-strong hover:border-ink"}`}
              >
                {open ? "Done" : "Edit"}
              </button>
            </div>

            {open && (
              <div className="flex flex-col gap-4 border-t border-line px-1 pt-4">
                <LocalizedFields legend="Text" value={link.label} onChange={(label) => set(index, { label })} />
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-muted">Link to: a page like /pricing, or a full https:// address</span>
                  <input list="site-pages" value={link.href} onChange={(e) => set(index, { href: e.target.value })} className={inputClass} placeholder="/pricing" />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex h-11 cursor-pointer items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={link.visible} onChange={(e) => set(index, { visible: e.target.checked })} className="size-5 accent-amora" />
                    Show on the website
                  </label>
                  <button
                    type="button"
                    className="h-11 rounded-[10px] border border-line-strong px-3 text-sm font-semibold text-amora-dark hover:border-amora-dark"
                    onClick={() => onChange(links.filter((_, i) => i !== index))}
                  >
                    Delete link
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {links.length < max && (
        <button
          type="button"
          className="flex h-11 items-center justify-center self-start rounded-[10px] border border-dashed border-line-strong px-4 font-semibold hover:border-ink"
          onClick={add}
        >
          + Add link
        </button>
      )}
    </div>
  );
}

/** A footer column's title; its three language fields open on demand. */
function ColumnTitle({ value, onChange }: { value: Localized; onChange: (value: Localized) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="min-w-0 truncate font-display text-lg font-bold">{value.en || "Untitled column"}</span>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="h-11 shrink-0 px-2 text-sm font-semibold text-muted underline hover:text-ink">
          {open ? "Done" : "Rename"}
        </button>
      </div>
      {open && <LocalizedFields legend="Column title" value={value} onChange={onChange} />}
    </div>
  );
}

function LocalizedFields({ legend, value, onChange }: { legend: string; value: Localized; onChange: (value: Localized) => void }) {
  return (
    <fieldset className="flex min-w-0 flex-[1_1_480px] flex-col gap-1">
      <legend className="mb-1 text-sm font-semibold">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {locales.map((l) => (
          <label key={l} className="flex flex-col gap-1 text-sm">
            <span className="text-muted">
              {languageNames[l]}
              {l === "en" ? " (required)" : ""}
            </span>
            <input
              value={value[l]}
              maxLength={80}
              onChange={(e) => onChange({ ...value, [l]: e.target.value })}
              placeholder={l === "en" ? "" : value.en}
              className={inputClass}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
