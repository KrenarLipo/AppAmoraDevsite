import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { readAllPostsForEdit } from "@/lib/blog-admin";
import { formatDate } from "@/lib/blog";
import { mediaUrl } from "@/lib/settings/schema";
import { StatusBadge } from "./status-badge";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogAdminPage() {
  await requireAdmin();
  const posts = await readAllPostsForEdit();

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted">Write in English first. Italian and Albanian are optional: without them, English is shown.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex h-11 items-center rounded-[10px] bg-amora px-5 font-semibold text-white transition-colors hover:bg-amora-dark"
        >
          + New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-muted">
          No posts yet. Click <strong>New post</strong> to write your first one.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/admin/blog/${post.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-cream">
                <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-sand sm:block">
                  {post.cover && <Image src={mediaUrl(post.cover)} alt="" fill sizes="96px" className="object-cover" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="font-semibold leading-snug">{post.title}</span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                    <StatusBadge status={post.status} />
                    <time dateTime={post.date}>{formatDate(post.date, "en")}</time>
                    {post.tag && <span>{post.tag}</span>}
                    <span className="flex gap-1" aria-label={`Languages: ${post.languages.join(", ").toUpperCase()}`}>
                      {(["en", "it", "sq"] as const).map((l) => (
                        <span
                          key={l}
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${post.languages.includes(l) ? "bg-ink text-paper" : "bg-sand text-mist line-through"}`}
                        >
                          {l}
                        </span>
                      ))}
                    </span>
                  </span>
                </div>
                <span aria-hidden className="text-muted">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
