import { es, enUS } from 'date-fns/locale';
import type { Locale } from '@/i18n-config';

export const dateLocales: Record<Locale, globalThis.Locale> = {
  en: enUS,
  es: es,
};
