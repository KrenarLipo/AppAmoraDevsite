"use client";

import { useState, useTransition } from "react";
import { addLogin, deleteClient, recordPayment, removeLogin, resetPassword, updateClient } from "../actions";

const inputClass = "h-11 w-full min-w-0 rounded-[10px] border border-line-strong bg-cream px-3 text-[15px] focus:border-ink";
const cardClass = "flex flex-col gap-4 rounded-2xl border border-line bg-white p-5";

type EditValues = {
  name: string;
  slug: string;
  plan: "TRIAL" | "STARTER" | "PRO" | "CUSTOM";
  trialEndsAt: string;
  paidUntil: string;
  customServices: string;
  notes: string;
};

function Status({ message }: { message: { ok: boolean; text: string } | null }) {
  if (!message) return null;
  return (
    <p role={message.ok ? "status" : "alert"} className={`text-sm font-medium ${message.ok ? "text-[#0F7A50]" : "text-amora-dark"}`}>
      {message.text}
    </p>
  );
}

export function ClientEditForm({ clientId, initial }: { clientId: string; initial: EditValues }) {
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const set = (patch: Partial<EditValues>) => setValues((v) => ({ ...v, ...patch }));

  function save(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateClient(clientId, values);
      setMessage(result.ok ? { ok: true, text: "Saved." } : { ok: false, text: result.error });
    });
  }

  return (
    <form onSubmit={save} className={cardClass}>
      <h2 className="font-display text-xl font-bold">Account</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Business name
          <input value={values.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Website address (/s/…)
          <input value={values.slug} onChange={(e) => set({ slug: e.target.value.toLowerCase() })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Plan
          <select value={values.plan} onChange={(e) => set({ plan: e.target.value as EditValues["plan"] })} className={inputClass}>
            <option value="TRIAL">Free trial</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Free trial ends
          <input type="date" value={values.trialEndsAt} onChange={(e) => set({ trialEndsAt: e.target.value })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          <span>
            Paid until <span className="font-normal text-muted">(empty = not paid)</span>
          </span>
          <div className="flex gap-2">
            <input type="date" value={values.paidUntil} onChange={(e) => set({ paidUntil: e.target.value })} className={inputClass} />
            {values.paidUntil && (
              <button type="button" onClick={() => set({ paidUntil: "" })} className="shrink-0 rounded-[10px] border border-line-strong px-3 text-sm font-semibold">
                Clear
              </button>
            )}
          </div>
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        <span>
          Services bought <span className="font-normal text-muted">(Custom plan, one per line, e.g. &ldquo;AI chatbot&rdquo;)</span>
        </span>
        <textarea
          value={values.customServices}
          onChange={(e) => set({ customServices: e.target.value })}
          rows={3}
          className={`${inputClass} h-auto py-2.5`}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        <span>
          Notes <span className="font-normal text-muted">(only you see these)</span>
        </span>
        <textarea value={values.notes} onChange={(e) => set({ notes: e.target.value })} rows={3} className={`${inputClass} h-auto py-2.5`} />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="h-11 rounded-[10px] bg-amora px-6 font-semibold text-white hover:bg-amora-dark disabled:opacity-50">
          {pending ? "Saving…" : "Save account"}
        </button>
        <Status message={message} />
      </div>
    </form>
  );
}

export function RecordPaymentForm({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ plan: "STARTER", months: "1", amount: "" });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-11 self-start rounded-[10px] border border-line-strong px-4 font-semibold hover:border-ink">
        + Record a cash payment
      </button>
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await recordPayment(clientId, { plan: values.plan, months: Number(values.months), amount: Number(values.amount) });
      if (result.ok) {
        setMessage({ ok: true, text: "Payment recorded. The account is extended." });
        setOpen(false);
      } else setMessage({ ok: false, text: result.error });
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl bg-cream p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Plan
          <select value={values.plan} onChange={(e) => setValues({ ...values, plan: e.target.value })} className={inputClass}>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Months
          <input inputMode="numeric" value={values.months} onChange={(e) => setValues({ ...values, months: e.target.value.replace(/\D/g, "") })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Amount received (€)
          <input inputMode="numeric" value={values.amount} onChange={(e) => setValues({ ...values, amount: e.target.value.replace(/\D/g, "") })} required className={inputClass} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className="h-11 rounded-[10px] bg-ink px-5 font-semibold text-paper disabled:opacity-50">
          Record payment
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-[10px] px-4 font-semibold text-muted">
          Cancel
        </button>
        <Status message={message} />
      </div>
    </form>
  );
}

type Login = { id: string; name: string; email: string };

export function LoginsPanel({ clientId, users, maxLogins }: { clientId: string; users: Login[]; maxLogins: number }) {
  const [password, setPassword] = useState<{ email: string; password: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [newLogin, setNewLogin] = useState({ name: "", email: "" });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function reset(user: Login) {
    if (!confirm(`Create a new password for ${user.email}? The old one stops working.`)) return;
    startTransition(async () => {
      const result = await resetPassword(user.id);
      if (result.ok) setPassword({ email: user.email, password: result.password });
      else setMessage({ ok: false, text: result.error });
    });
  }

  function remove(user: Login) {
    if (!confirm(`Remove the login ${user.email}?`)) return;
    startTransition(() => removeLogin(user.id));
  }

  function add(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await addLogin(clientId, newLogin.name, newLogin.email);
      if (result.ok) {
        setPassword({ email: newLogin.email, password: result.password });
        setAdding(false);
        setNewLogin({ name: "", email: "" });
      } else setMessage({ ok: false, text: result.error });
    });
  }

  return (
    <section className={cardClass}>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl font-bold">Logins</h2>
        <p className="text-sm text-muted">The plan allows {maxLogins === 1 ? "1 login" : `${maxLogins} logins`}.</p>
      </div>
      {password && (
        <div className="flex flex-col gap-1 rounded-xl bg-[#E3F4EC] p-4">
          <p className="text-sm font-semibold text-[#0F7A50]">New password for {password.email} (shown only now):</p>
          <p className="font-mono text-lg font-bold break-all">{password.password}</p>
        </div>
      )}
      <ul className="flex flex-col divide-y divide-line">
        {users.map((user) => (
          <li key={user.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-semibold">{user.name}</span>
              <span className="text-sm break-all text-muted">{user.email}</span>
            </span>
            <span className="flex gap-2">
              <button type="button" disabled={pending} onClick={() => reset(user)} className="h-10 rounded-[10px] border border-line-strong px-3 text-sm font-semibold">
                New password
              </button>
              <button type="button" disabled={pending} onClick={() => remove(user)} className="h-10 rounded-[10px] border border-line-strong px-3 text-sm font-semibold text-amora-dark">
                Remove
              </button>
            </span>
          </li>
        ))}
      </ul>
      {adding ? (
        <form onSubmit={add} className="flex flex-col gap-3 rounded-xl bg-cream p-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
            Name
            <input value={newLogin.name} onChange={(e) => setNewLogin({ ...newLogin, name: e.target.value })} required className={inputClass} />
          </label>
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
            Email
            <input type="email" value={newLogin.email} onChange={(e) => setNewLogin({ ...newLogin, email: e.target.value })} required className={inputClass} />
          </label>
          <button type="submit" disabled={pending} className="h-11 rounded-[10px] bg-ink px-5 font-semibold text-paper">
            Add
          </button>
        </form>
      ) : (
        users.length < maxLogins && (
          <button type="button" onClick={() => setAdding(true)} className="h-11 self-start rounded-[10px] border border-line-strong px-4 font-semibold hover:border-ink">
            + Add a login
          </button>
        )
      )}
      <Status message={message} />
    </section>
  );
}

export function DeleteClientButton({ clientId, name }: { clientId: string; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (prompt(`This deletes ${name}, its website, messages, subscribers and logins. Type DELETE to confirm.`) === "DELETE") {
          startTransition(() => deleteClient(clientId));
        }
      }}
      className="h-11 self-start rounded-[10px] border border-line-strong bg-white px-5 font-semibold text-amora-dark hover:border-amora-dark"
    >
      Delete client
    </button>
  );
}
