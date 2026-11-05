"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { sendContactMessage, type ContactField, type ContactState } from "@/app/[locale]/contact/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { localePath } from "@/i18n/utils";
import { contactInterests, type ContactInterest } from "@/lib/catalog";

type Props = {
  locale: Locale;
  labels: Dictionary["contact"]["form"];
  interests: Dictionary["contact"]["interests"];
  defaultInterest?: ContactInterest;
};

const inputClass =
  "h-12 rounded-[10px] border border-line-strong bg-cream px-3.5 text-base text-ink transition-colors focus:border-ink aria-invalid:border-amora";

export function ContactForm({ locale, labels, interests, defaultInterest = "AI_AGENTS" }: Props) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, { status: "idle" });

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-xl border border-line bg-cream p-6 text-lg font-medium">
        {labels.success}
      </p>
    );
  }

  const invalid = (field: ContactField) => state.status === "invalid" && state.fields.includes(field);
  const values = state.status === "idle" ? {} : state.values;

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label={labels.name} error={invalid("name") ? labels.errors.name : undefined} id="contact-name">
        <input id="contact-name" name="name" type="text" autoComplete="name" required defaultValue={values.name} aria-invalid={invalid("name")} aria-describedby={invalid("name") ? "contact-name-error" : undefined} className={inputClass} />
      </Field>
      <Field label={labels.email} error={invalid("email") ? labels.errors.email : undefined} id="contact-email">
        <input id="contact-email" name="email" type="email" autoComplete="email" required defaultValue={values.email} aria-invalid={invalid("email")} aria-describedby={invalid("email") ? "contact-email-error" : undefined} className={inputClass} />
      </Field>
      <Field label={labels.interest} id="contact-interest">
        <select id="contact-interest" name="interest" defaultValue={values.interest ?? defaultInterest} className={`${inputClass} px-3`}>
          {contactInterests.map((value) => (
            <option key={value} value={value}>
              {interests[value]}
            </option>
          ))}
        </select>
      </Field>
      <Field label={labels.message} error={invalid("message") ? labels.errors.message : undefined} id="contact-message">
        <textarea id="contact-message" name="message" rows={5} required minLength={10} defaultValue={values.message} aria-invalid={invalid("message")} aria-describedby={invalid("message") ? "contact-message-error" : undefined} className={`${inputClass} h-auto resize-y py-3`} />
      </Field>

      {state.status === "error" && (
        <p role="alert" className="text-[15px] font-medium text-amora-dark">
          {labels.errors.generic}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-[52px] rounded-xl bg-ink text-base font-semibold text-paper transition-colors hover:bg-panel disabled:opacity-60"
      >
        {pending ? labels.sending : labels.submit}
      </button>
      <PrivacyNote locale={locale} note={labels.privacyNote} link={labels.privacyLink} />
    </form>
  );
}

function PrivacyNote({ locale, note, link }: { locale: Locale; note: string; link: string }) {
  const [before, after = ""] = note.split("{privacy}");
  return (
    <p className="text-sm leading-relaxed text-muted">
      {before}
      <Link href={localePath(locale, "/privacy")} className="font-medium text-ink underline decoration-amora underline-offset-4">
        {link}
      </Link>
      {after}
    </p>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-amora-dark">
          {error}
        </p>
      )}
    </div>
  );
}

/** Pre-selects the interest from `?interest=…`, e.g. the builder waitlist links. */
export function ContactFormFromQuery(props: Omit<Props, "defaultInterest">) {
  const param = useSearchParams().get("interest");
  const defaultInterest = contactInterests.find((value) => value === param);
  // `key` remounts the form when the query changes so defaultValue applies.
  return <ContactForm key={defaultInterest} {...props} defaultInterest={defaultInterest} />;
}
