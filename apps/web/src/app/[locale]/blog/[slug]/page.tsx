import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CtaBand } from "@/components/sections/cta-band";
import { getDictionary, getLocale } from "@/i18n";
import { format, localePath } from "@/i18n/utils";
import { formatDate, getPost, getPublishedSlugs } from "@/lib/blog";
import { jsonLd, pageMetadata } from "@/lib/metadata";
import { mediaUrl } from "@/lib/settings/schema";
import { siteConfig } from "@/lib/site";

// Posts published after the build are rendered on their first visit, then cached.
// Cache Components needs at least one param, so an empty blog prerenders a placeholder (a 404).
export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getPost(locale, slug);
  if (!post) return {};
  return pageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.description,
    type: "article",
    image: post.cover ?? undefined,
  });
}

// The slug is read inside <Suspense>: a post published after the build first gets the
// shared shell (with the skeleton below), then its own page, which is cached from then on.
export default function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  return (
    <>
      <Suspense fallback={<PostSkeleton />}>
        <PostContent params={params} />
      </Suspense>
      <CtaBand />
    </>
  );
}

function PostSkeleton() {
  return (
    <div aria-hidden className="container-page flex max-w-[760px] animate-pulse flex-col gap-5 pt-16 pb-24">
      <div className="h-4 w-24 rounded bg-sand" />
      <div className="mt-8 h-12 w-4/5 rounded bg-sand" />
      <div className="h-6 w-3/5 rounded bg-sand" />
      <div className="mt-6 h-64 rounded-2xl bg-sand" />
    </div>
  );
}

async function PostContent({ params }: Pick<PageProps<"/[locale]/blog/[slug]">, "params">) {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getPost(locale, slug);
  if (!post) notFound();
  const t = await getDictionary(locale);
  const cover = post.cover;

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
        {/* Markdown written in the admin; raw HTML is stripped (src/lib/markdown.ts). */}
        <div className="prose-amora" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
    </>
  );
}
