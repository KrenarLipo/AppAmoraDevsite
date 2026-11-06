import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { readSiteInfoForEdit } from "@/lib/settings/admin";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const info = await readSiteInfoForEdit();

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Site settings</h1>
        <p className="text-muted">Contact details, social links, prices and company details. Changes go live as soon as you save.</p>
      </div>
      <SettingsForm initial={info} />
    </div>
  );
}
