import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getSiteInfo } from "@/lib/settings";
import { NewClientForm } from "./new-client-form";

export const metadata: Metadata = { title: "New client" };

export default async function NewClientPage() {
  await requireAdmin();
  const info = await getSiteInfo();
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/admin/clients" className="text-sm font-medium text-muted hover:text-ink">
          ← All clients
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">New client</h1>
        <p className="text-muted">
          Creates the business account, a starter website and a login. You&apos;ll see the password once, to send to the client.
        </p>
      </div>
      <NewClientForm trialDays={info.pricing.trialDays} />
    </div>
  );
}
