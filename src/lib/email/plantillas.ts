/**
 * Email texts. Every value that comes from a person (names, messages) is
 * escaped before it goes into HTML, and each email also has a plain-text
 * version.
 */
export const escaparHtml = (texto: string): string =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const marco = (contenido: string): string => `<!doctype html>
<html lang="es"><body style="margin:0;background:#f0eee6;font-family:Georgia,'Times New Roman',serif;color:#17201d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbfaf6;border-radius:6px;overflow:hidden">
<tr><td style="background:#1c3b33;color:#f4f2ea;padding:18px 24px;font-size:24px;font-weight:bold">La Pizarra</td></tr>
<tr><td style="padding:24px;font-size:17px;line-height:1.55">${contenido}</td></tr>
</table></td></tr></table></body></html>`

const boton = (url: string, texto: string): string =>
  `<p style="margin:24px 0"><a href="${escaparHtml(url)}" style="background:#1c3b33;color:#f4f2ea;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:15px;padding:12px 22px;border-radius:999px;display:inline-block">${escaparHtml(texto)}</a></p>
<p style="font-family:Arial,sans-serif;font-size:13px;color:#55615c">Si el botón no funciona, copia este enlace en tu navegador:<br>${escaparHtml(url)}</p>`

export type Correo = { subject: string; html: string; text: string }

export const correoConfirmarBoletin = (url: string): Correo => ({
  subject: 'Confirma tu suscripción al boletín de La Pizarra',
  text: `Recibimos una solicitud para suscribir este correo al boletín de La Pizarra.\n\nPara confirmar, abre este enlace:\n${url}\n\nSi no fuiste tú, ignora este mensaje y no recibirás nada más.`,
  html: marco(
    `<p>Recibimos una solicitud para suscribir este correo al boletín de La Pizarra.</p>${boton(url, 'Confirmar suscripción')}<p style="font-size:15px;color:#55615c">Si no fuiste tú, ignora este mensaje y no recibirás nada más.</p>`,
  ),
})

export const correoRestablecerContrasena = (url: string): Correo => ({
  subject: 'Restablece tu contraseña de La Pizarra',
  text: `Alguien pidió restablecer la contraseña de tu cuenta en el panel de La Pizarra.\n\nAbre este enlace para crear una nueva (vence en una hora):\n${url}\n\nSi no fuiste tú, ignora este mensaje: tu contraseña no cambia.`,
  html: marco(
    `<p>Alguien pidió restablecer la contraseña de tu cuenta en el panel de La Pizarra.</p>${boton(url, 'Crear contraseña nueva')}<p style="font-size:15px;color:#55615c">El enlace vence en una hora. Si no fuiste tú, ignora este mensaje: tu contraseña no cambia.</p>`,
  ),
})

type DatosDeMensaje = {
  tipo: 'contacto' | 'historia'
  asunto: string
  nombre?: string
  email?: string
  mensaje: string
  anonimo: boolean
  urlPanel: string
}

export const correoAvisoDeMensaje = (m: DatosDeMensaje): Correo => {
  const titulo = m.tipo === 'historia' ? 'Nueva historia o pista' : 'Nuevo mensaje de contacto'
  const remitente = m.anonimo
    ? 'Pidió anonimato'
    : [m.nombre, m.email].filter(Boolean).join(' · ') || 'No dejó datos'
  return {
    subject: `[La Pizarra] ${titulo}: ${m.asunto}`.replace(/[\r\n]+/g, ' ').slice(0, 180),
    text: `${titulo}\n\nAsunto: ${m.asunto}\nDe: ${remitente}\n\n${m.mensaje}\n\nVer en el panel: ${m.urlPanel}`,
    html: marco(
      `<p style="font-family:Arial,sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#1c5a4b;font-weight:bold;margin:0">${escaparHtml(titulo)}</p>
<h1 style="font-size:22px;margin:6px 0 4px">${escaparHtml(m.asunto)}</h1>
<p style="font-family:Arial,sans-serif;font-size:14px;color:#55615c;margin:0 0 16px">${escaparHtml(remitente)}</p>
<p style="white-space:pre-wrap">${escaparHtml(m.mensaje)}</p>${boton(m.urlPanel, 'Abrir en el panel')}`,
    ),
  }
}
