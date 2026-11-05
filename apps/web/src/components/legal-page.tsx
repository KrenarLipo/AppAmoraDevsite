import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n";
import { format, localePath } from "@/i18n/utils";
import { formatDate } from "@/lib/blog";
import { getLegalPage, legalDocs, type LegalDoc } from "@/lib/legal";
import { pageMetadata } from "@/lib/metadata";

export async function legalMetadata(doc: LegalDoc): Promise<Metadata> {
  const locale = await getLocale();
  const page = getLegalPage(locale, doc);
  return pageMetadata({ locale, path: `/${doc}`, title: page.title, description: page.description });
}

/** Privacy Policy and Terms: markdown from content/legal, with a switch between the two. */
export async function LegalPageView({ doc }: { doc: LegalDoc }) {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const page = getLegalPage(locale, doc);

  return (
    <article lang={page.locale} className="container-page max-w-[820px] pt-16 pb-24">
      <nav aria-label={t.legal.nav} className="flex flex-wrap gap-2">
        {legalDocs.map((other) => (
          <Link
            key={other}
            href={localePath(locale, `/${other}`)}
            aria-current={other === doc ? "page" : undefined}
            className={
              other === doc
                ? "rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper"
                : "rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
            }
          >
            {t.legal[other]}
          </Link>
        ))}
      </nav>
      <header className="mt-10 mb-10 flex flex-col gap-4 border-b border-line pb-10">
        <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.06] font-bold tracking-[-0.03em] text-balance">
          {page.title}
        </h1>
        <p className="text-sm text-muted">
          {format(t.legal.updated, { date: formatDate(page.updated, locale) })}
        </p>
      </header>
      {/* Markdown from our own content folder, not user input. */}
      <div className="prose-amora" dangerouslySetInnerHTML={{ __html: page.html }} />
    </article>
  );
}
