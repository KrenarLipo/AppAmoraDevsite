"use client";

import { useEffect, useState, useTransition } from "react";
import { SocialIcon } from "@/components/social-links";
import { locales, type Locale } from "@/i18n/config";
import { formatEur, socialNames, socialNetworks, type SiteInfo } from "@/lib/settings/site-info";
import { saveSiteInfo } from "./actions";

const languageNames: Record<Locale, string> = { en: "English", it: "Italian", sq: "Albanian" };

const inputClass =
  "h-11 w-full min-w-0 rounded-[10px] border border-line-strong bg-cream px-3 text-[15px] text-ink transition-colors focus:border-ink aria-invalid:border-amora";

// Number fields are edited as text so they can be empty while typing.
type Form = Omit<SiteInfo, "pricing"> & { pricing: { starter: string; pro: string; trialDays: string } };

function toForm(info: SiteInfo): Form {
  return {
    ...info,
    pricing: {
      starter: String(info.pricing.starter),
      pro: String(info.pricing.pro),
      trialDays: String(info.pricing.trialDays),
    },
  };
}

function toNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

export function SettingsForm({ initial }: { initial: SiteInfo }) {
  const [form, setForm] = useState<Form>(() => toForm(initial));
  const [saved, setSaved] = useState(() => JSON.stringify(toForm(initial)));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(form) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set<S extends keyof Form>(section: S, patch: Partial<Form[S]>) {
    setForm((f) => ({ ...f, [section]: { ...f[section], ...patch } }));
  }

  function save() {
    setMessage(null);
    const input = {
      ...form,
      pricing: {
        starter: toNumber(form.pricing.starter),
        pro: toNumber(form.pricing.pro),
        trialDays: toNumber(form.pricing.trialDays),
      },
    };
    startTransition(async () => {
      const result = await saveSiteInfo(input);
      if (!result.ok) {
        setErrors(result.errors);
        const count = Object.keys(result.errors).length;
        setMessage({ type: "error", text: `Please fix ${count === 1 ? "1 field" : `${count} fields`} marked in red.` });
        return;
      }
      setErrors({});
      setSaved(JSON.stringify(form));
      setMessage({ type: "success", text: "Saved. The website is updated." });
    });
  }

  const field = (path: string) => ({ "aria-invalid": errors[path] ? true : undefined, error: errors[path] });

  return (
    <div className="flex flex-col gap-6 pb-28">
      <Section title="Contact" description="Shown on the contact page, in the Privacy Policy and Terms, and to Google.">
        <Field label="Email" {...field("contact.email")}>
          <input
            type="email"
            value={form.contact.email}
            onChange={(e) => set("contact", { email: e.target.value })}
            aria-invalid={field("contact.email")["aria-invalid"]}
            className={inputClass}
            autoComplete="email"
          />
        </Field>
        <Field label="Phone" hint="Optional. Include the country code, e.g. +355." {...field("contact.phone")}>
          <input
            type="tel"
            value={form.contact.phone}
            onChange={(e) => set("contact", { phone: e.target.value })}
            className={inputClass}
            autoComplete="tel"
          />
        </Field>
      </Section>

      <Section title="Social links" description="Paste the full address of each profile. Empty ones are hidden on the website.">
        {socialNetworks.map((network) => (
          <Field key={network} label={socialNames[network]} {...field(`social.${network}`)}>
            <div className="flex items-center gap-2">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-sand text-ink">
                <SocialIcon network={network} />
              </span>
              <input
                type="url"
                inputMode="url"
                value={form.social[network]}
                onChange={(e) => set("social", { [network]: e.target.value })}
                aria-invalid={field(`social.${network}`)["aria-invalid"]}
                placeholder="https://"
                className={inputClass}
              />
            </div>
          </Field>
        ))}
      </Section>

      <Section
        title="Prices"
        description="Used on the pricing page and homepage, in the pricing questions and in the Terms. Euros per month."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <PriceField label="Starter" value={form.pricing.starter} onChange={(v) => set("pricing", { starter: v })} {...field("pricing.starter")} />
          <PriceField label="Pro" value={form.pricing.pro} onChange={(v) => set("pricing", { pro: v })} {...field("pricing.pro")} />
          <Field label="Free trial" {...field("pricing.trialDays")}>
            <div className="flex items-center gap-2">
              <input
                inputMode="numeric"
                value={form.pricing.trialDays}
                onChange={(e) => set("pricing", { trialDays: e.target.value.replace(/[^\d]/g, "") })}
                aria-invalid={field("pricing.trialDays")["aria-invalid"]}
                className={inputClass}
              />
              <span className="text-sm text-muted">days</span>
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Company details" description="Shown in the Privacy Policy and the Terms.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" {...field("company.name")}>
            <input
              value={form.company.name}
              onChange={(e) => set("company", { name: e.target.value })}
              aria-invalid={field("company.name")["aria-invalid"]}
              className={inputClass}
            />
          </Field>
          <Field label="CEO" {...field("company.ceo")}>
            <input value={form.company.ceo} onChange={(e) => set("company", { ceo: e.target.value })} className={inputClass} />
          </Field>
          <Field label="NIPT (tax ID)" {...field("company.taxId")}>
            <input value={form.company.taxId} onChange={(e) => set("company", { taxId: e.target.value })} className={inputClass} />
          </Field>
        </div>
        {(["address", "country"] as const).map((key) => (
          <fieldset key={key} className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-semibold">{key === "address" ? "Address" : "Country"}</legend>
            {locales.map((l) => (
              <Field key={l} label={languageNames[l]} small {...field(`company.${key}.${l}`)}>
                <input
                  value={form.company[key][l]}
                  onChange={(e) => set("company", { [key]: { ...form.company[key], [l]: e.target.value } })}
                  aria-invalid={field(`company.${key}.${l}`)["aria-invalid"]}
                  placeholder={l === "en" ? "" : form.company[key].en}
                  className={inputClass}
                />
              </Field>
            ))}
          </fieldset>
        ))}
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:left-60">
        <div className="flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 md:px-10">
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="h-11 rounded-[10px] bg-amora px-6 font-semibold text-white transition-colors hover:bg-amora-dark disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          <span role="status" className="min-w-0 flex-1 text-sm font-medium">
            {message && (message.type === "error" || !dirty) ? (
              <span className={message.type === "error" ? "text-amora-dark" : "text-[#0F7A50]"}>{message.text}</span>
            ) : dirty ? (
              <span className="font-normal text-muted">Unsaved changes</span>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  small,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  small?: boolean;
  "aria-invalid"?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className={small ? "text-sm text-muted" : "text-sm font-medium"}>{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && <span className="text-sm text-amora-dark">{error}</span>}
    </label>
  );
}

function PriceField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  "aria-invalid"?: boolean;
}) {
  const preview = value.trim() !== "" && Number.isFinite(Number(value)) ? formatEur(Number(value), "en") : null;
  return (
    <Field label={label} error={error} hint={preview ? `Shown as ${preview}/month` : undefined}>
      <div className="flex items-center gap-2">
        <span className="text-muted">€</span>
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          aria-invalid={error ? true : undefined}
          className={inputClass}
        />
      </div>
    </Field>
  );
}
