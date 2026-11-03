import { ContactStatus } from "@appamora/db";
import type { Dictionary } from "@/i18n/types";
import en from "@/i18n/dictionaries/en";

export const statusLabels: Record<ContactStatus, string> = {
  NEW: "New",
  READ: "Read",
  ARCHIVED: "Archived",
};

export const statusStyles: Record<ContactStatus, string> = {
  NEW: "bg-amora text-white",
  READ: "bg-sand text-ink",
  ARCHIVED: "border border-line-strong text-muted",
};

export const interestLabels: Dictionary["contact"]["interests"] = en.contact.interests;

export function isContactStatus(value: unknown): value is ContactStatus {
  return typeof value === "string" && value in ContactStatus;
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
