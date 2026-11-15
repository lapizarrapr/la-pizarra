/**
 * Public-site languages. Spanish is the only one today and is served without
 * a URL prefix (/seccion/opinion). To add English later: add 'en' here, add
 * an `en.ts` dictionary, and add the locale to Payload's `localization`.
 */
import { es, type Diccionario } from './es'

export const LOCALES = ['es'] as const
export type Locale = (typeof LOCALES)[number]
export const LOCALE_PREDETERMINADO: Locale = 'es'

const diccionarios: Record<Locale, Diccionario> = { es }

export const esLocale = (valor: string): valor is Locale =>
  (LOCALES as readonly string[]).includes(valor)

export const diccionario = (locale: string): Diccionario =>
  diccionarios[esLocale(locale) ? locale : LOCALE_PREDETERMINADO]

export type { Diccionario }
