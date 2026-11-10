import { getDb } from "@appamora/db";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, interestLabels } from "./messages/data";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminHome() {
  const admin = await requireAdmin();
  const db = getDb();
  const [newCount, total, waitlist, latest, clients, pendingPayments, activity] = await Promise.all([
    db.contactMessage.count({ where: { status: "NEW" } }),
    db.contactMessage.count(),
    db.contactMessage.count({ where: { interest: "WEBSITE_BUILDER" } }),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.client.count(),
    db.payment.count({ where: { status: "PENDING" } }),
    db.clientActivity.findMany({
      where: { actor: "client" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { client: { select: { id: true, name: true } } },
    }),
  ]);

  const stats = [
    { label: "Clients", value: clients, href: "/admin/clients" },
    { label: "Payments to confirm", value: pendingPayments, href: "/admin/clients" },
    { label: "New messages", value: newCount, href: "/admin/messages?status=NEW" },
    { label: "All messages", value: total, href: "/admin/messages?status=all" },
    { label: "Builder waitlist", value: waitlist, href: "/admin/messages?status=all&interest=WEBSITE_BUILDER" },
  ];

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back, {admin.name.split(" ")[0]}</h1>
        <p className="text-muted">Here&apos;s what&apos;s happening on appamora.com.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex flex-[1_1_200px] flex-col gap-2 rounded-2xl border border-line bg-white p-6 transition-colors hover:border-ink"
          >
            <span className="eyebrow text-muted">{stat.label}</span>
            <span className="font-display text-4xl font-bold">{stat.value}</span>
          </Link>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Latest client activity</h2>
          <Link href="/admin/clients" className="font-semibold hover:text-amora">
            All clients →
          </Link>
        </div>
        {activity.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-muted">
            Nothing yet. When clients edit their websites or pay, it shows up here.
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {activity.map((a) => (
              <li key={a.id}>
                <Link href={`/admin/clients/${a.client.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 hover:bg-cream">
                  <span className="font-semibold">{a.client.name}</span>
                  <span className="min-w-0 flex-1 text-sm text-muted">{a.summary}</span>
                  <span className="text-sm text-muted">{formatDateTime(a.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Latest messages</h2>
          <Link href="/admin/messages" className="font-semibold hover:text-amora">
            View all →
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-muted">
            No messages yet. They&apos;ll appear here when someone uses the contact form.
          </p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {latest.map((m) => (
              <li key={m.id}>
                <Link href={`/admin/messages/${m.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 hover:bg-cream">
                  {m.status === "NEW" && <span className="size-2 rounded-full bg-amora" aria-label="New" />}
                  <span className={m.status === "NEW" ? "font-semibold" : ""}>{m.name}</span>
                  <span className="text-sm text-muted">{interestLabels[m.interest]}</span>
                  <span className="ml-auto text-sm text-muted">{formatDateTime(m.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
