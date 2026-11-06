import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { readPostForEdit } from "@/lib/blog-admin";
import { PostEditor } from "../post-editor";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: PageProps<"/admin/blog/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const post = await readPostForEdit(id);
  if (!post) notFound();
  return <PostEditor key={id} initial={post} />;
}
