import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getPosts } from "@/lib/blog";
import { readImagesForEdit } from "@/lib/settings/admin";
import { ImageSlot } from "./image-slot";

export const metadata: Metadata = { title: "Images" };

export default async function ImagesPage() {
  await requireAdmin();
  const [images, posts] = await Promise.all([readImagesForEdit(), getPosts("en")]);

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Images</h1>
        <p className="text-muted">
          Changes go live on the website as soon as you save. Photos from your phone are fine: they&apos;re resized
          automatically and location data is removed.
        </p>
      </div>

      <Section title="Brand">
        <ImageSlot
          target="logo"
          title="Logo"
          description="Shown in the header. Use a PNG or SVG with a transparent background, wider than it is tall."
          image={images.logo}
          emptyLabel="Using the built-in AppAmora logo"
          aspect="3 / 1"
        />
        <ImageSlot
          target="logoDark"
          title="Logo on dark backgrounds"
          description="Optional. A light version for the footer. Without it, the normal logo is shown on a light badge."
          image={images.logoDark}
          emptyLabel="Using the normal logo on a light badge"
          darkPreview
          aspect="3 / 1"
        />
        <ImageSlot
          target="social"
          title="Social share image"
          description="The preview when someone shares appamora.com on WhatsApp, Instagram, Facebook or LinkedIn. Cropped to 1200 × 630."
          image={images.social}
          emptyLabel="No preview image yet"
          aspect="1200 / 630"
        />
      </Section>

      <Section title="Pages">
        <ImageSlot
          target="hero"
          title="Homepage hero image"
          description="The big image at the top of the homepage. Without it, the dashboard illustration is shown."
          image={images.hero}
          emptyLabel="Showing the dashboard illustration"
          withAlt
        />
        <ImageSlot
          target="about"
          title="About page photo"
          description="A photo of you or your team, shown next to your story."
          image={images.about}
          emptyLabel="No photo yet"
          withAlt
          aspect="4 / 5"
        />
      </Section>

      <Section title="Blog covers">
        {posts.map((post) => (
          <ImageSlot
            key={post.slug}
            target={`blog:${post.slug}`}
            title={post.title}
            description="Cover image on the blog cards and at the top of the article."
            image={images.blogCovers[post.slug] ?? null}
            emptyLabel="Using a colored block"
          />
        ))}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}
