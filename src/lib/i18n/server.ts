import { DEFAULT_LOCALE, type SupportedLocale } from "@/lib/constants";
import { getTranslations } from "@/lib/i18n";

export function getLocaleFromHeaders(
  acceptLanguage?: string | null,
): SupportedLocale {
  if (acceptLanguage?.includes("am")) return "am";
  return DEFAULT_LOCALE;
}

export function createI18n(locale?: SupportedLocale) {
  const resolved = locale ?? DEFAULT_LOCALE;
  return {
    locale: resolved,
    t: getTranslations(resolved),
  };
}
