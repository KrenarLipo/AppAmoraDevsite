import { getDb } from "@appamora/db";
import { requireClient } from "@/lib/client";

/** The subscriber list as a CSV file that opens in Excel (UTF-8 with BOM, so ë and ç display correctly). */
export async function GET() {
  const ctx = await requireClient();
  if (!ctx.limits.subscribers) return new Response("Not included in your plan", { status: 403 });
  const subscribers = await getDb().subscriber.findMany({ where: { siteId: ctx.site.id }, orderBy: { createdAt: "asc" } });

  // Quote every cell, and neutralize values Excel would run as formulas.
  const cell = (value: string) => `"${(/^[=+\-@]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
  const rows = [["Email", "Language", "Signed up"], ...subscribers.map((s) => [s.email, s.locale, s.createdAt.toISOString().slice(0, 10)])];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${ctx.client.slug}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
