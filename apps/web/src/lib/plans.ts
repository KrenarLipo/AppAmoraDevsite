import type { Plan } from "@appamora/db";

// What each plan includes. The free trial and a locked (unpaid) account use the TRIAL limits;
// a locked account can additionally only change its business name and logo.

export type PlanLimits = {
  /** How many templates can be used: the first N in templateOrder. */
  templates: number;
  pages: number;
  languages: number;
  /** Colors and fonts. */
  design: boolean;
  slideshow: boolean;
  subscribers: boolean;
  whatsapp: boolean;
  /** "Made with AppAmora" badge on the site. */
  badge: boolean;
  logins: number;
};

export const planLimits: Record<Plan, PlanLimits> = {
  TRIAL: { templates: 3, pages: 3, languages: 1, design: false, slideshow: false, subscribers: false, whatsapp: false, badge: true, logins: 1 },
  STARTER: { templates: 6, pages: 6, languages: 2, design: true, slideshow: true, subscribers: true, whatsapp: true, badge: true, logins: 1 },
  PRO: { templates: 6, pages: 50, languages: 5, design: true, slideshow: true, subscribers: true, whatsapp: true, badge: false, logins: 3 },
  CUSTOM: { templates: 6, pages: 50, languages: 5, design: true, slideshow: true, subscribers: true, whatsapp: true, badge: false, logins: 3 },
};

export const planNames: Record<Plan, string> = { TRIAL: "Free trial", STARTER: "Starter", PRO: "Pro", CUSTOM: "Custom" };

/** Plans a client can pay for online. Custom is arranged with the admin. */
export const payablePlans = ["STARTER", "PRO"] as const;
export type PayablePlan = (typeof payablePlans)[number];
export const paymentPeriods = [1, 3, 12] as const;

export type AccountState =
  | { kind: "paid"; until: Date }
  | { kind: "trial"; endsAt: Date; daysLeft: number }
  | { kind: "locked" };

type ClientDates = { plan: Plan; trialEndsAt: Date; paidUntil: Date | null };

const DAY = 86_400_000;

function startOfDayUTC(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function accountState(client: ClientDates, now: Date): AccountState {
  if (client.paidUntil && client.paidUntil.getTime() >= startOfDayUTC(now)) return { kind: "paid", until: client.paidUntil };
  if (client.trialEndsAt.getTime() > now.getTime()) {
    return { kind: "trial", endsAt: client.trialEndsAt, daysLeft: Math.ceil((client.trialEndsAt.getTime() - now.getTime()) / DAY) };
  }
  return { kind: "locked" };
}

export function effectiveLimits(client: ClientDates, state: AccountState): PlanLimits {
  if (state.kind !== "paid") return planLimits.TRIAL;
  return planLimits[client.plan === "TRIAL" ? "STARTER" : client.plan];
}

/** The new paid-until date after paying `months` months: extends from today or from the current end, whichever is later. */
export function extendPaidUntil(current: Date | null, months: number, now: Date): Date {
  const today = new Date(startOfDayUTC(now));
  const base = current && current.getTime() >= today.getTime() ? current : today;
  const next = new Date(base);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

export function formatDay(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

/** A short status for badges: "Paid until 5 Dec 2026", "Free trial · 9 days left", "Not paid". */
export function describeState(state: AccountState): { label: string; tone: "paid" | "trial" | "unpaid" } {
  if (state.kind === "paid") return { label: `Paid until ${formatDay(state.until)}`, tone: "paid" };
  if (state.kind === "trial") return { label: `Free trial · ${state.daysLeft} ${state.daysLeft === 1 ? "day" : "days"} left`, tone: "trial" };
  return { label: "Not paid", tone: "unpaid" };
}

export const toneClasses: Record<"paid" | "trial" | "unpaid", string> = {
  paid: "bg-[#E3F4EC] text-[#0F7A50]",
  trial: "bg-[#FFF3D6] text-[#8A5A00]",
  unpaid: "bg-[#FBE4DF] text-amora-dark",
};
