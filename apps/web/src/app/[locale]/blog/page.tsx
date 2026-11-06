import type { Metadata } from "next";
import { PostCard } from "@/components/sections/post-card";
import { SectionHeading } from "@/components/sections/section-heading";
import { getDictionary, getLocale } from "@/i18n";
import { format, localePath } from "@/i18n/utils";
import { getPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return pageMetadata({ locale, path: "/blog", title: t.nav.blog, description: t.blog.title });
}

export default async function BlogPage() {
  const locale = await getLocale();
  const [t, posts] = await Promise.all([getDictionary(locale), getPosts(locale)]);

  return (
    <section className="container-page flex flex-col gap-12 pt-16 pb-24">
      <SectionHeading as="h1" eyebrow={t.blog.eyebrow} title={t.blog.title} />
      {posts.length === 0 ? (
        <p className="text-muted">{t.blog.empty}</p>
      ) : (
        <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard
              key={post.slug}
              post={post}
              index={i}
              cover={post.cover}
              locale={locale}
              href={localePath(locale, `/blog/${post.slug}`)}
              readingTime={format(t.blog.readingTime, { minutes: post.readingMinutes })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
