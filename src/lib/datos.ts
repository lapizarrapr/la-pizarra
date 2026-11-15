/**
 * Read-only data access for the public site.
 *
 * - Everything goes through Payload with `overrideAccess: false` and no user,
 *   so the public site can only ever see what an anonymous visitor may see
 *   (published content, protected author fields removed).
 * - Results are cached and tagged. Payload hooks (hooks/revalidar.ts) expire
 *   the tags when content changes, so pages stay static but update at once.
 */
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Where } from 'payload'

import type { Articulo, Autore, Categoria, Etiqueta, Pagina } from '@/payload-types'

import { LOCALE_PREDETERMINADO, type Locale } from './i18n'

export const ETIQUETAS_CACHE = {
  articulos: 'articulos',
  taxonomias: 'taxonomias',
  autores: 'autores',
  paginas: 'paginas',
  globales: 'globales',
} as const

/** Safety net: even without an explicit invalidation, nothing is older than this. */
const REVALIDAR_SEGUNDOS = 3600

export const POR_PAGINA = 12

const cms = async () => getPayload({ config })

const enCache = <A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  clave: string,
  tags: string[],
): ((...args: A) => Promise<R>) =>
  unstable_cache(fn, [clave], { tags, revalidate: REVALIDAR_SEGUNDOS })

/** Fields needed to show an article in a list or card (no body). */
const CAMPOS_LISTA = {
  titulo: true,
  subtitulo: true,
  slug: true,
  imagenDestacada: true,
  autores: true,
  categoria: true,
  tipo: true,
  municipio: true,
  ultimaHora: true,
  fechaPublicacion: true,
  tiempoDeLectura: true,
} as const

export type ArticuloLista = Pick<Articulo, 'id' | keyof typeof CAMPOS_LISTA>

/** Relationship fields arrive as an id or a populated document. */
export const poblado = <T extends { id: number }>(
  valor: number | T | null | undefined,
): T | null => (valor && typeof valor === 'object' ? valor : null)

export const poblados = <T extends { id: number }>(
  valores: (number | T)[] | null | undefined,
): T[] => (valores ?? []).filter((v): v is T => typeof v === 'object' && v !== null)

// ── Globals ──────────────────────────────────────────────────────────────────
export const obtenerAjustes = enCache(
  async (locale: Locale = LOCALE_PREDETERMINADO) =>
    (await cms()).findGlobal({ slug: 'ajustes', locale, depth: 1, overrideAccess: false }),
  'ajustes',
  [ETIQUETAS_CACHE.globales, ETIQUETAS_CACHE.articulos],
)

export const obtenerNavegacion = enCache(
  async (locale: Locale = LOCALE_PREDETERMINADO) =>
    (await cms()).findGlobal({ slug: 'navegacion', locale, depth: 0, overrideAccess: false }),
  'navegacion',
  [ETIQUETAS_CACHE.globales],
)

export const obtenerPortada = enCache(
  async (locale: Locale = LOCALE_PREDETERMINADO) =>
    (await cms()).findGlobal({ slug: 'portada', locale, depth: 0, overrideAccess: false }),
  'portada',
  [ETIQUETAS_CACHE.globales],
)

// ── Artículos ────────────────────────────────────────────────────────────────
export type FiltroArticulos = {
  pagina?: number
  limite?: number
  categoria?: number
  etiqueta?: number
  autor?: number
  tipos?: Articulo['tipo'][]
  destacado?: boolean
  ids?: number[]
  excluir?: number[]
}

export const listarArticulos = enCache(
  async (filtro: FiltroArticulos = {}, locale: Locale = LOCALE_PREDETERMINADO) => {
    const and: Where[] = []
    if (filtro.categoria) and.push({ categoria: { equals: filtro.categoria } })
    if (filtro.etiqueta) and.push({ etiquetas: { contains: filtro.etiqueta } })
    if (filtro.autor) and.push({ autores: { contains: filtro.autor } })
    if (filtro.tipos?.length) and.push({ tipo: { in: filtro.tipos } })
    if (filtro.destacado !== undefined) and.push({ destacado: { equals: filtro.destacado } })
    if (filtro.ids) and.push({ id: { in: filtro.ids.length ? filtro.ids : [0] } })
    if (filtro.excluir?.length) and.push({ id: { not_in: filtro.excluir } })

    const resultado = await (
      await cms()
    ).find({
      collection: 'articulos',
      where: and.length ? { and } : {},
      sort: '-fechaPublicacion',
      limit: filtro.limite ?? POR_PAGINA,
      page: filtro.pagina ?? 1,
      depth: 1,
      select: CAMPOS_LISTA,
      locale,
      overrideAccess: false,
    })

    return {
      articulos: resultado.docs as ArticuloLista[],
      total: resultado.totalDocs,
      paginas: resultado.totalPages,
      pagina: resultado.page ?? 1,
    }
  },
  'listar-articulos',
  [ETIQUETAS_CACHE.articulos, ETIQUETAS_CACHE.taxonomias, ETIQUETAS_CACHE.autores],
)

