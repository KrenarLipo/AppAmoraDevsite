// PayPal Checkout (Orders API v2). Clients pay with their PayPal account or a card;
// the amount is always computed on our server, and the payment only counts once
// our server has captured it and checked the amount.
//
// Env: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, NEXT_PUBLIC_PAYPAL_CLIENT_ID (same as the
// client id) and PAYPAL_ENV = "sandbox" (test money, default) or "live".

const apiBase = () => (process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");

export const paypalEnabled = () => Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

async function accessToken(): Promise<string> {
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`PayPal login failed (${response.status})`);
  return ((await response.json()) as { access_token: string }).access_token;
}

async function call<T>(path: string, body?: unknown, requestId?: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
      // Makes retries safe: PayPal won't create or capture twice.
      ...(requestId && { "PayPal-Request-Id": requestId }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) throw new Error(`PayPal ${path} failed (${response.status}): ${data.message ?? ""}`);
  return data;
}

export async function createOrder(input: { paymentId: string; amount: number; description: string }): Promise<string> {
  const order = await call<{ id: string }>(
    "/v2/checkout/orders",
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.paymentId,
          description: input.description.slice(0, 127),
          amount: { currency_code: "EUR", value: input.amount.toFixed(2) },
        },
      ],
      payment_source: { paypal: { experience_context: { brand_name: "AppAmora", shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW" } } },
    },
    `create-${input.paymentId}`,
  );
  return order.id;
}

type Capture = {
  status: string;
  purchase_units?: { custom_id?: string; payments?: { captures?: { status: string; custom_id?: string; amount: { currency_code: string; value: string } }[] } }[];
};

/** Captures an approved order. Returns what was actually paid, for checking against our record. */
export async function captureOrder(orderId: string): Promise<{ completed: boolean; paymentId?: string; amount?: number; currency?: string }> {
  const result = await call<Capture>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, undefined, `capture-${orderId}`);
  const capture = result.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    completed: result.status === "COMPLETED" && capture?.status === "COMPLETED",
    paymentId: capture?.custom_id ?? result.purchase_units?.[0]?.custom_id,
    amount: capture ? Number(capture.amount.value) : undefined,
    currency: capture?.amount.currency_code,
  };
}
