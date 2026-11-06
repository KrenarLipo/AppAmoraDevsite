import type { Metadata } from "next";
import en from "@/i18n/dictionaries/en";
import { requireAdmin } from "@/lib/admin";
import { readAllPostsForEdit } from "@/lib/blog-admin";
import { serviceSlugs } from "@/lib/catalog";
import { readMenusForEdit } from "@/lib/settings/admin";
import { MenuEditor } from "./menu-editor";

export const metadata: Metadata = { title: "Menus" };

export default async function MenusPage() {
  await requireAdmin();
  const [menus, posts] = await Promise.all([readMenusForEdit(), readAllPostsForEdit()]);

  const pages = [
    { path: "/", label: "Home" },
    { path: "/services", label: en.nav.services },
    ...serviceSlugs.map((slug) => ({ path: `/services/${slug}`, label: en.services.items[slug].name })),
    { path: "/templates", label: en.nav.templates },
    { path: "/pricing", label: en.nav.pricing },
    { path: "/blog", label: en.nav.blog },
    ...posts.map((post) => ({ path: `/blog/${post.slug}`, label: post.title })),
    { path: "/about", label: en.nav.about },
    { path: "/contact", label: en.nav.contact },
    { path: "/login", label: en.nav.login },
  ];

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Menus</h1>
        <p className="text-muted">
          Rename, reorder, hide or add links. Site pages like <code className="rounded bg-sand px-1">/pricing</code> open in
          the visitor&apos;s language automatically. Empty Italian or Albanian text falls back to English.
        </p>
      </div>
      <MenuEditor initial={menus} pages={pages} />
    </div>
  );
}
