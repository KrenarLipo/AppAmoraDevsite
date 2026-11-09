"use client";

import { useActionState } from "react";
import { sendSiteMessage, subscribe, type FormState } from "@/app/s/actions";
import type { siteStrings } from "@/lib/sites/strings";

type Labels = (typeof siteStrings)["en"];

const inputClass =
  "h-12 w-full rounded-(--site-radius) border border-(--site-text)/20 bg-(--site-bg) px-3.5 text-base text-(--site-text) focus:border-(--site-primary) focus:outline-none";
const buttonClass =
  "h-12 rounded-(--site-radius) bg-(--site-primary) px-6 font-semibold text-(--site-on-primary) transition-opacity hover:opacity-90 disabled:opacity-60";

/** Hidden from people; bots that fill it in are ignored. */
const honeypot = (
  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0" />
);

export function ContactForm({ slug, language, labels }: { slug: string; language: string; labels: Labels }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendSiteMessage.bind(null, slug), { status: "idle" });
  if (state.status === "success") return <p role="status" className="text-lg font-semibold">{labels.sent}</p>;

  return (
    <form action={action} lang={language} className="relative flex flex-col gap-4">
      {honeypot}
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {labels.name}
        <input name="name" required autoComplete="name" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {labels.email}
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {labels.message}
        <textarea name="message" required rows={5} className={`${inputClass} h-auto py-3`} />
      </label>
      {state.status !== "idle" && (
        <p role="alert" className="text-sm font-medium">
          {state.status === "invalid" ? labels.invalid : labels.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? labels.sending : labels.send}
      </button>
    </form>
  );
}

export function SubscribeForm({ slug, language, labels }: { slug: string; language: string; labels: Labels }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe.bind(null, slug, language), { status: "idle" });
  if (state.status === "success") return <p role="status" className="font-semibold">{labels.subscribed}</p>;

  return (
    <form action={action} className="relative flex w-full max-w-md flex-col gap-2 sm:flex-row">
      {honeypot}
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={labels.emailPlaceholder}
        aria-label={labels.email}
        className={inputClass}
      />
      <button type="submit" disabled={pending} className={`${buttonClass} shrink-0`}>
        {labels.subscribe}
      </button>
      {state.status !== "idle" && (
        <p role="alert" className="text-sm sm:basis-full">
          {state.status === "invalid" ? labels.invalid : labels.error}
        </p>
      )}
    </form>
  );
}
