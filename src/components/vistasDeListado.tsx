/**
 * Section, tag and author pages. Each has two routes (/…/[slug] and
 * /…/[slug]/pagina/[n]) that render the same view, so the views live here.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import {
  autorPorSlug,
  categoriaPorSlug,
  etiquetaPorSlug,
  listarArticulos,
  poblado,
  type FiltroArticulos,
} from '@/lib/datos'
import { diccionario, esLocale, type Locale } from '@/lib/i18n'
import { absoluta, rutas } from '@/lib/rutas'
import type { Media } from '@/payload-types'

import { Listado } from './articulos'
import { ImagenMedia } from './ImagenMedia'

export type Tipo = 'seccion' | 'etiqueta' | 'autor'
export type Parametros = { locale: string; slug: string; n?: string }

type Encabezado = {
  id: number
  titulo: string
  descripcion?: string | null
  extra?: ReactNode
  filtro: FiltroArticulos
}

/** "2" → 2. Anything that is not a clean page number ≥ 2 is a 404 (page 1 has no suffix). */
const numeroDePagina = (n: string | undefined): number | null => {
  if (n === undefined) return 1
  if (!/^[1-9]\d{0,3}$/.test(n)) return null
  const numero = Number(n)
  return numero >= 2 ? numero : null
}

const cargar = async (tipo: Tipo, slug: string, locale: Locale): Promise<Encabezado | null> => {
  const t = diccionario(locale)
  if (tipo === 'seccion') {
    const c = await categoriaPorSlug(slug, locale)
    return (
      c && { id: c.id, titulo: c.nombre, descripcion: c.descripcion, filtro: { categoria: c.id } }
    )
  }
  if (tipo === 'etiqueta') {
    const e = await etiquetaPorSlug(slug, locale)
    return e && { id: e.id, titulo: e.nombre, filtro: { etiqueta: e.id } }
  }
  const a = await autorPorSlug(slug, locale)
  if (!a?.nombrePublico) return null
  // For minors the API has already removed photo and social links.
  const foto = poblado<Media>(a.foto)
  return {
    id: a.id,
    titulo: a.nombrePublico,
    descripcion: a.bio,
    filtro: { autor: a.id },
    extra: (
      <>
        {a.etiquetaDeRol && <p className="font-ui text-gris text-base">{a.etiquetaDeRol}</p>}
        {a.redes?.length ? (
          <ul className="font-ui flex flex-wrap gap-x-4 text-sm font-semibold">
            {a.redes.map((red) => (
              <li key={red.id}>
                <a
                  href={red.url}
                  rel="noopener noreferrer me"
                  className="text-acento hover:underline"
                >
                  {t.redes[red.plataforma]}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {foto && (
          <ImagenMedia
            media={foto}
            tamanos="96px"
            alt=""
            className="order-first size-24 rounded-full object-cover"
          />
        )}
      </>
    ),
  }
}

const ROTULO = { seccion: 'seccion', etiqueta: 'etiqueta', autor: 'autor' } as const

export const metadatosDeListado = async (
  tipo: Tipo,
  params: Promise<Parametros>,
): Promise<Metadata> => {
  const { locale, slug, n } = await params
  const pagina = numeroDePagina(n)
  if (!esLocale(locale) || !pagina) return {}
  const datos = await cargar(tipo, slug, locale)
  if (!datos) return {}
  const t = diccionario(locale)
  return {
    title:
      pagina > 1
        ? `${datos.titulo} · ${t.paginaDe(pagina, pagina).split(' de ')[0]}`
        : datos.titulo,
    description: datos.descripcion ?? undefined,
    alternates: { canonical: absoluta(rutas(locale)[tipo](slug, pagina)) },
  }
}

export async function VistaDeListado({
  tipo,
  params,
}: {
  tipo: Tipo
  params: Promise<Parametros>
}) {
  const { locale, slug, n } = await params
  const pagina = numeroDePagina(n)
  if (!esLocale(locale) || !pagina) notFound()

  const datos = await cargar(tipo, slug, locale)
  if (!datos) notFound()

  const t = diccionario(locale)
  const resultado = await listarArticulos({ ...datos.filtro, pagina }, locale)
  if (pagina > 1 && pagina > resultado.paginas) notFound()

  return (
    <div className="contenedor pt-8">
      <header className="border-tinta mb-8 flex flex-col gap-2 border-b pb-6">
        <p className="antetitulo">{t[ROTULO[tipo]]}</p>
        <h1 className="text-[clamp(2rem,6vw,3rem)] font-extrabold">{datos.titulo}</h1>
        {datos.descripcion && <p className="text-gris max-w-2xl text-lg">{datos.descripcion}</p>}
        {datos.extra}
        <p className="meta">{t.articulos(resultado.total)}</p>
      </header>
      <Listado
        articulos={resultado.articulos}
        pagina={pagina}
        paginas={resultado.paginas}
        hrefDe={(numero) => rutas(locale)[tipo](slug, numero)}
        locale={locale}
        t={t}
      />
    </div>
  )
}
