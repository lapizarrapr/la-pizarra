/**
 * Date helpers. Every date shown to readers goes through this file so the
 * whole site uses the Puerto Rico locale and time zone, wherever it is hosted.
 */
export const LOCALE = 'es-PR'
export const ZONA_HORARIA = 'America/Puerto_Rico'

type EntradaFecha = Date | string | number

const aFecha = (valor: EntradaFecha): Date => {
  const fecha = valor instanceof Date ? valor : new Date(valor)
  if (Number.isNaN(fecha.getTime())) {
    throw new RangeError(`Fecha inválida: ${String(valor)}`)
  }
  return fecha
}

const formatoFecha = new Intl.DateTimeFormat(LOCALE, {
  timeZone: ZONA_HORARIA,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const formatoHora = new Intl.DateTimeFormat(LOCALE, {
  timeZone: ZONA_HORARIA,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const formatoPartes = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** "14 de noviembre de 2026" */
export const formatearFecha = (valor: EntradaFecha): string => formatoFecha.format(aFecha(valor))

/** "14 de noviembre de 2026, 3:05 p. m." */
export const formatearFechaHora = (valor: EntradaFecha): string => {
  const fecha = aFecha(valor)
  return `${formatoFecha.format(fecha)}, ${formatoHora.format(fecha)}`
}

/** Calendar day in Puerto Rico as "2026-11-14" (for archives and view counts). */
export const diaEnPuertoRico = (valor: EntradaFecha): string => formatoPartes.format(aFecha(valor))

/** Full ISO timestamp for `<time dateTime>` and structured data. */
export const aISO = (valor: EntradaFecha): string => aFecha(valor).toISOString()

/**
 * First instant of a Puerto Rico calendar month and of the next one, as UTC
 * ISO strings. Puerto Rico is UTC-4 all year (no daylight saving time).
 */
export const limitesDelMes = (anio: number, mes: number): { inicio: string; fin: string } => ({
  inicio: new Date(Date.UTC(anio, mes - 1, 1, 4)).toISOString(),
  fin: new Date(Date.UTC(anio, mes, 1, 4)).toISOString(),
})

const formatoMes = new Intl.DateTimeFormat(LOCALE, {
  timeZone: 'UTC',
  month: 'long',
  year: 'numeric',
})

/** (2026, 11) → 'noviembre de 2026' */
export const nombreDelMes = (anio: number, mes: number): string =>
  formatoMes.format(new Date(Date.UTC(anio, mes - 1, 15)))
