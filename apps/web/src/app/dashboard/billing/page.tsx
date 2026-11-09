import { getDb } from "@appamora/db";
import type { Metadata } from "next";
import { requireClient } from "@/lib/client";
import { paypalEnabled } from "@/lib/paypal";
import { describeState, formatDay, planLimits, planNames, toneClasses } from "@/lib/plans";
import { getSiteInfo } from "@/lib/settings";
import { CheckoutPanel } from "./checkout-panel";

export const metadata: Metadata = { title: "Plan & billing" };

const formatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Tirane" });

export default async function BillingPage() {
  const ctx = await requireClient();
  const [info, payments] = await Promise.all([
    getSiteInfo(),
    getDb().payment.findMany({ where: { clientId: ctx.client.id, status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  const status = describeState(ctx.state);
  const pendingCash = payments.find((p) => p.method === "CASH" && p.status === "PENDING");
  const currentPlan = ctx.state.kind === "paid" ? ctx.client.plan : "TRIAL";

  const features = (plan: "STARTER" | "PRO") => {
    const l = planLimits[plan];
    return [
      "All 6 templates",
      "Your colors and fonts",
      "Photo slideshow",
      l.pages >= 50 ? "Unlimited pages" : `Up to ${l.pages} pages`,
      l.languages === 5 ? "All 5 languages" : `${l.languages} languages`,
      "Subscriber form and list",
      "WhatsApp chat button",
      ...(plan === "PRO" ? ["No AppAmora badge", `${l.logins} team logins`, "Priority support and 1 hour of changes a month"] : []),
    ];
  };

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Plan & billing</h1>
        <p className="text-muted">Pay by PayPal or card, or in cash. Prices are per month.</p>
      </div>

      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="eyebrow text-muted">Current plan</span>
          <span className="font-display text-2xl font-bold">{planNames[currentPlan]}</span>
        </div>
        <span className={`rounded-md px-2 py-1 text-sm font-semibold ${toneClasses[status.tone]}`}>{status.label}</span>
        {ctx.client.plan === "CUSTOM" && (
          <p className="basis-full text-sm text-muted">
            You&apos;re on a custom plan{ctx.client.customServices.length > 0 ? `: ${ctx.client.customServices.join(", ")}` : ""}. Contact us for changes.
          </p>
        )}
      </section>

      {pendingCash && (
        <p className="rounded-2xl bg-[#FFF3D6] p-4 text-[#5C3D00]">
          <strong>Cash payment requested</strong>: €{pendingCash.amount} for {planNames[pendingCash.plan]}, {pendingCash.months}{" "}
          {pendingCash.months === 1 ? "month" : "months"}. We&apos;ll contact you to collect it, and your account is extended as soon as it&apos;s received.
        </p>
      )}

      {ctx.client.plan !== "CUSTOM" && (
        <CheckoutPanel
          prices={{ STARTER: info.pricing.starter, PRO: info.pricing.pro }}
          features={{ STARTER: features("STARTER"), PRO: features("PRO") }}
          defaultPlan={ctx.client.plan === "PRO" ? "PRO" : "STARTER"}
          paypalClientId={paypalEnabled() ? (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? null) : null}
          cashAllowed={!pendingCash}
          paidUntil={ctx.state.kind === "paid" ? formatDay(ctx.state.until) : null}
        />
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-xl font-bold">Payment history</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted">No payments yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-[15px]">
                <span className="font-semibold">€{p.amount}</span>
                <span>
                  {planNames[p.plan]} · {p.months} {p.months === 1 ? "month" : "months"}
                </span>
                <span className="text-sm text-muted">{p.method === "PAYPAL" ? "PayPal / card" : "Cash"}</span>
                <span className="text-sm text-muted">{formatter.format(p.createdAt)}</span>
                <span className={`ml-auto text-sm font-semibold ${p.status === "COMPLETED" ? "text-[#0F7A50]" : "text-[#8A5A00]"}`}>
                  {p.status === "COMPLETED" ? "Paid" : "Waiting"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
