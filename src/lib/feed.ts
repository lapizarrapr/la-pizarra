/**
 * RSS 2.0 feed builder (global feed and one per section).
 */
import { nombreDeMunicipio } from '@/fields/municipios'
import type { Autore, Categoria } from '@/payload-types'

import { poblado, poblados, type ArticuloLista } from './datos'
import { absoluta, rutas } from './rutas'

const xml = (texto: string | null | undefined): string =>
  (texto ?? '')
    // Characters XML 1.0 does not allow at all.
    .replace(/[^\x09\x0A\x0D\x20-퟿-�]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

type Opciones = {
  titulo: string
  descripcion: string
  /** Page this feed belongs to, e.g. "/" or "/seccion/opinion". */
  ruta: string
  /** Address of the feed itself. */
  rutaDelFeed: string
  articulos: ArticuloLista[]
  locale: string
}

export const construirFeed = ({
  titulo,
  descripcion,
  ruta,
  rutaDelFeed,
  articulos,
  locale,
}: Opciones): Response => {
  const r = rutas(locale)
  const ultima = articulos[0]?.fechaPublicacion

  const items = articulos
    .map((articulo) => {
      const url = absoluta(r.articulo(articulo.slug ?? ''))
      const categoria = poblado<Categoria>(articulo.categoria)
      const municipio = nombreDeMunicipio(articulo.municipio)
      const firmas = poblados<Autore>(articulo.autores)
        .map((autor) => autor.nombrePublico)
        .filter(Boolean)
        .join(', ')
      return `    <item>
      <title>${xml(articulo.titulo)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      ${articulo.fechaPublicacion ? `<pubDate>${new Date(articulo.fechaPublicacion).toUTCString()}</pubDate>` : ''}
      ${articulo.subtitulo ? `<description>${xml(articulo.subtitulo)}</description>` : ''}
      ${firmas ? `<dc:creator>${xml(firmas)}</dc:creator>` : ''}
      ${categoria ? `<category>${xml(categoria.nombre)}</category>` : ''}
      ${municipio ? `<category>${xml(municipio)}</category>` : ''}
    </item>`
    })
    .join('\n')

  const cuerpo = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(titulo)}</title>
    <link>${xml(absoluta(ruta))}</link>
    <description>${xml(descripcion)}</description>
    <language>${locale === 'es' ? 'es-PR' : xml(locale)}</language>
    <atom:link href="${xml(absoluta(rutaDelFeed))}" rel="self" type="application/rss+xml" />
    ${ultima ? `<lastBuildDate>${new Date(ultima).toUTCString()}</lastBuildDate>` : ''}
${items}
  </channel>
</rss>
`

  return new Response(cuerpo, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600',
    },
  })
}
