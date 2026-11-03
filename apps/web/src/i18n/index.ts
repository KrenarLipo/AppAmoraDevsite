import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import { hasLocale, type Locale } from "./config";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  it: () => import("./dictionaries/it").then((m) => m.default),
  sq: () => import("./dictionaries/sq").then((m) => m.default),
};

/** The current locale from the `[locale]` root segment. 404s on unknown values. */
export async function getLocale(): Promise<Locale> {
  // Undefined under the /admin root layout, which has no locale segment.
  const value = await localeParam();
  if (!value || !hasLocale(value)) notFound();
  return value;
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  return dictionaries[locale ?? (await getLocale())]();
}

export type { Dictionary };
