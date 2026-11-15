import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FormularioDeBoletin, FormularioDeMensaje } from '@/components/cliente/Formularios'
import { RefrescarAlGuardar } from '@/components/cliente/RefrescarAlGuardar'
import { ImagenMedia } from '@/components/ImagenMedia'
import { TextoRico } from '@/components/TextoRico'
import { borradorPorSlug, paginaPorSlug, poblado, slugsDe } from '@/lib/datos'
import { diccionario, esLocale, LOCALES } from '@/lib/i18n'
import { absoluta, rutas, SITIO } from '@/lib/rutas'
import type { Media, Pagina } from '@/payload-types'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await slugsDe('paginas')
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

const cargar = async (locale: string, slug: string) => {
  if (!esLocale(locale)) return { pagina: null, borrador: false }
  const { isEnabled: borrador } = await draftMode()
  const pagina = borrador
    ? ((await borradorPorSlug('paginas', slug, locale)) as Pagina | null)
    : await paginaPorSlug(slug, locale)
  return { pagina, borrador }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const { pagina } = await cargar(locale, slug)
  if (!pagina) return {}
  return {
    title: pagina.titulo,
    description: pagina.meta?.description ?? pagina.introduccion ?? undefined,
    alternates: { canonical: absoluta(rutas(locale).pagina(slug)) },
  }
}

export default async function PaginaFija({ params }: Props) {
  const { locale, slug } = await params
  const { pagina, borrador } = await cargar(locale, slug)
  if (!pagina) notFound()
  const t = diccionario(locale)
  const r = rutas(locale)

  return (
    <div className="contenedor pt-8">
      {borrador && <RefrescarAlGuardar serverURL={SITIO} />}
      <div className="mx-auto flex max-w-[42.5rem] flex-col gap-8">
        <header className="border-tinta flex flex-col gap-3 border-b pb-6">
          <h1 className="text-[clamp(2rem,6vw,3rem)] font-extrabold">{pagina.titulo}</h1>
          {pagina.introduccion && (
            <p className="text-gris text-xl leading-snug">{pagina.introduccion}</p>
          )}
        </header>

        {pagina.bloques?.map((bloque) => {
          switch (bloque.blockType) {
            case 'texto':
              return <TextoRico key={bloque.id} datos={bloque.contenido} locale={locale} t={t} />

            case 'llamada':
              return (
                <section
                  key={bloque.id}
                  className="bg-pizarra text-tiza flex flex-col items-start gap-3 rounded-md p-6"
                >
                  <h2 className="text-2xl font-bold">{bloque.titulo}</h2>
                  {bloque.texto && <p className="opacity-90">{bloque.texto}</p>}
                  <Link
                    href={r.libre(bloque.enlace)}
                    className="bg-alerta text-alerta-tinta font-ui rounded-full px-5 py-2.5 text-sm font-bold"
                  >
                    {bloque.etiquetaBoton}
                  </Link>
                </section>
              )

            case 'imagen': {
              const media = poblado<Media>(bloque.imagen)
              if (!media) return null
              const pie = [bloque.leyenda ?? media.leyenda, media.credito]
                .filter(Boolean)
                .join(' · ')
              return (
                <figure key={bloque.id}>
                  <ImagenMedia
                    media={media}
                    tamanos="(min-width: 768px) 680px, 100vw"
                    className="h-auto w-full rounded-md"
                  />
                  {pie && <figcaption className="meta mt-2">{pie}</figcaption>}
                </figure>
              )
            }

            case 'formulario':
              return bloque.tipo === 'boletin' ? (
                <FormularioDeBoletin key={bloque.id} titulo={bloque.titulo} />
              ) : (
                <FormularioDeMensaje
                  key={bloque.id}
                  tipo={bloque.tipo}
                  titulo={bloque.titulo}
                  rutaPrivacidad={r.pagina('privacidad')}
                />
              )

            case 'preguntas':
              return (
                <section key={bloque.id} className="flex flex-col gap-3">
                  {bloque.titulo && <h2 className="text-2xl font-bold">{bloque.titulo}</h2>}
                  {bloque.items?.map((item) => (
                    <details key={item.id} className="border-linea border-b pb-3">
                      <summary className="font-ui cursor-pointer py-2 font-semibold">
                        {item.pregunta}
                      </summary>
                      <p className="text-gris whitespace-pre-line">{item.respuesta}</p>
                    </details>
                  ))}
                </section>
              )

            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
