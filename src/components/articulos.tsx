import Link from 'next/link'
import type { ReactNode } from 'react'

import { nombreDeMunicipio } from '@/fields/municipios'
import { poblado, poblados, type ArticuloLista } from '@/lib/datos'
import { aISO, formatearFecha } from '@/lib/fechas'
import type { Diccionario } from '@/lib/i18n'
import { rutas } from '@/lib/rutas'
import type { Autore, Categoria, Media } from '@/payload-types'

import { ImagenMedia } from './ImagenMedia'

type Base = { locale: string; t: Diccionario }

/** "Sección · Municipio" label above a headline. */
export function Antetitulo({
  articulo,
  locale,
  enlazar = true,
}: {
  articulo: Pick<ArticuloLista, 'categoria' | 'municipio'>
  locale: string
  enlazar?: boolean
}) {
  const categoria = poblado<Categoria>(articulo.categoria)
  const municipio = nombreDeMunicipio(articulo.municipio)
  if (!categoria && !municipio) return null
  return (
    <p className="antetitulo">
      {categoria &&
        (enlazar && categoria.slug ? (
          <Link href={rutas(locale).seccion(categoria.slug)} className="hover:underline">
            {categoria.nombre}
          </Link>
        ) : (
          categoria.nombre
        ))}
      {categoria && municipio && ' · '}
      {municipio}
    </p>
  )
}

/** "Ana Rivera y Luis Soto", each linked to their author page. */
export function Firmas({
  autores,
  locale,
  t,
  enlazar = true,
}: Base & { autores: ArticuloLista['autores']; enlazar?: boolean }) {
  const lista = poblados<Autore>(autores)
  if (!lista.length) return null
  return (
    <>
      {lista.map((autor, i) => (
        <span key={autor.id}>
          {i > 0 && (i === lista.length - 1 ? ` ${t.y} ` : ', ')}
          {enlazar && autor.slug ? (
            <Link
              href={rutas(locale).autor(autor.slug)}
              className="text-tinta font-semibold hover:underline"
            >
              {autor.nombrePublico}
            </Link>
          ) : (
            <span className="text-tinta font-semibold">{autor.nombrePublico}</span>
          )}
        </span>
      ))}
    </>
  )
}

export function Fecha({ valor, className }: { valor?: string | null; className?: string }) {
  if (!valor) return null
  return (
    <time dateTime={aISO(valor)} className={className}>
      {formatearFecha(valor)}
    </time>
  )
}

function UltimaHora({ t }: { t: Diccionario }) {
  return (
    <span className="bg-alerta text-alerta-tinta font-ui mr-2 inline-block rounded-sm px-1.5 py-0.5 align-middle text-[0.6875rem] font-extrabold tracking-wider uppercase">
      {t.ultimaHora}
    </span>
  )
}

type PropsTarjeta = Base & {
  articulo: ArticuloLista
  /** hero: big lead story · imagen: card with photo · texto: headline only · fila: compact row with date */
  variante?: 'hero' | 'imagen' | 'texto' | 'fila'
  /** Heading level, so each page keeps a correct outline. */
  nivel?: 'h2' | 'h3'
  prioridad?: boolean
  mostrarBajada?: boolean
}

