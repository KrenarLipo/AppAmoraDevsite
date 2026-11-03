import { getDb } from "@appamora/db";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localeNames, hasLocale } from "@/i18n/config";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, interestLabels, statusLabels, statusStyles } from "../data";
import { MessageActions } from "./message-actions";

export const metadata: Metadata = { title: "Message" };

export default async function MessagePage({ params }: PageProps<"/admin/messages/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const message = await getDb().contactMessage.findUnique({ where: { id } });
  if (!message) notFound();

  const replySubject = encodeURIComponent(`Re: ${interestLabels[message.interest]} — AppAmora`);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/admin/messages" className="eyebrow text-amora hover:underline">
        ← Messages
      </Link>

      <article className="flex flex-col gap-6 rounded-2xl border border-line bg-white p-6 md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-bold">{message.name}</h1>
            <a href={`mailto:${message.email}`} className="text-muted hover:text-amora">
              {message.email}
            </a>
          </div>
          <span className={`rounded-md px-2 py-1 font-mono text-[11px] uppercase ${statusStyles[message.status]}`}>
            {statusLabels[message.status]}
          </span>
        </header>

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px]">
          <dt className="text-muted">Interest</dt>
          <dd>{interestLabels[message.interest]}</dd>
          <dt className="text-muted">Language</dt>
          <dd>{hasLocale(message.locale) ? localeNames[message.locale] : message.locale}</dd>
          <dt className="text-muted">Received</dt>
          <dd>{formatDateTime(message.createdAt)}</dd>
        </dl>

        <p className="rounded-xl bg-cream p-5 leading-relaxed whitespace-pre-wrap">{message.message}</p>

        <div className="flex flex-wrap gap-3">
          <a
            href={`mailto:${message.email}?subject=${replySubject}`}
            className="flex h-11 items-center rounded-[10px] bg-amora px-5 font-semibold text-white hover:bg-amora-dark"
          >
            Reply by email
          </a>
          <MessageActions id={message.id} status={message.status} />
        </div>
      </article>
    </div>
  );
}
