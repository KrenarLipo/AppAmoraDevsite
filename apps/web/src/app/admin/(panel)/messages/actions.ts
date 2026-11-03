"use server";

import { getDb } from "@appamora/db";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { isContactStatus } from "./data";

// Server actions are public endpoints: each one checks for an admin first.

export async function setMessageStatus(id: string, status: string) {
  await requireAdmin();
  if (!isContactStatus(status)) throw new Error("Invalid status");
  await getDb().contactMessage.update({ where: { id }, data: { status } });
  refresh();
}

/** Called when a NEW message is opened; leaves READ and ARCHIVED ones alone. */
export async function markMessageRead(id: string) {
  await requireAdmin();
  await getDb().contactMessage.updateMany({ where: { id, status: "NEW" }, data: { status: "READ" } });
  refresh();
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await getDb().contactMessage.delete({ where: { id } });
  redirect("/admin/messages");
}
