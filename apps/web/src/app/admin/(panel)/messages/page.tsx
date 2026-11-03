import { getDb, type ContactStatus, type Prisma } from "@appamora/db";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { contactInterests, type ContactInterest } from "@/lib/catalog";
import { formatDateTime, interestLabels, isContactStatus, statusLabels, statusStyles } from "./data";

export const metadata: Metadata = { title: "Messages" };

const tabs: { value: ContactStatus | "all"; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "READ", label: "Read" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "all", label: "All" },
];

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  await requireAdmin();
  const params = await searchParams;
  // Default to the inbox: everything that isn't archived.
  const status = isContactStatus(params.status) ? params.status : params.status === "all" ? "all" : "inbox";
  const interest = contactInterests.find((i) => i === params.interest) as ContactInterest | undefined;

  const where: Prisma.ContactMessageWhereInput = {
    ...(status === "inbox" ? { status: { not: "ARCHIVED" } } : status === "all" ? {} : { status }),
    ...(interest && { interest }),
  };
  const messages = await getDb().contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted">From the contact form and the builder waitlist.</p>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        <FilterLink href="/admin/messages" active={status === "inbox"}>
          Inbox
        </FilterLink>
        {tabs.map((tab) => (
          <FilterLink key={tab.value} href={`/admin/messages?status=${tab.value}`} active={status === tab.value}>
            {tab.label}
          </FilterLink>
        ))}
        {interest && (
          <Link href="/admin/messages?status=all" className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm text-paper">
            {interestLabels[interest]} <span aria-label="Remove filter">×</span>
          </Link>
        )}
      </nav>

      {messages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">No messages here.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead className="font-mono text-xs text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">From</th>
                <th className="px-5 py-3 font-medium">Interest</th>
                <th className="px-5 py-3 font-medium">Message</th>
                <th className="px-5 py-3 font-medium">Received</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-cream">
                  <td className="px-5 py-4">
                    <Link href={`/admin/messages/${m.id}`} className={`hover:text-amora ${m.status === "NEW" ? "font-semibold" : ""}`}>
                      {m.name}
                    </Link>
                    <div className="text-sm text-muted">{m.email}</div>
                  </td>
                  <td className="px-5 py-4 text-sm">{interestLabels[m.interest]}</td>
                  <td className="max-w-xs truncate px-5 py-4 text-sm text-muted">{m.message}</td>
                  <td className="px-5 py-4 text-sm whitespace-nowrap text-muted">{formatDateTime(m.createdAt)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md px-2 py-1 font-mono text-[11px] uppercase ${statusStyles[m.status]}`}>
                      {statusLabels[m.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors ${active ? "bg-ink text-paper" : "border border-line-strong hover:border-ink"}`}
    >
      {children}
    </Link>
  );
}
