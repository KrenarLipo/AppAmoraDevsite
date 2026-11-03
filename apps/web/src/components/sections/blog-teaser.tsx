import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n";
import { format, localePath } from "@/i18n/utils";
import { getPosts } from "@/lib/blog";
import { getSiteImages } from "@/lib/settings";
import { PostCard } from "./post-card";
import { SectionHeading } from "./section-heading";

export async function BlogTeaser() {
  const locale = await getLocale();
  const [t, { blogCovers }] = await Promise.all([getDictionary(locale), getSiteImages()]);
  const posts = getPosts(locale).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="container-page flex flex-col gap-10 py-24">
      <SectionHeading
        eyebrow={t.blog.eyebrow}
        title={t.blog.title}
        action={
          <Link
            href={localePath(locale, "/blog")}
            className="border-b-2 border-ink pb-1 font-semibold transition-colors hover:border-amora hover:text-amora"
          >
            {t.blog.all} →
          </Link>
        }
      />
      <div className="flex flex-wrap gap-5">
        {posts.map((post, i) => (
          <PostCard
            key={post.slug}
            post={post}
            index={i}
            cover={blogCovers[post.slug]}
            locale={locale}
            href={localePath(locale, `/blog/${post.slug}`)}
            readingTime={format(t.blog.readingTime, { minutes: post.readingMinutes })}
          />
        ))}
      </div>
    </section>
  );
}
