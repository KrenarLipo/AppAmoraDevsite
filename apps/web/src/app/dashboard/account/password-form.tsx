"use client";

import { useState, useTransition } from "react";
import { changePassword } from "./actions";

const inputClass = "h-11 w-full rounded-[10px] border border-line-strong bg-cream px-3 text-[15px] focus:border-ink";

export function PasswordForm() {
  const [values, setValues] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await changePassword(values);
      if (result.ok) {
        setValues({ currentPassword: "", newPassword: "", confirm: "" });
        setMessage({ ok: true, text: "Password changed." });
      } else setMessage({ ok: false, text: result.error });
    });
  }

  const field = (key: keyof typeof values, label: string, autoComplete: string) => (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <input
        type={show ? "text" : "password"}
        value={values[key]}
        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
        autoComplete={autoComplete}
        required
        className={inputClass}
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {field("currentPassword", "Current password", "current-password")}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("newPassword", "New password", "new-password")}
        {field("confirm", "Repeat the new password", "new-password")}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="size-4 accent-amora" />
        Show passwords
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="h-11 rounded-[10px] bg-amora px-6 font-semibold text-white hover:bg-amora-dark disabled:opacity-50">
          {pending ? "Saving…" : "Change password"}
        </button>
        {message && (
          <span role={message.ok ? "status" : "alert"} className={`text-sm font-medium ${message.ok ? "text-[#0F7A50]" : "text-amora-dark"}`}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
