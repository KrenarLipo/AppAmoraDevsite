import type { FontId } from "./templates";

// The same font stacks as fonts.ts, without loading next/font (usable in client components).
// The font files themselves are loaded by the dashboard and site root layouts.
export const fontFamilies: Record<FontId, string> = {
  inter: "var(--font-inter), system-ui, sans-serif",
  "dm-sans": "var(--font-site-dm-sans), system-ui, sans-serif",
  montserrat: "var(--font-site-montserrat), system-ui, sans-serif",
  poppins: "var(--font-site-poppins), system-ui, sans-serif",
  playfair: "var(--font-site-playfair), Georgia, serif",
  lora: "var(--font-site-lora), Georgia, serif",
};
