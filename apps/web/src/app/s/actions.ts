"use server";

import { getDb } from "@appamora/db";
import { z } from "zod";
import { accountState, effectiveLimits } from "@/lib/plans";
import { isSiteLanguage } from "@/lib/sites/languages";

export type FormState = { status: "idle" | "success" | "invalid" | "error" };

const messageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  message: z.string().trim().min(2).max(5000),
});

async function findSite(slug: string) {
  const client = await getDb().client.findUnique({ where: { slug }, include: { site: { select: { id: true } } } });
  if (!client?.site) return null;
  const state = accountState(client, new Date());
  return { siteId: client.site.id, online: state.kind !== "locked", limits: effectiveLimits(client, state) };
}

/** The contact form on a client's site. Messages show up in the client's dashboard. */
export async function sendSiteMessage(slug: string, _prev: FormState, formData: FormData): Promise<FormState> {
  // Bots fill in the hidden "website" field; pretend it worked.
  if (formData.get("website")) return { status: "success" };
  const parsed = messageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { status: "invalid" };
  try {
    const site = await findSite(slug);
    if (!site?.online) return { status: "error" };
    await getDb().siteMessage.create({ data: { siteId: site.siteId, ...parsed.data } });
    return { status: "success" };
  } catch (error) {
    console.error("Could not save a site message", error);
    return { status: "error" };
  }
}

/** The subscriber form on a client's site (Starter and Pro). */
export async function subscribe(slug: string, language: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("website")) return { status: "success" };
  const email = z.email().max(200).safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!email.success) return { status: "invalid" };
  try {
    const site = await findSite(slug);
    if (!site?.online || !site.limits.subscribers) return { status: "error" };
    await getDb().subscriber.upsert({
      where: { siteId_email: { siteId: site.siteId, email: email.data } },
      create: { siteId: site.siteId, email: email.data, locale: isSiteLanguage(language) ? language : "en" },
      update: {},
    });
    return { status: "success" };
  } catch (error) {
    console.error("Could not save a subscriber", error);
    return { status: "error" };
  }
}
