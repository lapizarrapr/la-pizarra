/**
 * Blocks available inside the article body (rich text editor).
 * Embeds are rendered click-to-load on the public site, so no third-party
 * script or tracker loads until the reader chooses to see it.
 */
import type { Block } from 'payload'

const esHttps = (valor: unknown): URL | null => {
  if (typeof valor !== 'string') return null
  try {
    const url = new URL(valor.trim())
    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

/** Extracts the 11-character video id from the usual YouTube URL shapes. */
export const idDeYouTube = (valor: unknown): string | null => {
  const url = esHttps(valor)
  if (!url) return null
  const host = url.hostname.replace(/^www\.|^m\./, '')
  let id: string | null = null
  if (host === 'youtu.be') id = url.pathname.slice(1)
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v')
    else {
      const partes = url.pathname.split('/').filter(Boolean)
      if (['embed', 'shorts', 'live'].includes(partes[0] ?? '')) id = partes[1] ?? null
    }
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null
}

export const REDES_PERMITIDAS = [
  'x.com',
  'twitter.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'threads.net',
  'threads.com',
  'bsky.app',
] as const

export const esEnlaceDeRedSocial = (valor: unknown): boolean => {
  const url = esHttps(valor)
  if (!url) return false
  const host = url.hostname.replace(/^www\.|^m\.|^mobile\./, '')
  return (REDES_PERMITIDAS as readonly string[]).includes(host)
}

export const CitaDestacada: Block = {
  slug: 'citaDestacada',
  labels: { singular: 'Cita destacada', plural: 'Citas destacadas' },
  fields: [
    { name: 'cita', type: 'textarea', label: 'Cita', required: true },
    {
      name: 'atribucion',
      type: 'text',
      label: 'Quién lo dijo',
      admin: { description: 'Ejemplo: Carmen Ortiz, maestra de español' },
    },
  ],
}

export const VideoYouTube: Block = {
  slug: 'youtube',
  labels: { singular: 'Video de YouTube', plural: 'Videos de YouTube' },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'Enlace del video',
      required: true,
      admin: {
        description: 'Pega el enlace completo, por ejemplo https://www.youtube.com/watch?v=…',
      },
      validate: (valor: unknown) =>
        idDeYouTube(valor) ? true : 'Pega un enlace válido de YouTube (debe empezar con https://).',
    },
    {
      name: 'titulo',
      type: 'text',
      label: 'Título o descripción del video',
      required: true,
      admin: { description: 'Lo leen los lectores de pantalla. Describe de qué trata el video.' },
    },
  ],
}

export const PublicacionSocial: Block = {
  slug: 'publicacionSocial',
  labels: { singular: 'Publicación de red social', plural: 'Publicaciones de redes sociales' },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'Enlace de la publicación',
      required: true,
      admin: {
        description: 'Enlace público de X, Facebook, Instagram, TikTok, Threads o Bluesky.',
      },
      validate: (valor: unknown) =>
        esEnlaceDeRedSocial(valor)
          ? true
          : 'Pega un enlace https:// de X, Facebook, Instagram, TikTok, Threads o Bluesky.',
    },
    {
      name: 'descripcion',
      type: 'text',
      label: 'Descripción breve',
      required: true,
      admin: { description: 'Ejemplo: Publicación del Departamento de Educación en X' },
    },
  ],
}

export const BLOQUES_DEL_EDITOR = [CitaDestacada, VideoYouTube, PublicacionSocial]
