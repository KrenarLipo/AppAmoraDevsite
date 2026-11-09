import type { Metadata } from "next";
import { requireClient } from "@/lib/client";
import { UpgradeNote } from "../ui";
import { DetailsEditor } from "./details-editor";

export const metadata: Metadata = { title: "Contact & languages" };

export default async function DetailsPage() {
  const ctx = await requireClient();
  const { content } = ctx.site;
  return (
    <div className="flex max-w-5xl flex-col gap-6 pb-28">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Contact & languages</h1>
        <p className="text-muted">Shown on your contact page and at the bottom of every page.</p>
      </div>
      {ctx.locked ? (
        <UpgradeNote>Your trial has ended. Choose a plan to edit these details again.</UpgradeNote>
      ) : (
        <DetailsEditor
          initial={{ contact: content.contact, social: content.social, languages: content.languages, defaultLanguage: content.defaultLanguage }}
          maxLanguages={ctx.limits.languages}
          whatsappAllowed={ctx.limits.whatsapp}
        />
      )}
    </div>
  );
}
