"use server";

import { getDb, Prisma } from "@appamora/db";
import { refresh, updateTag } from "next/cache";
import { locales } from "@/i18n/config";
import { requireAdmin } from "@/lib/admin";
import { BLOG_TAG } from "@/lib/blog";
import { mediaIdsIn, postInputSchema } from "@/lib/blog-admin";
import { deleteImage, storeImage, type StoredImage } from "@/lib/media";

export type SavePostResult = { ok: true; id: string } | { ok: false; errors: string[] };

export async function savePost(input: unknown): Promise<SavePostResult> {
  await requireAdmin();
  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: [...new Set(parsed.error.issues.map((i) => i.message))] };
  const post = parsed.data;
  const db = getDb();

  const previous = post.id
    ? await db.blogPost.findUnique({ where: { id: post.id }, select: { cover: true } })
    : null;
  if (post.id && !previous) return { ok: false, errors: ["This post was deleted. Copy your text before leaving the page."] };

  const fields = {
    slug: post.slug,
    status: post.status,
    publishedAt: new Date(`${post.date}T00:00:00Z`),
    tag: post.tag,
    cover: post.cover ?? Prisma.DbNull,
  };

  let id: string;
  try {
    id = await db.$transaction(async (tx) => {
      const saved = post.id
        ? await tx.blogPost.update({ where: { id: post.id }, data: fields, select: { id: true } })
        : await tx.blogPost.create({ data: fields, select: { id: true } });
      for (const locale of locales) {
        const text = post.translations[locale];
        if (text.title) {
          await tx.blogPostTranslation.upsert({
            where: { postId_locale: { postId: saved.id, locale } },
            create: { postId: saved.id, locale, ...text },
            update: text,
          });
        } else {
          await tx.blogPostTranslation.deleteMany({ where: { postId: saved.id, locale } });
        }
      }
      return saved.id;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, errors: ["Another post already uses this web address. Choose a different one."] };
    }
    console.error("Could not save the post", error);
    return { ok: false, errors: ["Saving failed. Please try again."] };
  }

  // A replaced or removed cover is no longer needed.
  const oldCover = previous?.cover as { id?: string } | null | undefined;
  if (oldCover?.id && oldCover.id !== post.cover?.id) await deleteImage(oldCover.id);

  updateTag(BLOG_TAG);
  refresh();
  return { ok: true, id };
}

export async function deletePost(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const db = getDb();
  const post = await db.blogPost.findUnique({ where: { id }, include: { translations: { select: { body: true } } } });
  if (!post) return { ok: true };

  await db.blogPost.delete({ where: { id } });

  // Remove the cover and the pictures inside the post, unless another post uses them too.
  const cover = post.cover as { id?: string } | null;
  const candidates = new Set([...(cover?.id ? [cover.id] : []), ...post.translations.flatMap((t) => mediaIdsIn(t.body))]);
  if (candidates.size > 0) {
    const others = await db.blogPost.findMany({ select: { cover: true, translations: { select: { body: true } } } });
    const stillUsed = new Set(
      others.flatMap((p) => [
        ...((p.cover as { id?: string } | null)?.id ? [(p.cover as { id: string }).id] : []),
        ...p.translations.flatMap((t) => mediaIdsIn(t.body)),
      ]),
    );
    for (const mediaId of candidates) if (!stillUsed.has(mediaId)) await deleteImage(mediaId);
  }

  updateTag(BLOG_TAG);
  refresh();
  return { ok: true };
}

export type UploadResult = { ok: true; image: StoredImage } | { ok: false; error: string };

/** Stores a cover or a picture for inside a post. The post itself is saved separately. */
export async function uploadPostImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose an image first." };
  try {
    return { ok: true, image: await storeImage(file, "blogCover") };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Upload failed." };
  }
}
