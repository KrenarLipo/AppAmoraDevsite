import type { Metadata } from "next";
import { requireClient } from "@/lib/client";
import { HomeEditor } from "./home-editor";

export const metadata: Metadata = { title: "Home page" };

export default async function HomePageEditor() {
  const ctx = await requireClient();
  const { content } = ctx.site;
  return (
    <div className="flex max-w-5xl flex-col gap-6 pb-28">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Home page</h1>
        <p className="text-muted">The first thing visitors see. The rest of the home page text is under Pages → Home.</p>
      </div>
      <HomeEditor
        initial={{ hero: content.hero, slideshow: content.slideshow, subscribe: content.subscribe }}
        languages={content.languages.slice(0, ctx.limits.languages)}
        defaultLanguage={content.defaultLanguage}
        slideshowAllowed={ctx.limits.slideshow}
        subscribersAllowed={ctx.limits.subscribers}
        locked={ctx.locked}
      />
    </div>
  );
}
