/**
 * Structured data (schema.org JSON-LD) and social-card helpers.
 */
import { poblado, poblados } from './datos'
import { absoluta, rutas, SITIO } from './rutas'
import type { Ajuste, Articulo, Autore, Categoria, Media } from '@/payload-types'

/** Safe to place inside <script type="application/ld+json">. */
export const serializarJsonLd = (datos: unknown): string =>
  JSON.stringify(datos).replace(/</g, '\\u003c')

const urlAbsoluta = (url: string | null | undefined): string | undefined =>
  url ? (url.startsWith('http') ? url : `${SITIO}${url}`) : undefined

/** Social-card image: the article's own photo, or a generated card with its headline. */
export const imagenSocial = (
  articulo: Pick<Articulo, 'slug' | 'imagenDestacada' | 'meta'>,
): string => {
  const media = poblado<Media>(articulo.meta?.image) ?? poblado<Media>(articulo.imagenDestacada)
  return (
    urlAbsoluta(media?.sizes?.og?.url ?? media?.url) ??
    `${SITIO}/og/articulo/${articulo.slug ?? ''}`
  )
}

export const editor = (ajustes: Pick<Ajuste, 'nombre'>) => ({
  '@type': 'NewsMediaOrganization',
  name: ajustes.nombre,
  url: SITIO,
  logo: { '@type': 'ImageObject', url: `${SITIO}/og/sitio` },
})

export const jsonLdSitio = (ajustes: Ajuste, locale: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    { ...editor(ajustes), description: ajustes.descripcion ?? undefined },
    {
      '@type': 'WebSite',
      name: ajustes.nombre,
      url: SITIO,
      inLanguage: locale,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${absoluta(rutas(locale).buscar())}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
})

export const jsonLdArticulo = (articulo: Articulo, ajustes: Ajuste, locale: string) => {
  const r = rutas(locale)
  const url = absoluta(r.articulo(articulo.slug ?? ''))
  const categoria = poblado<Categoria>(articulo.categoria)
  return {
    '@context': 'https://schema.org',
    '@type': articulo.tipo === 'opinion' ? 'OpinionNewsArticle' : 'NewsArticle',
    headline: articulo.titulo.slice(0, 110),
    description: articulo.subtitulo ?? undefined,
    image: [imagenSocial(articulo)],
    datePublished: articulo.fechaPublicacion ?? undefined,
    dateModified: articulo.fechaActualizacion ?? articulo.fechaPublicacion ?? undefined,
    inLanguage: locale,
    isAccessibleForFree: true,
    articleSection: categoria?.nombre,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    // Only the public name: never a minor's real name.
    author: poblados<Autore>(articulo.autores).map((autor) => ({
      '@type': 'Person',
      name: autor.nombrePublico,
      url: autor.slug ? absoluta(r.autor(autor.slug)) : undefined,
    })),
    publisher: editor(ajustes),
    ...(articulo.feDeErrata ? { correction: articulo.feDeErrata } : {}),
  }
}
