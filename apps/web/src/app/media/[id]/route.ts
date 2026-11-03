import { getDb } from "@appamora/db";

// Uploaded images. An id never changes content (replacing an image creates a new id),
// so browsers and CDNs may cache each one forever.
export async function GET(_request: Request, { params }: RouteContext<"/media/[id]">) {
  const { id } = await params;
  const media = await getDb().media.findUnique({ where: { id }, select: { data: true, mimeType: true } });
  if (!media) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(media.data), {
    headers: {
      "Content-Type": media.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
