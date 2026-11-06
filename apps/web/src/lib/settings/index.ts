import { getDb } from "@appamora/db";
import { cacheLife, cacheTag } from "next/cache";
import type { z } from "zod";
import { defaultSiteInfo, siteInfoSchema, type SiteInfo } from "./site-info";
import { defaultImages, defaultMenus, imagesSchema, menusSchema, type Menus, type SiteImages } from "./schema";

/** Saving any setting calls updateTag(SETTINGS_TAG), so pages pick up the change on the next request. */
export const SETTINGS_TAG = "site-settings";

type ReadResult<T> = { ok: true; value: T | undefined } | { ok: false };

async function readSetting<T>(key: string, schema: z.ZodType<T>): Promise<ReadResult<T>> {
  try {
    const row = await getDb().siteSetting.findUnique({ where: { key } });
    if (!row) return { ok: true, value: undefined };
    const parsed = schema.safeParse(row.value);
    if (!parsed.success) console.error(`Invalid "${key}" setting, using defaults`, parsed.error.issues);
    return { ok: true, value: parsed.success ? parsed.data : undefined };
  } catch (error) {
    // No database (e.g. a build without DATABASE_URL): show defaults, but retry soon.
    console.error(`Could not read the "${key}" setting`, error);
    return { ok: false };
  }
}

export async function getMenus(): Promise<Menus> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  const result = await readSetting("menus", menusSchema);
  if (result.ok) cacheLife("max");
  else cacheLife("minutes");
  return (result.ok && result.value) || defaultMenus;
}

export async function getSiteImages(): Promise<SiteImages> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  const result = await readSetting("images", imagesSchema);
  if (result.ok) cacheLife("max");
  else cacheLife("minutes");
  return (result.ok && result.value) || defaultImages;
}

/** Contact, social links, prices and company details (edited at /admin/settings). */
export async function getSiteInfo(): Promise<SiteInfo> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  const result = await readSetting("site", siteInfoSchema);
  if (result.ok) cacheLife("max");
  else cacheLife("minutes");
  return (result.ok && result.value) || defaultSiteInfo;
}
