"use server";

import { getDb } from "@appamora/db";
import { headers } from "next/headers";
import { z } from "zod";
import { recordActivity } from "@/lib/activity";
import { getAuth } from "@/lib/auth";
import { requireClient } from "@/lib/client";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(12, "The new password needs at least 12 characters").max(128),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { message: "The two new passwords don't match", path: ["confirm"] })
  .refine((v) => v.newPassword !== v.currentPassword, { message: "Choose a password different from the current one", path: ["newPassword"] });

export async function changePassword(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireClient();
  if (ctx.viewingAsAdmin) return { ok: false, error: "As admin, reset the client's password from Admin → Clients instead." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const requestHeaders = await headers();
  const auth = getAuth();
  try {
    // Better Auth's own revokeOtherSessions replaces this browser's session too, which would log
    // the client out here; instead keep the current session and end the others ourselves.
    await auth.api.changePassword({
      body: { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword, revokeOtherSessions: false },
      headers: requestHeaders,
    });
  } catch (error) {
    // Better Auth throws an APIError with a code; checked by shape, since the class can come from another bundle.
    const code = (error as { body?: { code?: string } })?.body?.code;
    if (code === "INVALID_PASSWORD") return { ok: false, error: "The current password is wrong." };
    if (code === "PASSWORD_TOO_SHORT" || code === "PASSWORD_TOO_LONG") return { ok: false, error: "The new password needs at least 12 characters." };
    console.error("Password change failed", error);
    return { ok: false, error: "Changing the password failed. Please try again." };
  }
  const current = await auth.api.getSession({ headers: requestHeaders });
  if (current) {
    await getDb().session.deleteMany({ where: { userId: current.user.id, NOT: { id: current.session.id } } });
  }
  await recordActivity(ctx, "account", "Changed their password");
  return { ok: true };
}
