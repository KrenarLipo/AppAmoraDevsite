import { getDb } from "@appamora/db";
import type { Metadata } from "next";
import Link from "next/link";
import { requireClient } from "@/lib/client";
import { describeState, planNames, toneClasses } from "@/lib/plans";
import { getTheme } from "@/lib/sites/templates";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardHome() {
  const ctx = await requireClient();
  const db = getDb();
  const [unread, subscribers, pages] = await Promise.all([
    db.siteMessage.count({ where: { siteId: ctx.site.id, read: false } }),
    db.subscriber.count({ where: { siteId: ctx.site.id } }),
    db.sitePage.count({ where: { siteId: ctx.site.id } }),
  ]);
  const status = describeState(ctx.state);
  const { content } = ctx.site;
  const siteUrl = `/s/${ctx.client.slug}`;
  const plan = ctx.state.kind === "paid" ? planNames[ctx.client.plan] : planNames.TRIAL;

  const steps = [
    { done: Boolean(content.logo), label: "Add your logo", href: "/dashboard/design" },
    { done: true, label: `Pick a template (now: ${getTheme(ctx.site.template).name})`, href: "/dashboard/design" },
    { done: content.hero.headline[content.defaultLanguage] !== "", label: "Write your home page headline", href: "/dashboard/home" },
    { done: Boolean(content.contact.phone || content.contact.email), label: "Add your phone or email", href: "/dashboard/details" },
    { done: ctx.state.kind === "paid", label: "Choose a plan to keep your site online", href: "/dashboard/billing" },
  ];

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Hello, {ctx.viewingAsAdmin ? ctx.client.name : ctx.user.name.split(" ")[0]}</h1>
        <p className="text-muted">Manage your website from here. Changes go live as soon as you save.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-[2_1_360px] flex-col gap-4 rounded-2xl bg-ink p-6 text-paper">
          <span className="eyebrow text-amora-bright">Your website</span>
          <p className="font-display text-2xl font-bold break-all">appamora.com{siteUrl}</p>
          <div className="flex flex-wrap gap-2">
            <a href={siteUrl} target="_blank" rel="noopener" className="flex h-11 items-center rounded-[10px] bg-amora px-5 font-semibold text-white hover:bg-amora-dark">
              Open website ↗
            </a>
            <Link href="/dashboard/design" className="flex h-11 items-center rounded-[10px] border border-panel-line px-5 font-semibold hover:border-paper">
              Change design
            </Link>
          </div>
          {ctx.locked && <p className="text-sm text-amora-bright">Your website is offline until you choose a plan.</p>}
        </div>
        <div className="flex flex-[1_1_240px] flex-col gap-3 rounded-2xl border border-line bg-white p-6">
          <span className="eyebrow text-muted">Plan</span>
          <span className="font-display text-2xl font-bold">{plan}</span>
          <span className={`self-start rounded-md px-2 py-1 text-xs font-semibold ${toneClasses[status.tone]}`}>{status.label}</span>
          {ctx.client.plan === "CUSTOM" && ctx.client.customServices.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-muted">
              {ctx.client.customServices.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/billing" className="mt-auto text-sm font-semibold underline decoration-amora underline-offset-4">
            Plan & billing
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "New messages", value: unread, href: "/dashboard/messages" },
          { label: "Subscribers", value: ctx.limits.subscribers ? subscribers : "—", href: "/dashboard/subscribers" },
          { label: "Pages", value: `${pages} / ${ctx.limits.pages}`, href: "/dashboard/pages" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink">
            <span className="eyebrow text-muted">{stat.label}</span>
            <span className="font-display text-3xl font-bold">{stat.value}</span>
          </Link>
        ))}
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-display text-xl font-bold">Get your site ready</h2>
        <ul className="flex flex-col divide-y divide-line">
          {steps.map((step) => (
            <li key={step.label}>
              <Link href={step.href} className="flex min-h-12 items-center gap-3 py-2 hover:text-amora">
                <span
                  aria-label={step.done ? "Done" : "To do"}
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.done ? "bg-[#0F7A50] text-white" : "border-2 border-line-strong"}`}
                >
                  {step.done ? "✓" : ""}
                </span>
                <span className={step.done ? "text-muted line-through" : "font-medium"}>{step.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
