"use server";

import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { deleteSetting, writeSetting } from "@/lib/settings/admin";
import { menusSchema } from "@/lib/settings/schema";

export type SaveMenusResult = { ok: true } | { ok: false; errors: string[] };

export async function saveMenus(menus: unknown): Promise<SaveMenusResult> {
  await requireAdmin();
  const parsed = menusSchema.safeParse(menus);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((issue) => describeIssue(issue.path, issue.message)) };
  }
  await writeSetting("menus", parsed.data);
  refresh();
  return { ok: true };
}

export async function resetMenus(): Promise<void> {
  await requireAdmin();
  await deleteSetting("menus");
  refresh();
}

/** Turns ["footer", 1, "links", 0, "label", "en"] into "Footer column 2 › link 1 › label (EN)". */
function describeIssue(path: PropertyKey[], message: string): string {
  const names: Record<string, string> = { header: "Header link", footer: "Footer column", links: "link" };
  const parts: string[] = [];
  for (let i = 0; i < path.length; i++) {
    const key = String(path[i]);
    const next = path[i + 1];
    if (key in names && typeof next === "number") {
      parts.push(`${names[key]} ${next + 1}`);
      i++;
    } else if ((key === "label" || key === "title") && typeof next === "string") {
      parts.push(`${key} (${next.toUpperCase()})`);
      i++;
    } else {
      parts.push(key === "href" ? "link address" : key);
    }
  }
  const friendly = /at least 1/.test(message) ? "English text is required" : message;
  return `${parts.join(" › ")}: ${friendly}`;
}
