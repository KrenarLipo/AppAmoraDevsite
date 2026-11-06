import { getDb, type Prisma } from "@appamora/db";
import { updateTag } from "next/cache";
import type { z } from "zod";
import { SETTINGS_TAG } from ".";
import { defaultSiteInfo, siteInfoSchema, type SiteInfo } from "./site-info";
import { defaultImages, defaultMenus, imagesSchema, menusSchema, type Menus, type SiteImages } from "./schema";

// Uncached reads and writes for the admin area. Only call these after requireAdmin().

async function read<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  const row = await getDb().siteSetting.findUnique({ where: { key } });
  if (!row) return fallback;
  const parsed = schema.safeParse(row.value);
  return parsed.success ? parsed.data : fallback;
}

export const readMenusForEdit = (): Promise<Menus> => read("menus", menusSchema, defaultMenus);
export const readImagesForEdit = (): Promise<SiteImages> => read("images", imagesSchema, defaultImages);
export const readSiteInfoForEdit = (): Promise<SiteInfo> => read("site", siteInfoSchema, defaultSiteInfo);

/** Saves a setting and refreshes every page that shows it. Server actions only. */
export async function writeSetting(key: "menus" | "images" | "site", value: Menus | SiteImages | SiteInfo) {
  const json = value as unknown as Prisma.InputJsonValue;
  await getDb().siteSetting.upsert({ where: { key }, create: { key, value: json }, update: { value: json } });
  updateTag(SETTINGS_TAG);
}

/** Back to the built-in defaults. Server actions only. */
export async function deleteSetting(key: "menus" | "images" | "site") {
  await getDb().siteSetting.deleteMany({ where: { key } });
  updateTag(SETTINGS_TAG);
}
