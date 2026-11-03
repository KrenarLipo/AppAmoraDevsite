// Languages enabled on appamora.com. The platform supports EN, IT, SQ, DE and FR;
// add "de" or "fr" here once a dictionary for it exists in ./dictionaries.
export const locales = ["en", "it", "sq"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
  sq: "Shqip",
};

// Open Graph locale codes.
export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  it: "it_IT",
  sq: "sq_AL",
};

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
