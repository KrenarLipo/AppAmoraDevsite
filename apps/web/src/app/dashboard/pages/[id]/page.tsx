import { getDb } from "@appamora/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/client";
import { CONTACT_SLUG, HOME_SLUG, parsePageTexts } from "@/lib/sites/content";
import { UpgradeNote } from "../../ui";
import { PageEditor } from "../page-editor";

export const metadata: Metadata = { title: "Edit page" };

export default async function EditPage({ params }: PageProps<"/dashboard/pages/[id]">) {
  const ctx = await requireClient();
  const { id } = await params;
  const page = await getDb().sitePage.findFirst({ where: { id, siteId: ctx.site.id } });
  if (!page) notFound();
  if (ctx.locked) return <UpgradeNote>Your trial has ended. Choose a plan to edit your pages again.</UpgradeNote>;
  return (
    <PageEditor
      key={page.id}
      initial={{ id: page.id, slug: page.slug, showInMenu: page.showInMenu, translations: parsePageTexts(page.translations) }}
      kind={page.slug === HOME_SLUG ? "home" : page.slug === CONTACT_SLUG ? "contact" : "normal"}
      languages={ctx.site.content.languages.slice(0, ctx.limits.languages)}
      defaultLanguage={ctx.site.content.defaultLanguage}
      siteUrl={`/s/${ctx.client.slug}`}
    />
  );
}
