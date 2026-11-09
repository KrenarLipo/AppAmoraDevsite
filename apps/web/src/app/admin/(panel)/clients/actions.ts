"use server";

import { getDb, Prisma, type Plan } from "@appamora/db";
import { refresh, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { VIEW_AS_COOKIE } from "@/lib/client";
import { addClientLogin, CLIENT_SLUG_PATTERN, createClientAccount, newClientSchema, resetClientPassword } from "@/lib/clients-admin";
import { completePayment } from "@/lib/payments";
import { siteTag } from "@/lib/sites/public";

type Errors = { ok: false; error: string };

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form.";
}

function isUniqueError(error: unknown, field: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    JSON.stringify(error.meta ?? {}).includes(field)
  );
}

export async function createClient(input: unknown): Promise<{ ok: true; clientId: string; email: string; password: string } | Errors> {
  await requireAdmin();
  const parsed = newClientSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    const { clientId, password } = await createClientAccount(parsed.data);
    refresh();
    return { ok: true, clientId, email: parsed.data.email.toLowerCase(), password };
  } catch (error) {
    if (isUniqueError(error, "slug")) return { ok: false, error: "Another client already uses this web address." };
    if (isUniqueError(error, "email")) return { ok: false, error: "There's already an account with this email." };
    console.error("Could not create the client", error);
    return { ok: false, error: "Creating the client failed. Please try again." };
  }
}

const updateSchema = z.object({
  name: z.string().trim().min(1, "Add the business name").max(80),
  slug: z.string().trim().min(2).max(60).regex(CLIENT_SLUG_PATTERN, "Web address: use lowercase letters, numbers and dashes"),
  plan: z.enum(["TRIAL", "STARTER", "PRO", "CUSTOM"]),
  trialEndsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick the trial end date"),
  paidUntil: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
  customServices: z.string().max(2000),
  notes: z.string().max(5000),
});

export async function updateClient(id: string, input: unknown): Promise<{ ok: true } | Errors> {
  await requireAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const data = parsed.data;
  const db = getDb();
  const before = await db.client.findUnique({ where: { id }, select: { slug: true } });
  if (!before) return { ok: false, error: "This client no longer exists." };
  try {
    await db.client.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        plan: data.plan as Plan,
        // End of the chosen day, so the trial lasts through it.
        trialEndsAt: new Date(`${data.trialEndsAt}T23:59:59Z`),
        paidUntil: data.paidUntil ? new Date(`${data.paidUntil}T00:00:00Z`) : null,
        customServices: data.customServices.split("\n").map((s) => s.trim()).filter(Boolean),
        notes: data.notes,
      },
    });
  } catch (error) {
    if (isUniqueError(error, "slug")) return { ok: false, error: "Another client already uses this web address." };
    throw error;
  }
  updateTag(siteTag(before.slug));
  updateTag(siteTag(data.slug));
  refresh();
  return { ok: true };
}

/** Opens the client's dashboard as the admin sees it, with a banner to come back. */
export async function viewAsClient(id: string) {
  await requireAdmin();
  (await cookies()).set(VIEW_AS_COOKIE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  redirect("/dashboard");
}

export async function stopViewingAsClient() {
  await requireAdmin();
  const store = await cookies();
  const id = store.get(VIEW_AS_COOKIE)?.value;
  store.delete(VIEW_AS_COOKIE);
  redirect(id ? `/admin/clients/${id}` : "/admin/clients");
}

export async function addLogin(clientId: string, name: string, email: string): Promise<{ ok: true; password: string } | Errors> {
  await requireAdmin();
  const parsed = z.object({ name: z.string().trim().min(1).max(120), email: z.email() }).safeParse({ name, email });
  if (!parsed.success) return { ok: false, error: "Enter a name and a valid email." };
  try {
    const password = await addClientLogin(clientId, parsed.data.name, parsed.data.email);
    refresh();
    return { ok: true, password };
  } catch (error) {
    if (isUniqueError(error, "email")) return { ok: false, error: "There's already an account with this email." };
    throw error;
  }
}

export async function resetPassword(userId: string): Promise<{ ok: true; password: string } | Errors> {
  await requireAdmin();
  const user = await getDb().user.findUnique({ where: { id: userId }, select: { role: true, clientId: true } });
  if (!user || user.role !== "USER" || !user.clientId) return { ok: false, error: "Only client logins can be reset here." };
  return { ok: true, password: await resetClientPassword(userId) };
}

export async function removeLogin(userId: string) {
  await requireAdmin();
  await getDb().user.deleteMany({ where: { id: userId, role: "USER" } });
  refresh();
}

const paymentSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "CUSTOM"]),
  months: z.number().int().min(1).max(36),
  amount: z.number().int().min(0).max(100_000),
});

/** Records cash (or any offline payment) the admin received, and extends the account. */
export async function recordPayment(clientId: string, input: unknown): Promise<{ ok: true } | Errors> {
  await requireAdmin();
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the plan, months and amount." };
  const payment = await getDb().payment.create({
    data: { clientId, method: "CASH", plan: parsed.data.plan as Plan, months: parsed.data.months, amount: parsed.data.amount },
  });
  await completePayment(payment.id);
  refresh();
  return { ok: true };
}

export async function confirmPayment(paymentId: string) {
  await requireAdmin();
  await completePayment(paymentId);
  refresh();
}

export async function cancelPayment(paymentId: string) {
  await requireAdmin();
  await getDb().payment.updateMany({ where: { id: paymentId, status: "PENDING" }, data: { status: "CANCELLED" } });
  refresh();
}

export async function deleteClient(id: string) {
  await requireAdmin();
  const db = getDb();
  const client = await db.client.findUnique({
    where: { id },
    include: { site: { include: { pages: { select: { translations: true } } } } },
  });
  if (!client) redirect("/admin/clients");

  // The site's images: logo, slideshow and pictures inside pages.
  const content = (client.site?.content ?? {}) as { logo?: { id?: string } | null; slideshow?: { id?: string }[] };
  const mediaIds = new Set<string>();
  if (content.logo?.id) mediaIds.add(content.logo.id);
  for (const image of content.slideshow ?? []) if (image.id) mediaIds.add(image.id);
  for (const page of client.site?.pages ?? []) {
    for (const match of JSON.stringify(page.translations).matchAll(/\/media\/([a-z0-9]+)/gi)) mediaIds.add(match[1]!);
  }

  await db.$transaction([
    db.user.deleteMany({ where: { clientId: id, role: "USER" } }),
    db.client.delete({ where: { id } }),
    db.media.deleteMany({ where: { id: { in: [...mediaIds] } } }),
  ]);
  updateTag(siteTag(client.slug));
  redirect("/admin/clients");
}
