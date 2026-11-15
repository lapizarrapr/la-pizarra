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
