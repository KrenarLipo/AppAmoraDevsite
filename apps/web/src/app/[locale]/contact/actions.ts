"use server";

import { getDb } from "@appamora/db";
import { z } from "zod";
import { locales } from "@/i18n/config";
import { contactInterests } from "@/lib/catalog";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  interest: z.enum(contactInterests),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(locales),
  // Honeypot: hidden from people, bots tend to fill it in.
  company: z.string().max(0).optional(),
});

export type ContactField = "name" | "email" | "message";

/** What the visitor typed, sent back so the form can be refilled after React resets it. */
export type ContactValues = Partial<Record<"name" | "email" | "interest" | "message", string>>;

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "invalid"; fields: ContactField[]; values: ContactValues }
  | { status: "error"; values: ContactValues };

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(formData);
  const values: ContactValues = {};
  for (const key of ["name", "email", "interest", "message"] as const) {
    if (typeof raw[key] === "string") values[key] = raw[key];
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fields = new Set<ContactField>();
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "email" || field === "message") fields.add(field);
    }
    // A filled honeypot or tampered hidden field: pretend it worked.
    if (fields.size === 0) return { status: "success" };
    return { status: "invalid", fields: [...fields], values };
  }

  const { company: _honeypot, ...data } = parsed.data;
  try {
    await getDb().contactMessage.create({ data });
    return { status: "success" };
  } catch (error) {
    console.error("Failed to save contact message", error);
    return { status: "error", values };
  }
}
