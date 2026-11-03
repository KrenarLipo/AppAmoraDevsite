import type { Locale } from "./config";

/** Prefix an app path with the locale: localePath("it", "/pricing") → "/it/pricing". */
export function localePath(locale: Locale, path = "/"): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Fill `{name}` placeholders: format("{minutes} min read", { minutes: 4 }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
