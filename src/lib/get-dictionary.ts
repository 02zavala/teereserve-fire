
// We can't use server-only here as this is imported by client components too.
// The data is static, so this is safe.
import type { Locale } from '../i18n-config'

// We enumerate all dictionaries here for better linting and typescript support
// We do not want to import '@' here since it is relative to the file where it is imported from
const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