/** Specific articles in the order given (for the editor-curated front page). */
export const articulosEnOrden = async (
  ids: number[],
  locale?: Locale,
): Promise<ArticuloLista[]> => {
  if (!ids.length) return []
  const { articulos } = await listarArticulos({ ids, limite: ids.length }, locale)
  const porId = new Map(articulos.map((a) => [a.id, a]))
  return ids.map((id) => porId.get(id)).filter((a): a is ArticuloLista => Boolean(a))
}

export const articuloPorSlug = enCache(
  async (slug: string, locale: Locale = LOCALE_PREDETERMINADO): Promise<Articulo | null> => {
    const { docs } = await (
      await cms()
    ).find({
      collection: 'articulos',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
      locale,
      overrideAccess: false,
    })
    return docs[0] ?? null
  },
  'articulo-por-slug',
  [ETIQUETAS_CACHE.articulos, ETIQUETAS_CACHE.taxonomias, ETIQUETAS_CACHE.autores],
)

/**
 * Latest saved version, including unpublished drafts. NOT cached and NOT
 * access-restricted: call it only after confirming draft mode, which the
 * preview route enables only for logged-in newsroom users.
 */
export const borradorPorSlug = async (
  coleccion: 'articulos' | 'paginas',
  slug: string,
  locale: Locale = LOCALE_PREDETERMINADO,
): Promise<Articulo | Pagina | null> => {
  const { docs } = await (
    await cms()
  ).find({
    collection: coleccion,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    draft: true,
    locale,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

export const slugsDeArticulos = async (limite = 200): Promise<string[]> => {
  const { docs } = await (
    await cms()
  ).find({
    collection: 'articulos',
    sort: '-fechaPublicacion',
    limit: limite,
    depth: 0,
    select: { slug: true },
    overrideAccess: false,
  })
  return docs.map((d) => d.slug).filter((s): s is string => Boolean(s))
}

// ── Secciones, etiquetas, autores, páginas ───────────────────────────────────
export const listarCategorias = enCache(
  async (locale: Locale = LOCALE_PREDETERMINADO): Promise<Categoria[]> =>
    (
      await (
        await cms()
      ).find({ collection: 'categorias', sort: 'orden', limit: 100, locale, overrideAccess: false })
    ).docs,
  'listar-categorias',
  [ETIQUETAS_CACHE.taxonomias],
)

const unoPorSlug = <T>(
  coleccion: 'categorias' | 'etiquetas' | 'autores' | 'paginas',
  tag: string,
) =>
  enCache(
    async (slug: string, locale: Locale = LOCALE_PREDETERMINADO): Promise<T | null> => {
      const { docs } = await (
        await cms()
      ).find({
        collection: coleccion,
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
        locale,
        overrideAccess: false,
      })
      return (docs[0] as T | undefined) ?? null
    },
    `${coleccion}-por-slug`,
    [tag],
  )

export const categoriaPorSlug = unoPorSlug<Categoria>('categorias', ETIQUETAS_CACHE.taxonomias)
export const etiquetaPorSlug = unoPorSlug<Etiqueta>('etiquetas', ETIQUETAS_CACHE.taxonomias)
export const autorPorSlug = unoPorSlug<Autore>('autores', ETIQUETAS_CACHE.autores)
export const paginaPorSlug = unoPorSlug<Pagina>('paginas', ETIQUETAS_CACHE.paginas)

export const slugsDe = async (
  coleccion: 'categorias' | 'etiquetas' | 'autores' | 'paginas',
): Promise<string[]> => {
  const { docs } = await (
    await cms()
  ).find({
    collection: coleccion,
    limit: 500,
    depth: 0,
    select: { slug: true },
    overrideAccess: false,
  })
  return docs.map((d) => d.slug).filter((s): s is string => Boolean(s))
}
