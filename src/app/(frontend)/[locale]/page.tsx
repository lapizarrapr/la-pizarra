import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Firmas, TarjetaArticulo, TituloDeBloque } from '@/components/articulos'
import {
  articulosEnOrden,
  listarArticulos,
  listarCategorias,
  masLeidos,
  obtenerAjustes,
  obtenerPortada,
  type ArticuloLista,
} from '@/lib/datos'
import { diccionario, esLocale } from '@/lib/i18n'
import { rutas } from '@/lib/rutas'
import { jsonLdSitio, serializarJsonLd } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

const idDe = (valor: number | { id: number } | null | undefined): number | undefined =>
  typeof valor === 'object' && valor ? valor.id : (valor ?? undefined)

export default async function Portada({ params }: Props) {
  const { locale } = await params
  if (!esLocale(locale)) notFound()
  const t = diccionario(locale)
  const r = rutas(locale)

  const [portada, categorias] = await Promise.all([
    obtenerPortada(locale),
    listarCategorias(locale),
  ])

  // 1. What the editor picked. 2. Otherwise "destacado" articles. 3. Otherwise the newest.
  const idPrincipal = idDe(portada.principal)
  const idsSecundarias = (portada.secundarias ?? [])
    .map(idDe)
    .filter((id): id is number => Boolean(id))
  const [elegidos, destacados] = await Promise.all([
    articulosEnOrden([...(idPrincipal ? [idPrincipal] : []), ...idsSecundarias], locale),
    listarArticulos({ destacado: true, limite: 8 }, locale),
  ])

  const usados = new Set<number>()
  const tomar = (lista: ArticuloLista[], cuantos: number): ArticuloLista[] => {
    const salida: ArticuloLista[] = []
    for (const articulo of lista) {
      if (salida.length >= cuantos) break
      if (usados.has(articulo.id)) continue
      usados.add(articulo.id)
      salida.push(articulo)
    }
    return salida
  }

  const candidatos = [...elegidos, ...destacados.articulos]
  let [principal] = tomar(idPrincipal ? candidatos : [...destacados.articulos, ...elegidos], 1)
  let secundarias = tomar(candidatos, 3)

  const opinionSlug = categorias.find((c) => c.slug === 'opinion')
  const vocesSlug = categorias.find((c) => c.slug === 'voces-estudiantiles')

  const [recientes, opinion, voces, leidas, ajustes] = await Promise.all([
    listarArticulos({ limite: 14 }, locale),
    portada.mostrarOpinion !== false
      ? listarArticulos({ tipos: ['opinion'], limite: 3 }, locale)
      : null,
    portada.mostrarVocesEstudiantiles !== false && vocesSlug
      ? listarArticulos({ categoria: vocesSlug.id, limite: 2 }, locale)
      : null,
    portada.mostrarMasLeidas !== false ? masLeidos(5, locale) : [],
    obtenerAjustes(locale),
  ])

  if (!principal) [principal] = tomar(recientes.articulos, 1)
  if (secundarias.length < 3) {
    secundarias = [...secundarias, ...tomar(recientes.articulos, 3 - secundarias.length)]
  }

  // Opinion and student voices have their own blocks; don't repeat them in "Lo último".
  const enBloques = new Set([
    ...(opinion?.articulos ?? []).map((a) => a.id),
    ...(voces?.articulos ?? []).map((a) => a.id),
  ])
  const loUltimo = tomar(
    recientes.articulos.filter((a) => !enBloques.has(a.id)),
    6,
  )

  const idsSecciones = (portada.secciones ?? []).map(idDe).filter((id): id is number => Boolean(id))
  const filas = await Promise.all(
    idsSecciones.map(async (id) => {
      const categoria = categorias.find((c) => c.id === id)
      if (!categoria) return null
      const { articulos } = await listarArticulos({ categoria: id, limite: 3 }, locale)
      return articulos.length ? { categoria, articulos } : null
    }),
  )

  if (!principal) {
    return <p className="contenedor text-gris py-20 text-center">{t.sinArticulos}</p>
  }

  return (
    <div className="flex flex-col gap-12 pt-6">
      <h1 className="sr-only">{ajustes.nombre}</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLdSitio(ajustes, locale)) }}
      />

      <section className="contenedor grid gap-8 lg:grid-cols-[1.9fr_1fr]" aria-label={t.destacadas}>
        <TarjetaArticulo
          articulo={principal}
          locale={locale}
          t={t}
          variante="hero"
          nivel="h2"
          prioridad
        />
        <div className="flex flex-col gap-4">
          {secundarias.map((articulo) => (
            <TarjetaArticulo
              key={articulo.id}
              articulo={articulo}
              locale={locale}
              t={t}
              variante="texto"
            />
          ))}
        </div>
      </section>

      {opinion?.articulos.length ? (
        <section className="contenedor">
          <TituloDeBloque
            href={opinionSlug?.slug ? r.seccion(opinionSlug.slug) : undefined}
            verTodo={t.verTodo}
          >
            {t.opinion}
          </TituloDeBloque>
          <div className="grid gap-6 md:grid-cols-3">
            {opinion.articulos.map((articulo) => (
              <article key={articulo.id} className="flex flex-col gap-1.5">
                <h3 className="text-xl font-medium italic">
                  <Link href={r.articulo(articulo.slug ?? '')} className="enlace-titular">
                    {articulo.titulo}
                  </Link>
                </h3>
                <p className="meta">
                  <Firmas autores={articulo.autores} locale={locale} t={t} />
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {voces?.articulos.length ? (
        <section className="bg-pizarra text-tiza">
          <div className="contenedor flex flex-col gap-5 py-8">
            <h2 className="font-ui text-[0.8125rem] leading-none font-bold tracking-widest uppercase">
              {vocesSlug?.slug ? (
                <Link href={r.seccion(vocesSlug.slug)} className="hover:underline">
                  {t.vocesEstudiantiles}
                </Link>
              ) : (
                t.vocesEstudiantiles
              )}
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {voces.articulos.map((articulo) => (
                <article key={articulo.id} className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold">
                    <Link href={r.articulo(articulo.slug ?? '')} className="enlace-titular">
                      {articulo.titulo}
                    </Link>
                  </h3>
                  {articulo.subtitulo && <p className="opacity-90">{articulo.subtitulo}</p>}
                  <p className="font-ui text-[0.8125rem] opacity-90 [&_a]:text-inherit [&_span]:text-inherit">
                    {t.por} <Firmas autores={articulo.autores} locale={locale} t={t} />
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {loUltimo.length ? (
        <div className="contenedor grid gap-x-12 gap-y-12 lg:grid-cols-[2fr_1fr]">
          <section>
            <TituloDeBloque>{t.loUltimo}</TituloDeBloque>
            {loUltimo.map((articulo) => (
              <TarjetaArticulo
                key={articulo.id}
                articulo={articulo}
                locale={locale}
                t={t}
                variante="fila"
              />
            ))}
          </section>
          {leidas.length > 0 && (
            <section>
              <TituloDeBloque>{t.masLeidas}</TituloDeBloque>
              <ol className="flex flex-col gap-4">
                {leidas.map((articulo, i) => (
                  <li key={articulo.id} className="grid grid-cols-[2.25rem_1fr] items-start gap-2">
                    <span
                      className="font-display text-acento text-3xl leading-none font-bold tabular-nums"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <h3 className="font-texto text-[1.0625rem] leading-snug font-semibold">
                      <Link href={r.articulo(articulo.slug ?? '')} className="enlace-titular">
                        {articulo.titulo}
                      </Link>
                    </h3>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      ) : null}

      {filas.map(
        (fila) =>
          fila && (
            <section key={fila.categoria.id} className="contenedor">
              <TituloDeBloque
                href={fila.categoria.slug ? r.seccion(fila.categoria.slug) : undefined}
                verTodo={t.verTodo}
              >
                {fila.categoria.nombre}
              </TituloDeBloque>
              <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {fila.articulos.map((articulo) => (
                  <TarjetaArticulo key={articulo.id} articulo={articulo} locale={locale} t={t} />
                ))}
              </div>
            </section>
          ),
      )}
    </div>
  )
}
