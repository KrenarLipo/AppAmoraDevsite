// Languages a client's website can use (more than appamora.com itself).
export const siteLanguages = ["en", "it", "sq", "de", "fr"] as const;
export type SiteLanguage = (typeof siteLanguages)[number];

export const siteLanguageNames: Record<SiteLanguage, string> = {
  en: "English",
  it: "Italiano",
  sq: "Shqip",
  de: "Deutsch",
  fr: "Français",
};

export function isSiteLanguage(value: string): value is SiteLanguage {
  return (siteLanguages as readonly string[]).includes(value);
}
