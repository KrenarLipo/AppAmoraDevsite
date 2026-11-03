"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/i18n/types";
import { authClient } from "@/lib/auth-client";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

type Labels = Dictionary["auth"];

type Props = {
  labels: Labels;
  /** Where to go after logging in, and for Google's redirect. */
  callbackURL: string;
  /** This page's own path, used if Google login fails. */
  loginPath: string;
  googleEnabled: boolean;
  recaptchaSiteKey?: string;
  /** Read ?error= from the URL. Only inside a Suspense boundary. */
  readError?: boolean;
};

export function LoginForm({ readError, ...props }: Props) {
  return readError ? <LoginFormWithUrlError {...props} /> : <LoginFormInner {...props} />;
}

function LoginFormWithUrlError(props: Omit<Props, "readError">) {
  const code = useSearchParams().get("error");
  const { errors } = props.labels;
  // "forbidden" comes from our admin check; "signup_disabled" from Better Auth's Google redirect.
  const message = code === "forbidden" ? errors.forbidden : code === "signup_disabled" ? errors.googleNoAccount : code ? errors.generic : undefined;
  return <LoginFormInner {...props} initialError={message} />;
}

function getRecaptchaToken(siteKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return reject(new Error("reCAPTCHA did not load"));
    grecaptcha.ready(() => grecaptcha.execute(siteKey, { action: "login" }).then(resolve, reject));
  });
}

function LoginFormInner({
  labels,
  callbackURL,
  loginPath,
  googleEnabled,
  recaptchaSiteKey,
  initialError,
}: Omit<Props, "readError"> & { initialError?: string }) {
  const router = useRouter();
  const [error, setError] = useState(initialError);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(undefined);

    try {
      const headers: Record<string, string> = {};
      if (recaptchaSiteKey) headers["x-captcha-response"] = await getRecaptchaToken(recaptchaSiteKey);

      const { error } = await authClient.signIn.email(
        { email: String(form.get("email")), password: String(form.get("password")) },
        { headers },
      );
      if (error) {
        setError(error.status === 429 ? labels.errors.tooMany : labels.errors.invalid);
        setPending(false);
        return;
      }
      router.replace(callbackURL);
      router.refresh();
    } catch {
      setError(labels.errors.network);
      setPending(false);
    }
  }

  async function signInWithGoogle() {
    setPending(true);
    await authClient.signIn.social({ provider: "google", callbackURL, errorCallbackURL: loginPath });
  }

  const inputClass = "h-12 rounded-[10px] border border-line-strong bg-white px-3.5 text-base focus:border-ink";
  const [beforePrivacy, afterPrivacy = ""] = labels.recaptcha.split("{privacy}");
  const [between, afterTerms] = afterPrivacy.split("{terms}");

  return (
    <div className="flex flex-col gap-5">
      {recaptchaSiteKey && (
        <Script src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`} strategy="afterInteractive" />
      )}

      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={pending}
            className="flex h-[52px] items-center justify-center gap-3 rounded-xl border-[1.5px] border-line-strong bg-white font-semibold transition-colors hover:border-ink disabled:opacity-60"
          >
            <GoogleLogo />
            {labels.google}
          </button>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="h-px flex-1 bg-line" />
            {labels.orEmail}
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-sm font-medium">
            {labels.email}
          </label>
          <input id="login-email" name="email" type="email" autoComplete="username" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className="text-sm font-medium">
            {labels.password}
          </label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
        </div>
        {error && (
          <p role="alert" className="text-[15px] font-medium text-amora-dark">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="h-[52px] rounded-xl bg-amora font-semibold text-white transition-colors hover:bg-amora-dark disabled:opacity-60"
        >
          {pending ? labels.signingIn : labels.signIn}
        </button>
        {recaptchaSiteKey && (
          <p className="text-xs leading-relaxed text-muted">
            {beforePrivacy}
            <a href="https://policies.google.com/privacy" className="underline">
              {labels.privacy}
            </a>
            {between}
            <a href="https://policies.google.com/terms" className="underline">
              {labels.terms}
            </a>
            {afterTerms}
          </p>
        )}
      </form>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" />
      <path d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9.1L6.4 14z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10c.8-2.4 3-4.1 5.6-4.1z" fill="#EA4335" />
    </svg>
  );
}
