import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { formatDate, type PostMeta } from "@/lib/blog";
import { mediaUrl, type ImageRef } from "@/lib/settings/schema";

// Without a cover image, colors rotate so a row of cards reads like the design.
const covers = [
  "bg-ink text-amora-bright",
  "bg-amora text-white",
  "bg-[#DAD6CB] text-ink",
];

type Props = {
  post: PostMeta;
  href: string;
  locale: Locale;
  readingTime: string;
  index: number;
  cover: ImageRef;
};

export function PostCard({ post, href, locale, readingTime, index, cover }: Props) {
  return (
    <Link href={href} className="group flex flex-[1_1_320px] flex-col gap-3.5">
      {cover ? (
        <div className="relative h-[200px] overflow-hidden rounded-[14px] bg-sand">
          <Image
            src={mediaUrl(cover)}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-[18px] left-[18px] rounded-md bg-ink/80 px-2 py-1 font-mono text-xs text-paper uppercase">
            {post.tag}
          </span>
        </div>
      ) : (
        <div className={`flex h-[200px] items-end rounded-[14px] p-[18px] ${covers[index % covers.length]}`}>
          <span className="font-mono text-xs uppercase">{post.tag}</span>
        </div>
      )}
      <p className="text-[13px] text-muted">
        <time dateTime={post.date}>{formatDate(post.date, locale)}</time> · {readingTime}
      </p>
      <h3 className="font-display text-[22px] leading-tight font-semibold transition-colors group-hover:text-amora">
        {post.title}
      </h3>
      {post.description && <p className="text-[15px] leading-relaxed text-muted">{post.description}</p>}
    </Link>
  );
}
