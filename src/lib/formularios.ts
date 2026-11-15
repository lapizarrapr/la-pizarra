/**
 * Validation for the public forms. Pure functions: the server actions call
 * them, and the unit tests cover them. Everything is stored as plain text.
 */
export const LIMITES = { nombre: 80, email: 160, asunto: 140, mensaje: 5000 } as const

// Deliberately simple: one @, something on each side, a dot in the domain.
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/

/** Trims, removes control characters and collapses a single-line value. */
export const unaLinea = (valor: unknown, maximo: number): string =>
  (typeof valor === 'string' ? valor : '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximo)

/** Keeps line breaks, removes other control characters. */
export const variasLineas = (valor: unknown, maximo: number): string =>
  (typeof valor === 'string' ? valor : '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
    .slice(0, maximo)

export const normalizarEmail = (valor: unknown): string | null => {
  const email = unaLinea(valor, LIMITES.email + 1).toLowerCase()
  return email.length <= LIMITES.email && EMAIL.test(email) ? email : null
}

export type TipoDeMensaje = 'contacto' | 'historia'

export type MensajeValido = {
  tipo: TipoDeMensaje
  asunto: string
  nombre: string
  email: string | null
  mensaje: string
  anonimo: boolean
}

export type Errores = Partial<Record<'asunto' | 'email' | 'mensaje' | 'general', string>>

type Entrada = Record<string, unknown>

export const validarMensaje = (
  entrada: Entrada,
): { ok: true; datos: MensajeValido } | { ok: false; errores: Errores } => {
  const tipo: TipoDeMensaje = entrada.tipo === 'historia' ? 'historia' : 'contacto'
  const anonimo = tipo === 'historia' && Boolean(entrada.anonimo)
  const asunto = unaLinea(entrada.asunto, LIMITES.asunto)
  const mensaje = variasLineas(entrada.mensaje, LIMITES.mensaje)
  const emailCrudo = unaLinea(entrada.email, LIMITES.email + 1)
  const email = anonimo ? null : normalizarEmail(emailCrudo)

  const errores: Errores = {}
  if (asunto.length < 3) errores.asunto = 'Escribe un asunto.'
  if (mensaje.length < 10) errores.mensaje = 'Cuéntanos un poco más (al menos 10 caracteres).'
  if (!anonimo) {
    if (tipo === 'contacto' && !emailCrudo) {
      errores.email = 'Escribe tu correo para poder contestarte.'
    } else if (emailCrudo && !email) {
      errores.email = 'Revisa el correo electrónico: no parece válido.'
    }
  }
  if (Object.keys(errores).length) return { ok: false, errores }

  return {
    ok: true,
    datos: {
      tipo,
      asunto,
      mensaje,
      anonimo,
      // An anonymous tip stores no name or email, even if they were typed.
      nombre: anonimo ? '' : unaLinea(entrada.nombre, LIMITES.nombre),
      email,
    },
  }
}

/**
 * Spam trap. Real people never see the "sitio_web" field and take more than
 * a couple of seconds to fill in a form; simple bots fail one or both.
 */
export const pareceRobot = (entrada: Entrada, ahora = Date.now()): boolean => {
  if (typeof entrada.sitio_web === 'string' && entrada.sitio_web.trim() !== '') return true
  // The page's script stamps the time it loaded. A browser without scripts
  // sends nothing here, which is not evidence of a robot.
  if (entrada.inicio === undefined || entrada.inicio === '') return false
  const inicio = Number(entrada.inicio)
  if (!Number.isFinite(inicio) || inicio <= 0) return true
  return ahora - inicio < 2500
}

/** One CSV cell. Neutralises spreadsheet formulas (=, +, -, @) as well as quotes. */
export const celdaCsv = (valor: unknown): string => {
  let texto = valor === null || valor === undefined ? '' : String(valor)
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  return /[",\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

export const aCsv = (filas: unknown[][]): string =>
  // BOM so Excel opens accents correctly.
  `﻿${filas.map((fila) => fila.map(celdaCsv).join(',')).join('\r\n')}\r\n`
