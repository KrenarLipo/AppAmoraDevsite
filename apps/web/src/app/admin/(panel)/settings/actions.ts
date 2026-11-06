"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { writeSetting } from "@/lib/settings/admin";
import { siteInfoSchema } from "@/lib/settings/site-info";

/** Field errors keyed by path, e.g. { "contact.email": "Enter a valid email address" }. */
export type SaveSiteInfoResult = { ok: true } | { ok: false; errors: Record<string, string> };

export async function saveSiteInfo(input: unknown): Promise<SaveSiteInfoResult> {
  await requireAdmin();
  const parsed = siteInfoSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      errors[key] ??= /expected number/i.test(issue.message) ? "Enter a number" : issue.message;
    }
    return { ok: false, errors };
  }
  await writeSetting("site", parsed.data);
  refresh();
  return { ok: true };
}
