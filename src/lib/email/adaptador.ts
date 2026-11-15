/**
 * Chooses how email is sent, from environment variables only:
 *
 *   RESEND_API_KEY set → Resend
 *   SMTP_HOST set      → any SMTP server
 *   neither            → nothing is delivered; emails are written to the
 *                        server console instead (see adaptadorDeConsola)
 */
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { resendAdapter } from '@payloadcms/email-resend'
import type { Config, EmailAdapter } from 'payload'

export const adaptadorDeEmail = (): Config['email'] => {
  const remitente = {
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'redaccion@example.com',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'La Pizarra',
  }

  if (process.env.RESEND_API_KEY) {
    return resendAdapter({ ...remitente, apiKey: process.env.RESEND_API_KEY })
  }

  if (process.env.SMTP_HOST) {
    const puerto = Number(process.env.SMTP_PORT || 587)
    return nodemailerAdapter({
      ...remitente,
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: puerto,
        secure: puerto === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      },
    })
  }

  return adaptadorDeConsola(remitente)
}

/**
 * Stand-in used when no provider is configured. Nothing is delivered.
 * In development the full text is printed so links (confirm subscription,
 * reset password) can be copied from the terminal. In production only the
 * recipient and subject are logged, because the text contains one-time links.
 */
const adaptadorDeConsola =
  (remitente: { defaultFromAddress: string; defaultFromName: string }): EmailAdapter =>
  ({ payload }) => ({
    ...remitente,
    name: 'consola',
    sendEmail: async (mensaje) => {
      const cabecera = `Correo NO enviado (no hay proveedor configurado). Para: ${String(mensaje.to)} · Asunto: ${String(mensaje.subject)}`
      if (process.env.NODE_ENV === 'production') {
        payload.logger.warn(cabecera)
      } else {
        payload.logger.info(`${cabecera}\n${String(mensaje.text ?? '(sin versión de texto)')}`)
      }
    },
  })
