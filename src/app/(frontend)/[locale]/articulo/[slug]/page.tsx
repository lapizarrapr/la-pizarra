import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Antetitulo, Fecha, Firmas } from '@/components/articulos'
import { RefrescarAlGuardar } from '@/components/cliente/RefrescarAlGuardar'
import { ImagenMedia } from '@/components/ImagenMedia'
import { TextoRico } from '@/components/TextoRico'
import { articuloPorSlug, borradorPorSlug, poblado, poblados, slugsDeArticulos } from '@/lib/datos'
import { diccionario, esLocale, LOCALES } from '@/lib/i18n'
import { absoluta, rutas, SITIO } from '@/lib/rutas'
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
  const imagen = poblado<Media>(articulo.meta?.image) ?? poblado<Media>(articulo.imagenDestacada)
  const og = imagen?.sizes?.og?.url ?? imagen?.url
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
      images: og ? [{ url: og.startsWith('http') ? og : `${SITIO}${og}` }] : undefined,
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
        </div>
      </div>
    </article>
  )
}
