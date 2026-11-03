import { getDb } from "@appamora/db";
import sharp, { type OutputInfo } from "sharp";
import type { ImageSlot } from "./settings/schema";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** How each kind of image is resized. Everything becomes WebP without metadata. */
const presets: Record<ImageSlot | "blogCover", { width: number; height: number; fit: "inside" | "cover" }> = {
  logo: { width: 800, height: 256, fit: "inside" },
  logoDark: { width: 800, height: 256, fit: "inside" },
  // The standard size for link previews (Facebook, WhatsApp, LinkedIn, X).
  social: { width: 1200, height: 630, fit: "cover" },
  hero: { width: 2000, height: 2000, fit: "inside" },
  about: { width: 1600, height: 1600, fit: "inside" },
  blogCover: { width: 1600, height: 1600, fit: "inside" },
};

export type StoredImage = { id: string; width: number; height: number };

/** Re-encodes an upload and stores it. Throws a user-facing message on bad input. */
export async function storeImage(file: File, kind: keyof typeof presets): Promise<StoredImage> {
  if (file.size === 0) throw new Error("The file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("The image is too large (max 4 MB).");

  const preset = presets[kind];
  let output: { data: Buffer; info: OutputInfo };
  try {
    output = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000, density: 300 })
      .rotate() // apply the phone's orientation before EXIF is dropped
      .resize({ width: preset.width, height: preset.height, fit: preset.fit, withoutEnlargement: preset.fit === "inside" })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new Error("That file isn't an image we can read. Use JPG, PNG, WebP or SVG.");
  }

  const media = await getDb().media.create({
    data: {
      mimeType: "image/webp",
      width: output.info.width,
      height: output.info.height,
      size: output.info.size,
      data: new Uint8Array(output.data),
    },
    select: { id: true, width: true, height: true },
  });
  return media;
}

export async function deleteImage(id: string | undefined) {
  if (id) await getDb().media.deleteMany({ where: { id } });
}
