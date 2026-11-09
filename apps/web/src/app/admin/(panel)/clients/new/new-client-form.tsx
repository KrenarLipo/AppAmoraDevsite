"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { siteLanguageNames, siteLanguages, type SiteLanguage } from "@/lib/sites/languages";
import { templateOrder, themes } from "@/lib/sites/templates";
import { createClient } from "../actions";

const inputClass = "h-11 w-full min-w-0 rounded-[10px] border border-line-strong bg-cream px-3 text-[15px] focus:border-ink";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function NewClientForm({ trialDays }: { trialDays: number }) {
  const [form, setForm] = useState({
    businessName: "",
    slug: "",
    contactName: "",
    email: "",
    plan: "TRIAL" as "TRIAL" | "STARTER" | "PRO" | "CUSTOM",
    template: "web-agency" as (typeof templateOrder)[number],
    language: "sq" as SiteLanguage,
    trialDays: String(trialDays),
    paidMonths: "0",
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ clientId: string; email: string; password: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createClient({ ...form, trialDays: Number(form.trialDays), paidMonths: Number(form.paidMonths) });
      if (result.ok) setCreated(result);
      else setError(result.error);
    });
  }

  if (created) {
    const loginUrl = `https://appamora.com/${["en", "it", "sq"].includes(form.language) ? form.language : "en"}/login`;
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-[#0F7A50]/30 bg-[#E3F4EC] p-6">
        <h2 className="font-display text-xl font-bold text-[#0F7A50]">Client created</h2>
        <p>Send these login details to the client. The password is shown only now.</p>
        <dl className="grid gap-2 rounded-xl bg-white p-4 font-mono text-[15px] sm:grid-cols-[auto_1fr] sm:gap-x-6">
          <dt className="text-muted">Login page</dt>
          <dd className="break-all">{loginUrl}</dd>
          <dt className="text-muted">Email</dt>
          <dd className="break-all">{created.email}</dd>
          <dt className="text-muted">Password</dt>
          <dd className="break-all font-bold">{created.password}</dd>
        </dl>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/clients/${created.clientId}`} className="flex h-11 items-center rounded-[10px] bg-ink px-5 font-semibold text-paper">
            Open client
          </Link>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(`Login: ${loginUrl}\nEmail: ${created.email}\nPassword: ${created.password}`)}
            className="flex h-11 items-center rounded-[10px] border border-line-strong bg-white px-5 font-semibold"
          >
            Copy details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Business name
          <input
            value={form.businessName}
            onChange={(e) => set({ businessName: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Website address
          <div className="flex items-center rounded-[10px] border border-line-strong bg-cream focus-within:border-ink">
            <span className="pl-3 text-sm text-muted">/s/</span>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") });
              }}
              required
              className="h-11 min-w-0 flex-1 bg-transparent pr-3 text-[15px] font-normal"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Contact person
          <input value={form.contactName} onChange={(e) => set({ contactName: e.target.value })} required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Login email
          <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} required className={inputClass} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Plan
          <select value={form.plan} onChange={(e) => set({ plan: e.target.value as typeof form.plan })} className={inputClass}>
            <option value="TRIAL">Free trial</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Template
          <select value={form.template} onChange={(e) => set({ template: e.target.value as typeof form.template })} className={inputClass}>
            {templateOrder.map((id) => (
              <option key={id} value={id}>
                {themes[id].name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Site language
          <select value={form.language} onChange={(e) => set({ language: e.target.value as SiteLanguage })} className={inputClass}>
            {siteLanguages.map((l) => (
              <option key={l} value={l}>
                {siteLanguageNames[l]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Free trial (days)
          <input inputMode="numeric" value={form.trialDays} onChange={(e) => set({ trialDays: e.target.value.replace(/\D/g, "") })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
          Already paid
          <select value={form.paidMonths} onChange={(e) => set({ paidMonths: e.target.value })} className={inputClass}>
            <option value="0">Not paid yet</option>
            <option value="1">1 month</option>
            <option value="3">3 months</option>
            <option value="12">12 months</option>
          </select>
        </label>
      </div>
      <p className="text-sm text-muted">
        Tip: to test what a paying client sees, choose <strong>Starter</strong> or <strong>Pro</strong> and mark 1 month as already paid.
      </p>

      {error && (
        <p role="alert" className="font-medium text-amora-dark">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="h-11 self-start rounded-[10px] bg-amora px-6 font-semibold text-white hover:bg-amora-dark disabled:opacity-50">
        {pending ? "Creating…" : "Create client"}
      </button>
    </form>
  );
}
