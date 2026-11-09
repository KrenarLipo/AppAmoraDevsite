import { getDb } from "@appamora/db";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { accountState, describeState, planNames, toneClasses } from "@/lib/plans";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage() {
  await requireAdmin();
  const clients = await getDb().client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { email: true }, take: 1 },
      _count: { select: { payments: { where: { status: "PENDING" } } } },
    },
  });
  const now = new Date();

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted">Businesses using the website builder. Create test clients to see their side.</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex h-11 items-center rounded-[10px] bg-amora px-5 font-semibold text-white transition-colors hover:bg-amora-dark"
        >
          + New client
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">
          No clients yet. Click <strong>New client</strong> to create one.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {clients.map((client) => {
            const status = describeState(accountState(client, now));
            const pending = client._count.payments;
            return (
              <li key={client.id}>
                <Link href={`/admin/clients/${client.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-cream">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="font-semibold">{client.name}</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                      <span className="rounded-md bg-sand px-2 py-0.5 font-mono text-[11px] text-ink uppercase">{planNames[client.plan]}</span>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${toneClasses[status.tone]}`}>{status.label}</span>
                      {pending > 0 && (
                        <span className="rounded-md bg-amora px-2 py-0.5 text-xs font-semibold text-white">
                          {pending} payment{pending > 1 ? "s" : ""} to confirm
                        </span>
                      )}
                      <span className="truncate">{client.users[0]?.email}</span>
                    </span>
                  </div>
                  <span aria-hidden className="text-muted">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
