import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Antetitulo, Fecha, Firmas, TarjetaArticulo, TituloDeBloque } from '@/components/articulos'
import { ContarVista } from '@/components/cliente/ContarVista'
import { RefrescarAlGuardar } from '@/components/cliente/RefrescarAlGuardar'
import { Compartir } from '@/components/Compartir'
import { ImagenMedia } from '@/components/ImagenMedia'
import { TextoRico } from '@/components/TextoRico'
import {
  articuloPorSlug,
  borradorPorSlug,
  obtenerAjustes,
  poblado,
  poblados,
  relacionados,
  slugsDeArticulos,
  vecinos,
} from '@/lib/datos'
import { diccionario, esLocale, LOCALES, type Locale } from '@/lib/i18n'
import { absoluta, rutas, SITIO } from '@/lib/rutas'
import { imagenSocial, jsonLdArticulo, serializarJsonLd } from '@/lib/seo'
import type { Articulo, Autore, Etiqueta, Media } from '@/payload-types'

type Props = { params: Promise<{ locale: string; slug: string }> }

// The most recent articles are built ahead of time; older ones on first visit.
export async function generateStaticParams() {
  const slugs = await slugsDeArticulos(100)
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

const cargar = async (locale: string, slug: string) => {
  if (!esLocale(locale)) return { articulo: null, borrador: false }
  const { isEnabled: borrador } = await draftMode()
  const articulo = borrador
    ? ((await borradorPorSlug('articulos', slug, locale)) as Articulo | null)
    : await articuloPorSlug(slug, locale)
  return { articulo, borrador }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const { articulo, borrador } = await cargar(locale, slug)
  if (!articulo) return {}
  const og = imagenSocial(articulo)
  const descripcion = articulo.meta?.description ?? articulo.subtitulo ?? undefined
  return {
    title: articulo.meta?.title?.replace(/\s*\|\s*La Pizarra$/, '') ?? articulo.titulo,
    description: descripcion,
    alternates: { canonical: absoluta(rutas(locale).articulo(slug)) },
    robots: borrador ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title: articulo.titulo,
      description: descripcion,
      url: absoluta(rutas(locale).articulo(slug)),
      publishedTime: articulo.fechaPublicacion ?? undefined,
      modifiedTime: articulo.fechaActualizacion ?? undefined,
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: articulo.titulo,
      description: descripcion,
      images: [og],
    },
  }
}

