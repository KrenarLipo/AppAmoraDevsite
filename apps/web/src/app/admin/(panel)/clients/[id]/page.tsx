import { getDb } from "@appamora/db";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { accountState, describeState, effectiveLimits, formatDay, planNames, toneClasses } from "@/lib/plans";
import { formatDateTime } from "../../messages/data";
import { cancelPayment, confirmPayment, viewAsClient } from "../actions";
import { ClientEditForm, DeleteClientButton, LoginsPanel, RecordPaymentForm } from "./client-panels";

export const metadata: Metadata = { title: "Client" };

const isoDay = (date: Date | null) => (date ? date.toISOString().slice(0, 10) : "");

export default async function ClientPage({ params }: PageProps<"/admin/clients/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const client = await getDb().client.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true, createdAt: true }, orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" }, take: 50 },
      activity: { orderBy: { createdAt: "desc" }, take: 30 },
      site: { select: { template: true, _count: { select: { messages: true, subscribers: true, pages: true } } } },
    },
  });
  if (!client) notFound();

  const state = accountState(client, new Date());
  const status = describeState(state);
  const limits = effectiveLimits(client, state);
  const viewAs = viewAsClient.bind(null, client.id);

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/admin/clients" className="text-sm font-medium text-muted hover:text-ink">
          ← All clients
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight">{client.name}</h1>
          <span className="rounded-md bg-sand px-2 py-1 font-mono text-[11px] uppercase">{planNames[client.plan]}</span>
          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${toneClasses[status.tone]}`}>{status.label}</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <form action={viewAs}>
            <button type="submit" className="flex h-11 items-center rounded-[10px] bg-ink px-5 font-semibold text-paper hover:bg-panel">
              View as client →
            </button>
          </form>
          <a
            href={`/s/${client.slug}`}
            target="_blank"
            rel="noopener"
            className="flex h-11 items-center rounded-[10px] border border-line-strong bg-white px-5 font-semibold hover:border-ink"
          >
            Open website ↗
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Pages", value: `${client.site?._count.pages ?? 0} / ${limits.pages}` },
          { label: "Messages", value: client.site?._count.messages ?? 0 },
          { label: "Subscribers", value: client.site?._count.subscribers ?? 0 },
          { label: "Logins", value: `${client.users.length} / ${limits.logins}` },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-4">
            <span className="eyebrow text-muted">{stat.label}</span>
            <span className="font-display text-2xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-xl font-bold">Payments</h2>
        {client.payments.length === 0 ? (
          <p className="text-sm text-muted">No payments yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {client.payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-[15px]">
                <span className="font-semibold">€{p.amount}</span>
                <span>
                  {planNames[p.plan]} · {p.months} {p.months === 1 ? "month" : "months"}
                </span>
                <span className="rounded bg-sand px-1.5 py-0.5 font-mono text-[11px] uppercase">{p.method === "PAYPAL" ? "PayPal" : "Cash"}</span>
                <span className="text-sm text-muted">{formatDateTime(p.createdAt)}</span>
                {p.status === "COMPLETED" && (
                  <span className="text-sm text-[#0F7A50]">Received{p.periodEnd ? ` · paid until ${formatDay(p.periodEnd)}` : ""}</span>
                )}
                {p.status === "CANCELLED" && <span className="text-sm text-muted line-through">Cancelled</span>}
                {p.status === "PENDING" && (
                  <span className="ml-auto flex gap-2">
                    <form action={confirmPayment.bind(null, p.id)}>
                      <button type="submit" className="h-10 rounded-[10px] bg-[#0F7A50] px-4 text-sm font-semibold text-white">
                        Mark received
                      </button>
                    </form>
                    <form action={cancelPayment.bind(null, p.id)}>
                      <button type="submit" className="h-10 rounded-[10px] border border-line-strong px-4 text-sm font-semibold">
                        Cancel
                      </button>
                    </form>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <RecordPaymentForm clientId={client.id} />
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-xl font-bold">Activity</h2>
        {client.activity.length === 0 ? (
          <p className="text-sm text-muted">No changes yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {client.activity.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 text-[15px]">
                <span className="w-32 shrink-0 text-sm text-muted">{formatDateTime(a.createdAt)}</span>
                <span className="min-w-0 flex-1">{a.summary}</span>
                {a.actor === "admin" && <span className="rounded bg-sand px-1.5 py-0.5 text-[11px] font-semibold">by you</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ClientEditForm
        clientId={client.id}
        initial={{
          name: client.name,
          slug: client.slug,
          plan: client.plan,
          trialEndsAt: isoDay(client.trialEndsAt),
          paidUntil: isoDay(client.paidUntil),
          customServices: client.customServices.join("\n"),
          notes: client.notes,
        }}
      />

      <LoginsPanel clientId={client.id} users={client.users.map((u) => ({ id: u.id, name: u.name, email: u.email }))} maxLogins={limits.logins} />

      <DeleteClientButton clientId={client.id} name={client.name} />
    </div>
  );
}
