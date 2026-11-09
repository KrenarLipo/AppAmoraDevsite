import { getDb } from "@appamora/db";
import type { Metadata } from "next";
import { requireClient } from "@/lib/client";
import { UpgradeNote } from "../ui";
import { DeleteSubscriber } from "./delete-subscriber";

export const metadata: Metadata = { title: "Subscribers" };

const formatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Tirane" });

export default async function SubscribersPage() {
  const ctx = await requireClient();
  if (!ctx.limits.subscribers) {
    return (
      <div className="flex max-w-4xl flex-col gap-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Subscribers</h1>
        <UpgradeNote>Collect emails from your visitors with a subscriber form. Part of the Starter and Pro plans.</UpgradeNote>
      </div>
    );
  }
  const subscribers = await getDb().subscriber.findMany({ where: { siteId: ctx.site.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">Subscribers</h1>
          <p className="text-muted">
            {subscribers.length} {subscribers.length === 1 ? "person has" : "people have"} signed up on your website.
            {!ctx.site.content.subscribe.enabled && " The subscriber box is turned off: turn it on in Home page."}
          </p>
        </div>
        {subscribers.length > 0 && (
          <a href="/dashboard/subscribers/export" download className="flex h-11 items-center rounded-[10px] border border-line-strong bg-white px-5 font-semibold hover:border-ink">
            Download (Excel / CSV)
          </a>
        )}
      </div>
      {subscribers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">No subscribers yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {subscribers.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1 break-all font-medium">{s.email}</span>
              <span className="font-mono text-xs text-muted uppercase">{s.locale}</span>
              <span className="text-sm text-muted">{formatter.format(s.createdAt)}</span>
              <DeleteSubscriber id={s.id} email={s.email} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
