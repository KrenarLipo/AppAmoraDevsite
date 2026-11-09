"use server";

import { getDb, type Plan } from "@appamora/db";
import { refresh } from "next/cache";
import { z } from "zod";
import { requireClient } from "@/lib/client";
import { completePayment } from "@/lib/payments";
import { captureOrder, createOrder, paypalEnabled } from "@/lib/paypal";
import { payablePlans, paymentPeriods, planNames } from "@/lib/plans";
import { readSiteInfoForEdit } from "@/lib/settings/admin";

const choiceSchema = z.object({
  plan: z.enum(payablePlans),
  months: z.union(paymentPeriods.map((m) => z.literal(m)) as [z.ZodLiteral<1>, z.ZodLiteral<3>, z.ZodLiteral<12>]),
});

/** The price is always taken from the site settings, never from the browser. */
async function priceFor(plan: "STARTER" | "PRO", months: number): Promise<number> {
  const info = await readSiteInfoForEdit();
  return (plan === "PRO" ? info.pricing.pro : info.pricing.starter) * months;
}

export async function createPayPalOrder(input: unknown): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const ctx = await requireClient();
  if (!paypalEnabled()) return { ok: false, error: "Online payment isn't available yet. Choose cash payment." };
  const parsed = choiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose a plan and a period." };
  const { plan, months } = parsed.data;
  const amount = await priceFor(plan, months);

  const db = getDb();
  const payment = await db.payment.create({
    data: { clientId: ctx.client.id, method: "PAYPAL", plan: plan as Plan, months, amount },
  });
  try {
    const orderId = await createOrder({
      paymentId: payment.id,
      amount,
      description: `AppAmora ${planNames[plan]} · ${months} ${months === 1 ? "month" : "months"} · ${ctx.client.name}`,
    });
    await db.payment.update({ where: { id: payment.id }, data: { paypalOrderId: orderId } });
    return { ok: true, orderId };
  } catch (error) {
    console.error("PayPal order failed", error);
    await db.payment.update({ where: { id: payment.id }, data: { status: "CANCELLED" } });
    return { ok: false, error: "PayPal is not responding. Please try again in a moment." };
  }
}

export async function capturePayPalOrder(orderId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireClient();
  const db = getDb();
  const payment = await db.payment.findUnique({ where: { paypalOrderId: orderId } });
  if (!payment || payment.clientId !== ctx.client.id) return { ok: false, error: "Payment not found." };
  if (payment.status === "COMPLETED") return { ok: true };

  try {
    const capture = await captureOrder(orderId);
    // Only count it when PayPal confirms the full amount, in euros, for this exact payment.
    if (!capture.completed || capture.paymentId !== payment.id || capture.currency !== "EUR" || capture.amount !== payment.amount) {
      console.error("PayPal capture did not match", { orderId, capture, expected: payment.amount });
      return { ok: false, error: "The payment wasn't completed. You haven't been charged twice; please contact us." };
    }
  } catch (error) {
    console.error("PayPal capture failed", error);
    return { ok: false, error: "The payment couldn't be completed. Please try again or choose cash payment." };
  }
  await completePayment(payment.id);
  refresh();
  return { ok: true };
}

/** Cancels the pending record when the client closes the PayPal window. */
export async function cancelPayPalOrder(orderId: string) {
  const ctx = await requireClient();
  await getDb().payment.updateMany({
    where: { paypalOrderId: orderId, clientId: ctx.client.id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
}

export async function requestCashPayment(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireClient();
  const parsed = choiceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose a plan and a period." };
  const db = getDb();
  const open = await db.payment.count({ where: { clientId: ctx.client.id, method: "CASH", status: "PENDING" } });
  if (open > 0) return { ok: false, error: "You already have a cash payment waiting. We'll contact you to collect it." };
  const amount = await priceFor(parsed.data.plan, parsed.data.months);
  await db.payment.create({
    data: { clientId: ctx.client.id, method: "CASH", plan: parsed.data.plan as Plan, months: parsed.data.months, amount },
  });
  refresh();
  return { ok: true };
}
