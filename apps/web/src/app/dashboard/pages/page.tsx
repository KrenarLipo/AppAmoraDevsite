import { getDb } from "@appamora/db";
import type { Metadata } from "next";
import Link from "next/link";
import { requireClient } from "@/lib/client";
import { CONTACT_SLUG, HOME_SLUG, parsePageTexts } from "@/lib/sites/content";
import { PageRowActions } from "./page-row-actions";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesPage() {
  const ctx = await requireClient();
  const pages = await getDb().sitePage.findMany({
    where: { siteId: ctx.site.id },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  const main = ctx.site.content.defaultLanguage;
  const canAdd = !ctx.locked && pages.length < ctx.limits.pages;

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted">
            {pages.length} of {ctx.limits.pages >= 50 ? "unlimited" : ctx.limits.pages} pages used. The order here is the order in your menu.
          </p>
        </div>
        {canAdd ? (
          <Link href="/dashboard/pages/new" className="flex h-11 items-center rounded-[10px] bg-amora px-5 font-semibold text-white hover:bg-amora-dark">
            + New page
          </Link>
        ) : (
          !ctx.locked && (
            <Link href="/dashboard/billing" className="flex h-11 items-center rounded-[10px] border border-line-strong px-5 font-semibold">
              🔒 Upgrade for more pages
            </Link>
          )
        )}
      </div>

      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
        {pages.map((page, index) => {
          const texts = parsePageTexts(page.translations);
          const title = texts[main].title || texts.en.title || "Untitled";
          const special = page.slug === HOME_SLUG ? "Home page" : page.slug === CONTACT_SLUG ? "With contact form" : null;
          const overLimit = index >= ctx.limits.pages;
          return (
            <li key={page.id} className="flex flex-wrap items-center gap-3 p-4">
              <Link href={`/dashboard/pages/${page.id}`} className="flex min-w-0 flex-1 flex-col gap-1 hover:text-amora">
                <span className="font-semibold">{title}</span>
                <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                  <span className="font-mono">/{page.slug}</span>
                  {special && <span>{special}</span>}
                  {!page.showInMenu && <span>Hidden from menu</span>}
                  {overLimit && <span className="text-amora-dark">Not shown: over your plan&apos;s page limit</span>}
                </span>
              </Link>
              {!ctx.locked && (
                <PageRowActions id={page.id} canMoveUp={index > 1} canMoveDown={index > 0 && index < pages.length - 1} canDelete={page.slug !== HOME_SLUG} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
