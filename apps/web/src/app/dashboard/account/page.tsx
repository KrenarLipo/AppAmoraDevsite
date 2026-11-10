import type { Metadata } from "next";
import { requireClient } from "@/lib/client";
import { planNames } from "@/lib/plans";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const ctx = await requireClient();
  const paid = ctx.state.kind === "paid";
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted">Your login and email notifications.</p>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-xl font-bold">Your login</h2>
        <dl className="grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-[auto_1fr]">
          <dt className="text-muted">Name</dt>
          <dd className="font-medium">{ctx.viewingAsAdmin ? "—" : ctx.user.name}</dd>
          <dt className="text-muted">Email</dt>
          <dd className="font-medium break-all">{ctx.viewingAsAdmin ? "—" : ctx.user.email}</dd>
          <dt className="text-muted">Business</dt>
          <dd className="font-medium">{ctx.client.name}</dd>
        </dl>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-bold">Change password</h2>
          <p className="text-sm text-muted">At least 12 characters. You&apos;ll stay logged in here; other devices are logged out.</p>
        </div>
        {ctx.viewingAsAdmin ? (
          <p className="rounded-xl bg-sand px-4 py-3 text-sm">You&apos;re viewing as admin. To give the client a new password, use Admin → Clients → New password.</p>
        ) : (
          <PasswordForm />
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-xl font-bold">Email notifications</h2>
        {paid ? (
          <p className="text-[15px] text-muted">
            On your {planNames[ctx.client.plan]} plan we email you when changes to your website go live (grouped, at most every 30 minutes) and
            when we receive a payment.
          </p>
        ) : (
          <p className="text-[15px] text-muted">
            Email confirmations of your website changes and payments are included in the Starter and Pro plans.
          </p>
        )}
      </section>
    </div>
  );
}