export default async function PaginaArticulo({ params }: Props) {
  const { locale, slug } = await params
  const { articulo, borrador } = await cargar(locale, slug)
  if (!articulo) notFound()

  const t = diccionario(locale)
  const r = rutas(locale)
  const imagen = poblado<Media>(articulo.imagenDestacada)
  const autores = poblados<Autore>(articulo.autores)
  const etiquetas = poblados<Etiqueta>(articulo.etiquetas)
  const pie = [articulo.leyendaImagen ?? imagen?.leyenda, imagen?.credito]
    .filter(Boolean)
    .join(' · ')
  const actualizado =
    articulo.fechaActualizacion && articulo.fechaActualizacion !== articulo.fechaPublicacion
  const url = absoluta(r.articulo(slug))

  const [ajustes, similares, alrededor] = await Promise.all([
    obtenerAjustes(locale as Locale),
    relacionados(articulo, locale as Locale),
    articulo.fechaPublicacion && articulo._status === 'published'
      ? vecinos(articulo.fechaPublicacion, articulo.id, locale as Locale)
      : { anterior: null, siguiente: null },
  ])

  return (
    <article className="pt-8">
      {borrador && (
        <>
          <RefrescarAlGuardar serverURL={SITIO} />
          <p className="contenedor mb-6">
            <span className="bg-alerta text-alerta-tinta font-ui block rounded px-4 py-2 text-sm font-semibold">
              {t.vistaPrevia}{' '}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- route handler: needs a full page load */}
              <a href="/vista-previa/salir" className="underline">
                {t.salirVistaPrevia}
              </a>
            </span>
          </p>
        </>
      )}

      <header className="contenedor">
        <div className="mx-auto flex max-w-[42.5rem] flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Antetitulo articulo={articulo} locale={locale} />
            {articulo.tipo !== 'noticia' && (
              <span className="border-linea font-ui text-gris rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase">
                {t.tipos[articulo.tipo]}
              </span>
            )}
          </div>
          <h1 className="text-[clamp(1.9rem,6vw,3.1rem)] font-bold">{articulo.titulo}</h1>
          {articulo.subtitulo && (
            <p className="text-gris text-xl leading-snug">{articulo.subtitulo}</p>
          )}
          <div className="meta border-linea flex flex-col gap-1 border-y py-3">
            <p>
              {t.por} <Firmas autores={articulo.autores} locale={locale} t={t} />
              {autores.length === 1 && autores[0]?.etiquetaDeRol
                ? `, ${autores[0].etiquetaDeRol}`
                : ''}
            </p>
            <p>
              <Fecha valor={articulo.fechaPublicacion} />
              {actualizado && (
                <>
                  {' · '}
                  {t.actualizado} <Fecha valor={articulo.fechaActualizacion} />
                </>
              )}
              {articulo.tiempoDeLectura ? ` · ${articulo.tiempoDeLectura} ${t.minDeLectura}` : ''}
            </p>
          </div>
        </div>
      </header>

      {imagen && (
        <figure className="contenedor mt-6">
          <div className="mx-auto max-w-4xl">
            <ImagenMedia
              media={imagen}
              tamanos="(min-width: 960px) 896px, 100vw"
              prioridad
              className="h-auto w-full rounded-md"
            />
            {pie && <figcaption className="meta mt-2">{pie}</figcaption>}
          </div>
        </figure>
      )}

      <div className="contenedor mt-8">
        <div className="mx-auto flex max-w-[42.5rem] flex-col gap-8">
          <TextoRico datos={articulo.cuerpo} locale={locale} t={t} />

          {articulo.feDeErrata && (
            <aside
              className="border-acento bg-superficie font-ui border-l-4 px-4 py-3 text-[0.9375rem]"
              role="note"
            >
              <strong>{t.feDeErrata}:</strong> {articulo.feDeErrata}
            </aside>
          )}

          {etiquetas.length > 0 && (
            <nav aria-label={t.etiquetas}>
              <ul className="font-ui flex flex-wrap gap-2 text-xs font-semibold">
                {etiquetas.map(
                  (etiqueta) =>
                    etiqueta.slug && (
                      <li key={etiqueta.id}>
                        <Link
                          href={r.etiqueta(etiqueta.slug)}
                          className="border-linea hover:bg-superficie block rounded-full border px-3 py-1.5"
                        >
                          {etiqueta.nombre}
                        </Link>
                      </li>
                    ),
                )}
              </ul>
            </nav>
          )}

          {!borrador && <Compartir url={url} titulo={articulo.titulo} t={t} />}
        </div>
      </div>

      {(alrededor.anterior || alrededor.siguiente) && (
        <nav
          aria-label={`${t.articuloAnterior} / ${t.articuloSiguiente}`}
          className="contenedor mt-12"
        >
          <div className="border-linea mx-auto grid max-w-[42.5rem] gap-6 border-y py-5 sm:grid-cols-2">
            {alrededor.anterior?.slug ? (
              <Link
                href={r.articulo(alrededor.anterior.slug)}
                rel="prev"
                className="group flex flex-col gap-1"
              >
                <span className="meta">← {t.articuloAnterior}</span>
                <span className="font-display text-lg leading-snug font-bold group-hover:underline">
                  {alrededor.anterior.titulo}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {alrededor.siguiente?.slug && (
              <Link
                href={r.articulo(alrededor.siguiente.slug)}
                rel="next"
                className="group flex flex-col gap-1 sm:text-right"
              >
                <span className="meta">{t.articuloSiguiente} →</span>
                <span className="font-display text-lg leading-snug font-bold group-hover:underline">
                  {alrededor.siguiente.titulo}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}

      {similares.length > 0 && (
        <aside className="contenedor mt-12">
          <TituloDeBloque>{t.relacionadas}</TituloDeBloque>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {similares.map((otro) => (
              <TarjetaArticulo key={otro.id} articulo={otro} locale={locale} t={t} />
            ))}
          </div>
        </aside>
      )}

      {!borrador && (
        <>
          <ContarVista slug={slug} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializarJsonLd(jsonLdArticulo(articulo, ajustes, locale)),
            }}
          />
        </>
      )}
    </article>
  )
}
