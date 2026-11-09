import type { Metadata } from "next";
import { requireClient } from "@/lib/client";
import { DesignEditor } from "./design-editor";

export const metadata: Metadata = { title: "Design" };

export default async function DesignPage() {
  const ctx = await requireClient();
  const { content } = ctx.site;
  return (
    <div className="flex max-w-5xl flex-col gap-6 pb-28">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Design</h1>
        <p className="text-muted">Choose how your website looks: template, name, logo, colors and fonts.</p>
      </div>
      <DesignEditor
        initial={{ template: ctx.site.template, brandName: content.brandName, logo: content.logo, colors: content.colors, fonts: content.fonts }}
        templatesAllowed={ctx.limits.templates}
        designAllowed={ctx.limits.design}
        locked={ctx.locked}
        siteUrl={`/s/${ctx.client.slug}`}
      />
    </div>
  );
}
