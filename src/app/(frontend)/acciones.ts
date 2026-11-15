'use server'

/**
 * Server actions behind the public forms. Order of checks is the same for
 * each: spam trap → rate limit → Turnstile → validation → store → email.
 */
import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { correoAvisoDeMensaje } from '@/lib/email/plantillas'
import { normalizarEmail, pareceRobot, validarMensaje, type Errores } from '@/lib/formularios'
import { es as t } from '@/lib/i18n/es'
import { proveedorDeBoletin } from '@/lib/newsletter'
import { dentroDelLimite, ipDe, verificarTurnstile } from '@/lib/proteccion'
import { SITIO } from '@/lib/rutas'

export type EstadoDeFormulario = {
  estado: 'inicial' | 'ok' | 'error'
  mensaje?: string
  errores?: Errores
  /** What the person typed, sent back on an error so the form is not wiped. */
  valores?: Partial<Record<(typeof CAMPOS_DEVUELTOS)[number], string>>
}

/**
 * Attempts allowed per form, per hour, from one internet connection. A whole
 * school usually shares a single connection, so this cannot be very low.
 */
const ENVIOS_POR_HORA = 20

const CAMPOS_DEVUELTOS = ['nombre', 'email', 'asunto', 'mensaje', 'anonimo'] as const

const conValores = (resultado: EstadoDeFormulario, formData: FormData): EstadoDeFormulario => {
  if (resultado.estado !== 'error') return resultado
  const valores: EstadoDeFormulario['valores'] = {}
  for (const campo of CAMPOS_DEVUELTOS) {
    const valor = formData.get(campo)
    if (typeof valor === 'string') valores[campo] = valor.slice(0, 6000)
  }
  return { ...resultado, valores }
}

const error = (mensaje: string, errores?: Errores): EstadoDeFormulario => ({
  estado: 'error',
  mensaje,
  errores,
})

const comprobar = async (
  accion: string,
  entrada: Record<string, unknown>,
  maximoPorHora: number,
): Promise<EstadoDeFormulario | null> => {
  const ip = ipDe(await headers())
  if (!(await dentroDelLimite(accion, ip, maximoPorHora))) return error(t.form.demasiados)
  if (!(await verificarTurnstile(entrada['cf-turnstile-response'], ip))) {
    return error(t.form.verificacion)
  }
  return null
}

export async function enviarMensaje(
  _previo: EstadoDeFormulario,
  formData: FormData,
): Promise<EstadoDeFormulario> {
  return conValores(await procesarMensaje(formData), formData)
}

export async function suscribirAlBoletin(
  _previo: EstadoDeFormulario,
  formData: FormData,
): Promise<EstadoDeFormulario> {
  return conValores(await procesarSuscripcion(formData), formData)
}

async function procesarMensaje(formData: FormData): Promise<EstadoDeFormulario> {
  const entrada = Object.fromEntries(formData) as Record<string, unknown>
  const exito: EstadoDeFormulario = { estado: 'ok', mensaje: t.form.mensajeRecibido }

  // Bots get the same "thank you" as people, so they learn nothing.
  if (pareceRobot(entrada)) return exito

  try {
    const bloqueo = await comprobar('mensaje', entrada, ENVIOS_POR_HORA)
    if (bloqueo) return bloqueo

    const validacion = validarMensaje(entrada)
    if (!validacion.ok) return error(t.form.revisa, validacion.errores)
    const datos = validacion.datos

    const payload = await getPayload({ config })
    const guardado = await payload.create({
      collection: 'mensajes',
      data: {
        tipo: datos.tipo,
        asunto: datos.asunto,
        nombre: datos.nombre || undefined,
        email: datos.email ?? undefined,
        mensaje: datos.mensaje,
        anonimo: datos.anonimo,
        estado: 'nuevo',
      },
    })

    // The message is already safe in the admin; a failed notification email
    // must not make the visitor think it was lost.
    if (process.env.EDITOR_EMAIL) {
      try {
        await payload.sendEmail({
          to: process.env.EDITOR_EMAIL,
          replyTo: datos.email ?? undefined,
          ...correoAvisoDeMensaje({
            ...datos,
            nombre: datos.nombre,
            email: datos.email ?? undefined,
            urlPanel: `${SITIO}/admin/collections/mensajes/${guardado.id}`,
          }),
        })
      } catch (fallo) {
        payload.logger.error({ err: fallo }, 'No se pudo enviar el aviso de mensaje nuevo')
      }
    }
    return exito
  } catch {
    return error(t.form.fallo)
  }
}

async function procesarSuscripcion(formData: FormData): Promise<EstadoDeFormulario> {
  const entrada = Object.fromEntries(formData) as Record<string, unknown>
  // Same answer whether the address is new, pending or already subscribed.
  const exito: EstadoDeFormulario = { estado: 'ok', mensaje: t.form.revisaTuCorreo }
  if (pareceRobot(entrada)) return exito

  try {
    const bloqueo = await comprobar('boletin', entrada, ENVIOS_POR_HORA)
    if (bloqueo) return bloqueo

    const email = normalizarEmail(entrada.email)
    if (!email) return error(t.form.revisa, { email: t.form.emailInvalido })

    await proveedorDeBoletin().suscribir(email)
    return exito
  } catch {
    return error(t.form.fallo)
  }
}

export async function confirmarSuscripcion(
  _previo: EstadoDeFormulario,
  formData: FormData,
): Promise<EstadoDeFormulario> {
  try {
    const resultado = await proveedorDeBoletin().confirmar(String(formData.get('token') ?? ''))
    return resultado === 'ok'
      ? { estado: 'ok', mensaje: t.boletin.confirmada }
      : error(t.boletin.enlaceInvalido)
  } catch {
    return error(t.form.fallo)
  }
}

export async function darDeBajaDelBoletin(
  _previo: EstadoDeFormulario,
  formData: FormData,
): Promise<EstadoDeFormulario> {
  try {
    const resultado = await proveedorDeBoletin().darDeBaja(
      String(formData.get('id') ?? ''),
      String(formData.get('firma') ?? ''),
    )
    return resultado === 'ok'
      ? { estado: 'ok', mensaje: t.boletin.bajaHecha }
      : error(t.boletin.enlaceInvalido)
  } catch {
    return error(t.form.fallo)
  }
}
