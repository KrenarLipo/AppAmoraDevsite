import { getDb, type Plan } from "@appamora/db";
import { updateTag } from "next/cache";
import { extendPaidUntil } from "./plans";
import { siteTag } from "./sites/public";

/**
 * Marks a pending payment as received: the client's plan becomes the paid plan and
 * "paid until" moves forward by the paid months. Safe to call twice (the second call does nothing).
 */
export async function completePayment(paymentId: string): Promise<{ ok: boolean; paidUntil?: Date }> {
  const db = getDb();
  const result = await db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId }, include: { client: true } });
    if (!payment || payment.status !== "PENDING") return null;
    const now = new Date();
    const paidUntil = extendPaidUntil(payment.client.paidUntil, payment.months, now);
    // Only the first caller flips PENDING → COMPLETED, so a double submit can't extend twice.
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "COMPLETED", completedAt: now, periodEnd: paidUntil },
    });
    if (claimed.count === 0) return null;
    await tx.client.update({ where: { id: payment.clientId }, data: { plan: payment.plan as Plan, paidUntil } });
    return { slug: payment.client.slug, paidUntil };
  });
  if (!result) return { ok: false };
  updateTag(siteTag(result.slug));
  return { ok: true, paidUntil: result.paidUntil };
}
