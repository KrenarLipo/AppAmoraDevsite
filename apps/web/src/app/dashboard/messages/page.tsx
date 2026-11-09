import { getDb } from "@appamora/db";
import type { Metadata } from "next";
import { requireClient } from "@/lib/client";
import { MessageActions } from "./message-actions";

export const metadata: Metadata = { title: "Messages" };

const formatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Tirane" });

export default async function MessagesPage() {
  const ctx = await requireClient();
  const messages = await getDb().siteMessage.findMany({ where: { siteId: ctx.site.id }, orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted">Sent with the contact form on your website.</p>
      </div>
      {messages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">No messages yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((m) => (
            <li key={m.id} className={`flex flex-col gap-3 rounded-2xl border bg-white p-5 ${m.read ? "border-line" : "border-amora"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="flex flex-col">
                  <span className="font-semibold">
                    {!m.read && <span className="mr-2 rounded bg-amora px-1.5 py-0.5 text-[11px] text-white uppercase">New</span>}
                    {m.name}
                  </span>
                  <a href={`mailto:${m.email}`} className="text-sm break-all text-muted underline underline-offset-2">
                    {m.email}
                  </a>
                </span>
                <span className="text-sm text-muted">{formatter.format(m.createdAt)}</span>
              </div>
              <p className="leading-relaxed whitespace-pre-line">{m.message}</p>
              <MessageActions id={m.id} read={m.read} email={m.email} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
