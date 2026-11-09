"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState, useTransition } from "react";
import { paymentPeriods, type PayablePlan } from "@/lib/plans";
import { cancelPayPalOrder, capturePayPalOrder, createPayPalOrder, requestCashPayment } from "./actions";

type PayPalButtons = { render: (el: HTMLElement) => Promise<void>; close: () => Promise<void> };
type PayPalNamespace = {
  Buttons: (options: {
    style?: Record<string, string | number>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onCancel?: (data: { orderID: string }) => void;
    onError?: (error: unknown) => void;
  }) => PayPalButtons;
};
declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

type Props = {
  prices: Record<PayablePlan, number>;
  features: Record<PayablePlan, string[]>;
  defaultPlan: PayablePlan;
  paypalClientId: string | null;
  cashAllowed: boolean;
  paidUntil: string | null;
};

export function CheckoutPanel({ prices, features, defaultPlan, paypalClientId, cashAllowed, paidUntil }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<PayablePlan>(defaultPlan);
  const [months, setMonths] = useState<(typeof paymentPeriods)[number]>(1);
  const [method, setMethod] = useState<"paypal" | "cash">(paypalClientId ? "paypal" : "cash");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [pending, startTransition] = useTransition();
  const buttonsRef = useRef<HTMLDivElement>(null);
  const total = prices[plan] * months;

  // Re-draw the PayPal buttons whenever the plan or period changes, so the order matches what's shown.
  useEffect(() => {
    if (method !== "paypal" || !sdkReady || !window.paypal || !buttonsRef.current) return;
    const container = buttonsRef.current;
    container.innerHTML = "";
    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", shape: "rect", label: "pay", height: 48 },
      createOrder: async () => {
        setMessage(null);
        const result = await createPayPalOrder({ plan, months });
        if (!result.ok) {
          setMessage({ ok: false, text: result.error });
          throw new Error(result.error);
        }
        return result.orderId;
      },
      onApprove: async ({ orderID }) => {
        const result = await capturePayPalOrder(orderID);
        if (result.ok) {
          setMessage({ ok: true, text: "Payment received. Thank you! Your plan is active." });
          router.refresh();
        } else setMessage({ ok: false, text: result.error });
      },
      onCancel: ({ orderID }) => {
        void cancelPayPalOrder(orderID);
        setMessage({ ok: false, text: "Payment cancelled. Nothing was charged." });
      },
      onError: () => setMessage((m) => m ?? { ok: false, text: "PayPal had a problem. Please try again." }),
    });
    void buttons.render(container);
    return () => {
      void buttons.close().catch(() => {});
    };
  }, [method, sdkReady, plan, months, router]);

  function requestCash() {
    startTransition(async () => {
      const result = await requestCashPayment({ plan, months });
      setMessage(result.ok ? { ok: true, text: "Request sent. We'll contact you to collect the payment." } : { ok: false, text: result.error });
      if (result.ok) router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5">
      {paypalClientId && (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalClientId)}&currency=EUR&intent=capture&components=buttons&enable-funding=card`}
          onReady={() => setSdkReady(true)}
        />
      )}
      <h2 className="font-display text-xl font-bold">{paidUntil ? `Extend or change your plan (paid until ${paidUntil})` : "Choose your plan"}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {(["STARTER", "PRO"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlan(p)}
            aria-pressed={plan === p}
            className={`flex flex-col gap-3 rounded-2xl border-2 p-5 text-left transition-colors ${plan === p ? "border-amora bg-cream" : "border-line hover:border-ink"}`}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="font-display text-xl font-bold">{p === "PRO" ? "Pro" : "Starter"}</span>
              <span>
                <span className="font-display text-2xl font-bold">€{prices[p]}</span>
                <span className="text-sm text-muted">/month</span>
              </span>
            </span>
            <ul className="flex flex-col gap-1.5 text-sm">
              {features[p].map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-amora">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Pay for</span>
        <div className="flex gap-1 rounded-xl bg-sand p-1">
          {paymentPeriods.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={months === m}
              onClick={() => setMonths(m)}
              className={`h-10 flex-1 rounded-lg text-sm font-semibold ${months === m ? "bg-white shadow-sm" : "text-muted"}`}
            >
              {m} {m === 1 ? "month" : "months"}
            </button>
          ))}
        </div>
      </div>

      <p className="flex items-baseline justify-between rounded-xl bg-cream px-4 py-3">
        <span className="font-medium">Total</span>
        <span className="font-display text-2xl font-bold">€{total}</span>
      </p>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Payment method</span>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 ${method === "paypal" ? "border-amora" : "border-line"} ${!paypalClientId ? "opacity-50" : "cursor-pointer"}`}>
            <input type="radio" name="method" checked={method === "paypal"} disabled={!paypalClientId} onChange={() => setMethod("paypal")} className="size-4 accent-amora" />
            <span className="flex flex-col">
              <span className="font-semibold">PayPal or card</span>
              <span className="text-xs text-muted">{paypalClientId ? "Instant activation" : "Available soon"}</span>
            </span>
          </label>
          <label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 ${method === "cash" ? "border-amora" : "border-line"}`}>
            <input type="radio" name="method" checked={method === "cash"} onChange={() => setMethod("cash")} className="size-4 accent-amora" />
            <span className="flex flex-col">
              <span className="font-semibold">Cash on delivery</span>
              <span className="text-xs text-muted">We contact you to collect it</span>
            </span>
          </label>
        </div>
      </div>

      {method === "paypal" ? (
        <div ref={buttonsRef} className="min-h-12">
          {!sdkReady && <p className="text-sm text-muted">Loading PayPal…</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={requestCash}
          disabled={pending || !cashAllowed}
          className="h-12 rounded-[10px] bg-ink px-6 font-semibold text-paper hover:bg-panel disabled:opacity-50"
        >
          {cashAllowed ? `Request cash payment of €${total}` : "Cash payment already requested"}
        </button>
      )}

      {message && (
        <p role={message.ok ? "status" : "alert"} className={`font-medium ${message.ok ? "text-[#0F7A50]" : "text-amora-dark"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
