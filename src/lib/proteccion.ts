/**
 * Abuse protection for the public forms: a rate limit stored in Postgres
 * (memory does not survive between requests on serverless hosting) and the
 * Cloudflare Turnstile check.
 */
import { createHmac } from 'crypto'

import { db } from './db'

const secreto = () => process.env.PAYLOAD_SECRET || 'solo-desarrollo'

/**
 * The limiter never stores an IP address: only a keyed hash that cannot be
 * turned back into one, and that is useless outside this site.
 */
export const huella = (accion: string, ip: string): string =>
  createHmac('sha256', secreto()).update(`${accion}|${ip}`).digest('hex').slice(0, 40)

export const ipDe = (cabeceras: Headers): string =>
  cabeceras.get('x-real-ip')?.trim() ||
  cabeceras.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  'desconocida'

/**
 * Counts one attempt and says whether it is still within the limit for the
 * current hour. Old rows are cleaned up as a side effect.
 */
export const dentroDelLimite = async (
  accion: string,
  ip: string,
  maximoPorHora: number,
): Promise<boolean> => {
  const pool = await db()
  const ventana = new Date().toISOString().slice(0, 13) // "2026-11-14T21"
  const { rows } = await pool.query<{ conteo: number }>(
    `INSERT INTO limites (clave, ventana, conteo, updated_at, created_at)
     VALUES ($1, $2, 1, now(), now())
     ON CONFLICT (clave, ventana) DO UPDATE SET conteo = limites.conteo + 1, updated_at = now()
     RETURNING conteo`,
    [huella(accion, ip), ventana],
  )
  if (Math.random() < 0.05) {
    await pool.query(`DELETE FROM limites WHERE created_at < now() - interval '2 days'`)
  }
  return (rows[0]?.conteo ?? 1) <= maximoPorHora
}

export const turnstileActivo = (): boolean =>
  Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

/**
 * Verifies the Turnstile token with Cloudflare. When no keys are configured
 * (local development) the check is skipped; the honeypot and the rate limit
 * still apply.
 */
export const verificarTurnstile = async (token: unknown, ip: string): Promise<boolean> => {
  if (!turnstileActivo()) return true
  if (typeof token !== 'string' || !token || token.length > 2048) return false
  try {
    const cuerpo = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: token,
    })
    if (ip !== 'desconocida') cuerpo.set('remoteip', ip)
    const respuesta = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: cuerpo,
      signal: AbortSignal.timeout(8000),
    })
    return ((await respuesta.json()) as { success?: boolean }).success === true
  } catch {
    // Cloudflare unreachable: fail closed, the visitor can simply try again.
    return false
  }
}
