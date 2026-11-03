import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/sections/cta-band";
import { getDictionary, getLocale } from "@/i18n";
import { format, localePath } from "@/i18n/utils";
import { formatDate, getAllSlugs, getPost } from "@/lib/blog";
import { jsonLd, pageMetadata } from "@/lib/metadata";
import { getSiteImages } from "@/lib/settings";
import { mediaUrl } from "@/lib/settings/schema";
import { siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const post = getPost(locale, slug);
  if (!post) return {};
  const { blogCovers } = await getSiteImages();
  return pageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.description,
    type: "article",
    image: blogCovers[slug],
  });
}

export default async function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const post = getPost(locale, slug);
  if (!post) notFound();
  const [t, { blogCovers }] = await Promise.all([getDictionary(locale), getSiteImages()]);
  const cover = blogCovers[slug];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: post.locale,
    url: `${siteConfig.url}${localePath(locale, `/blog/${slug}`)}`,
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <article lang={post.locale} className="container-page max-w-[760px] pt-16 pb-24">
        <Link href={localePath(locale, "/blog")} lang={locale} className="eyebrow text-amora hover:underline">
          ← {t.blog.back}
        </Link>
        <header className="mt-8 mb-10 flex flex-col gap-5 border-b border-line pb-10">
          {post.tag && <span className="eyebrow text-muted">{post.tag}</span>}
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.06] font-bold tracking-[-0.03em] text-balance">
            {post.title}
          </h1>
          {post.description && <p className="text-xl leading-relaxed text-muted">{post.description}</p>}
          <p className="text-sm text-muted">
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time> ·{" "}
            {format(t.blog.readingTime, { minutes: post.readingMinutes })}
          </p>
          {post.locale !== locale && (
            <p lang={locale} className="rounded-lg bg-sand px-4 py-3 text-sm text-ink">
              {t.blog.englishOnly}
            </p>
          )}
        </header>
        {cover && (
          <Image
            src={mediaUrl(cover)}
            alt=""
            width={cover.width}
            height={cover.height}
            sizes="(min-width: 800px) 712px, 100vw"
            priority
            className="mb-10 h-auto w-full rounded-2xl"
          />
        )}
        {/* Markdown from our own content folder, not user input. */}
        <div className="prose-amora" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      <CtaBand />
    </>
  );
}
