import { randomBytes, randomUUID } from "node:crypto";
import { getDb, Prisma, type Plan } from "@appamora/db";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import type { TemplateId } from "./catalog";
import { defaultPages, defaultSiteContent } from "./sites/content";
import { siteLanguages } from "./sites/languages";
import { templateOrder } from "./sites/templates";

// Creating and managing client accounts from the admin. Only call after requireAdmin().

export const CLIENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Café Roma" → "cafe-roma". */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

/** A readable random password, e.g. "kq7m-2xpd-9tfa-hw3c". */
export function generatePassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(16);
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

export const newClientSchema = z.object({
  businessName: z.string().trim().min(1, "Add the business name").max(80),
  slug: z.string().trim().min(2, "Add a web address").max(60).regex(CLIENT_SLUG_PATTERN, "Use lowercase letters, numbers and dashes"),
  contactName: z.string().trim().min(1, "Add the contact person's name").max(120),
  email: z.email("Enter a valid email address").max(200),
  plan: z.enum(["TRIAL", "STARTER", "PRO", "CUSTOM"]),
  template: z.enum(templateOrder as [TemplateId, ...TemplateId[]]),
  language: z.enum(siteLanguages),
  trialDays: z.number().int().min(1).max(90),
  /** Months already paid (e.g. cash up front); 0 = not paid yet. */
  paidMonths: z.number().int().min(0).max(36),
});
export type NewClient = z.infer<typeof newClientSchema>;

export async function createClientAccount(input: NewClient): Promise<{ clientId: string; password: string }> {
  const db = getDb();
  const password = generatePassword();
  const passwordHash = await hashPassword(password);
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + input.trialDays * 86_400_000);
  const paidUntil = input.paidMonths > 0 ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + input.paidMonths, now.getUTCDate())) : null;
  const email = input.email.toLowerCase();

  const clientId = await db.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        name: input.businessName,
        slug: input.slug,
        plan: input.plan as Plan,
        trialEndsAt,
        paidUntil,
        site: {
          create: {
            template: input.template,
            content: defaultSiteContent(input.businessName, input.template, input.language) as unknown as Prisma.InputJsonValue,
            pages: {
              create: defaultPages(input.template).map((p) => ({ ...p, translations: p.translations as unknown as Prisma.InputJsonValue })),
            },
          },
        },
      },
    });
    const userId = randomUUID();
    await tx.user.create({
      data: { id: userId, name: input.contactName, email, emailVerified: true, role: "USER", clientId: client.id },
    });
    await tx.account.create({
      data: { id: randomUUID(), accountId: userId, providerId: "credential", userId, password: passwordHash },
    });
    return client.id;
  });
  return { clientId, password };
}

/** Sets a new random password on a client's login and signs them out everywhere. */
export async function resetClientPassword(userId: string): Promise<string> {
  const db = getDb();
  const password = generatePassword();
  const hash = await hashPassword(password);
  const credential = await db.account.findFirst({ where: { userId, providerId: "credential" } });
  if (credential) await db.account.update({ where: { id: credential.id }, data: { password: hash } });
  else await db.account.create({ data: { id: randomUUID(), accountId: userId, providerId: "credential", userId, password: hash } });
  await db.session.deleteMany({ where: { userId } });
  return password;
}

export async function addClientLogin(clientId: string, name: string, email: string): Promise<string> {
  const db = getDb();
  const password = generatePassword();
  const hash = await hashPassword(password);
  const userId = randomUUID();
  await db.$transaction([
    db.user.create({ data: { id: userId, name, email: email.toLowerCase(), emailVerified: true, role: "USER", clientId } }),
    db.account.create({ data: { id: randomUUID(), accountId: userId, providerId: "credential", userId, password: hash } }),
  ]);
  return password;
}
