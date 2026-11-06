"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { deleteImage, storeImage } from "@/lib/media";
import { readImagesForEdit, writeSetting } from "@/lib/settings/admin";
import { imageSlots, type ImageRef, type ImageSlot, type SiteImages } from "@/lib/settings/schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** "hero", "logo"… (blog covers are saved with each post in /admin/blog). */
type Target = { slot: ImageSlot };

function parseTarget(target: string): Target {
  if ((imageSlots as readonly string[]).includes(target)) return { slot: target as ImageSlot };
  throw new Error("Unknown image");
}

function getRef(images: SiteImages, t: Target): ImageRef {
  return images[t.slot];
}

function setRef(images: SiteImages, t: Target, ref: ImageRef): SiteImages {
  return { ...images, [t.slot]: ref };
}

export async function uploadImage(target: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const t = parseTarget(target);
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose an image first." };

  try {
    const stored = await storeImage(file, t.slot);
    const images = await readImagesForEdit();
    const previous = getRef(images, t);
    // Keep the alt text when an image is replaced.
    await writeSetting("images", setRef(images, t, { ...stored, alt: previous?.alt }));
    await deleteImage(previous?.id);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Upload failed." };
  }
  refresh();
  return { ok: true };
}

export async function removeImage(target: string): Promise<ActionResult> {
  await requireAdmin();
  const t = parseTarget(target);
  const images = await readImagesForEdit();
  const previous = getRef(images, t);
  await writeSetting("images", setRef(images, t, null));
  await deleteImage(previous?.id);
  refresh();
  return { ok: true };
}

const altSchema = z.object({ en: z.string().trim().max(200), it: z.string().trim().max(200), sq: z.string().trim().max(200) });

export async function saveImageAlt(target: string, alt: unknown): Promise<ActionResult> {
  await requireAdmin();
  const t = parseTarget(target);
  const parsed = altSchema.safeParse(alt);
  if (!parsed.success) return { ok: false, error: "Descriptions can be at most 200 characters." };

  const images = await readImagesForEdit();
  const current = getRef(images, t);
  if (!current) return { ok: false, error: "Upload an image first." };
  await writeSetting("images", setRef(images, t, { ...current, alt: parsed.data }));
  refresh();
  return { ok: true };
}
