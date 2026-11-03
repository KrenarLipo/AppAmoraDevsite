// Browser-only. Phone photos are often 5–15 MB; shrinking them before upload keeps
// requests small (and under Vercel's 4.5 MB limit). The server re-encodes them anyway.

const MAX_SIDE = 2400;
const TARGET_BYTES = 3_500_000;

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImage(file: File): Promise<File> {
  // SVGs are small and are rasterized on the server.
  if (file.type === "image/svg+xml") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // a format this browser can't decode; the server will report it
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= TARGET_BYTES) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Keep transparency for logos (PNG/WebP/GIF); photos become JPEG.
  const hasAlpha = ["image/png", "image/webp", "image/gif"].includes(file.type);
  let blob = await toBlob(canvas, hasAlpha ? "image/webp" : "image/jpeg", 0.9);
  // Safari can't encode WebP and silently returns PNG, which may be large.
  if (blob && blob.size > TARGET_BYTES) blob = await toBlob(canvas, "image/jpeg", 0.85);
  if (!blob) return file;

  const extension = blob.type.split("/")[1] ?? "img";
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + extension, { type: blob.type });
}