export function TarjetaArticulo({
  articulo,
  locale,
  t,
  variante = 'imagen',
  nivel: Titular = 'h3',
  prioridad = false,
  mostrarBajada,
}: PropsTarjeta) {
  const href = rutas(locale).articulo(articulo.slug ?? '')
  const imagen = poblado<Media>(articulo.imagenDestacada)

  const titular = (clases: string) => (
    <Titular className={clases}>
      {articulo.ultimaHora && variante !== 'fila' && <UltimaHora t={t} />}
      <Link href={href} className="enlace-titular">
        {articulo.titulo}
      </Link>
    </Titular>
  )

  const firma = (
    <p className="meta">
      <Firmas autores={articulo.autores} locale={locale} t={t} />
    </p>
  )

  if (variante === 'hero') {
    return (
      <article className="flex flex-col gap-3">
        {imagen && (
          <Link href={href} tabIndex={-1} aria-hidden="true">
            <ImagenMedia
              media={imagen}
              alt=""
              tamanos="(min-width: 1024px) 720px, 100vw"
              prioridad={prioridad}
              className="aspect-video w-full rounded-md object-cover"
            />
          </Link>
        )}
        <Antetitulo articulo={articulo} locale={locale} />
        {titular('text-[clamp(1.75rem,5.5vw,3rem)] font-bold')}
        {articulo.subtitulo && <p className="text-gris text-lg">{articulo.subtitulo}</p>}
        <p className="meta">
          {t.por} <Firmas autores={articulo.autores} locale={locale} t={t} />
          {articulo.tiempoDeLectura ? ` · ${articulo.tiempoDeLectura} ${t.minDeLectura}` : ''}
        </p>
      </article>
    )
  }

  if (variante === 'fila') {
    return (
      <article className="border-linea grid grid-cols-[5.5rem_1fr] gap-3 border-b py-3">
        <Fecha valor={articulo.fechaPublicacion} className="meta pt-1 tabular-nums" />
        <div className="flex min-w-0 flex-col gap-1">
          {titular('text-lg font-bold')}
          {mostrarBajada && articulo.subtitulo && (
            <p className="text-gris text-base">{articulo.subtitulo}</p>
          )}
        </div>
      </article>
    )
  }

  if (variante === 'texto') {
    return (
      <article className="border-linea flex flex-col gap-1.5 border-b pb-4">
        <Antetitulo articulo={articulo} locale={locale} />
        {titular('text-xl font-bold')}
        {firma}
      </article>
    )
  }

  return (
    <article className="flex min-w-0 flex-col gap-2">
      {imagen && (
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <ImagenMedia
            media={imagen}
            alt=""
            tamanos="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="aspect-video w-full rounded-md object-cover"
          />
        </Link>
      )}
      <Antetitulo articulo={articulo} locale={locale} />
      {titular('text-xl font-bold')}
      {mostrarBajada && articulo.subtitulo && (
        <p className="text-gris text-base">{articulo.subtitulo}</p>
      )}
      {firma}
    </article>
  )
}

/** Section heading with a rule: "LO ÚLTIMO ─────────  Ver todo". */
export function TituloDeBloque({
  children,
  href,
  verTodo,
  nivel: Nivel = 'h2',
}: {
  children: ReactNode
  href?: string
  verTodo?: string
  nivel?: 'h2' | 'h3'
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Nivel className="font-ui text-acento text-[0.8125rem] leading-none font-bold tracking-widest uppercase">
        {href ? (
          <Link href={href} className="hover:underline">
            {children}
          </Link>
        ) : (
          children
        )}
      </Nivel>
      <span className="bg-tinta h-px flex-1" aria-hidden="true" />
      {href && verTodo && (
        <Link href={href} className="meta hover:underline">
          {verTodo}
          <span className="sr-only">: {children}</span>
        </Link>
      )}
    </div>
  )
}

export function Paginacion({
  pagina,
  paginas,
  hrefDe,
  t,
}: {
  pagina: number
  paginas: number
  hrefDe: (n: number) => string
  t: Diccionario
}) {
  if (paginas <= 1) return null
  const boton = 'border-tinta font-ui rounded-full border px-4 py-2 text-sm font-semibold'
  return (
    <nav aria-label={t.paginacion} className="mt-8 flex items-center justify-between gap-4">
      {pagina > 1 ? (
        <Link href={hrefDe(pagina - 1)} rel="prev" className={`${boton} hover:bg-superficie`}>
          ← {t.anterior}
        </Link>
      ) : (
        <span />
      )}
      <p className="meta" aria-current="page">
        {t.paginaDe(pagina, paginas)}
      </p>
      {pagina < paginas ? (
        <Link href={hrefDe(pagina + 1)} rel="next" className={`${boton} hover:bg-superficie`}>
          {t.siguiente} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

/** Shared layout for section, tag and author pages. */
export function Listado({
  articulos,
  pagina,
  paginas,
  hrefDe,
  locale,
  t,
}: Base & {
  articulos: ArticuloLista[]
  pagina: number
  paginas: number
  hrefDe: (n: number) => string
}) {
  if (!articulos.length) return <p className="text-gris py-10">{t.sinArticulos}</p>

  // The first page leads with one large story; later pages are a plain grid.
  const [primero, ...resto] = pagina === 1 ? articulos : [undefined, ...articulos]
  return (
    <>
      {primero && (
        <div className="border-linea mb-8 border-b pb-8">
          <TarjetaArticulo
            articulo={primero}
            locale={locale}
            t={t}
            variante="hero"
            nivel="h2"
            prioridad
          />
        </div>
      )}
      <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {resto.map(
          (articulo) =>
            articulo && (
              <TarjetaArticulo
                key={articulo.id}
                articulo={articulo}
                locale={locale}
                t={t}
                nivel="h2"
                mostrarBajada
              />
            ),
        )}
      </div>
      <Paginacion pagina={pagina} paginas={paginas} hrefDe={hrefDe} t={t} />
    </>
  )
}
