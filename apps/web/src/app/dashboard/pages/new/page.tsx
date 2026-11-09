import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDb } from "@appamora/db";
import { requireClient } from "@/lib/client";
import { emptyPageTexts } from "@/lib/sites/content";
import { PageEditor } from "../page-editor";

export const metadata: Metadata = { title: "New page" };

export default async function NewPage() {
  const ctx = await requireClient();
  const count = await getDb().sitePage.count({ where: { siteId: ctx.site.id } });
  if (ctx.locked || count >= ctx.limits.pages) redirect("/dashboard/pages");
  return (
    <PageEditor
      initial={{ id: null, slug: "", showInMenu: true, translations: emptyPageTexts() }}
      kind="normal"
      languages={ctx.site.content.languages.slice(0, ctx.limits.languages)}
      defaultLanguage={ctx.site.content.defaultLanguage}
      siteUrl={`/s/${ctx.client.slug}`}
    />
  );
}
