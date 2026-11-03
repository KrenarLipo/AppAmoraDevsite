// Static data for services, templates and plans. Copy lives in the dictionaries;
// this file only holds ids, ordering and visual details.

export const serviceSlugs = ["ai-agents", "vibe-coding", "ai-seo"] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}

export type TemplateId = "web-agency" | "restaurant" | "beauty" | "professional" | "shop" | "fitness";

/** Colors for the mini template thumbnails. `bg` page, `hero` hero block, `fg` text bars, `accent` button. */
export const templates: {
  id: TemplateId;
  isDefault?: boolean;
  colors: { bg: string; hero: string; fg: string; accent: string };
}[] = [
  { id: "web-agency", isDefault: true, colors: { bg: "#0E1116", hero: "#1E232C", fg: "#F6F5F1", accent: "#FF6A4D" } },
  { id: "restaurant", colors: { bg: "#F3EADF", hero: "#7A2E1F", fg: "#FFF6EC", accent: "#E9B44C" } },
  { id: "beauty", colors: { bg: "#F7EEF0", hero: "#E8CFD5", fg: "#4A2B33", accent: "#4A2B33" } },
  { id: "professional", colors: { bg: "#EEF2F7", hero: "#1D3557", fg: "#FFFFFF", accent: "#7FB3E8" } },
  { id: "shop", colors: { bg: "#FFFFFF", hero: "#13A36B", fg: "#FFFFFF", accent: "#0E1116" } },
  { id: "fitness", colors: { bg: "#16181D", hero: "#D9F24A", fg: "#16181D", accent: "#16181D" } },
];

export const plans = {
  starter: { priceEur: 20, highlighted: false },
  pro: { priceEur: 85, highlighted: true },
  custom: { priceEur: null, highlighted: false },
} as const;
export type PlanId = keyof typeof plans;

export const contactInterests = ["AI_AGENTS", "VIBE_CODING", "AI_SEO", "WEBSITE_BUILDER", "OTHER"] as const;
export type ContactInterest = (typeof contactInterests)[number];
