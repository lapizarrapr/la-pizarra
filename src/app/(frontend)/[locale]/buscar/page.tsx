import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Paginacion, TarjetaArticulo } from '@/components/articulos'
import { articulosEnOrden, POR_PAGINA } from '@/lib/datos'
import { diccionario, esLocale } from '@/lib/i18n'
import { rutas } from '@/lib/rutas'
import { LARGO_MAXIMO_DE_CONSULTA, limpiarConsulta, proveedorDeBusqueda } from '@/lib/search'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string | string[]; pagina?: string | string[] }>
}

const primero = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: diccionario(locale).buscar,
    // Result pages are endless combinations; keep them out of search engines.
    robots: { index: false, follow: true },
  }
}

export default async function PaginaDeBusqueda({ params, searchParams }: Props) {
  const { locale } = await params
  if (!esLocale(locale)) notFound()
  const t = diccionario(locale)
  const r = rutas(locale)

  const consulta = await searchParams
  const q = limpiarConsulta(primero(consulta.q))
  const paginaTexto = primero(consulta.pagina) ?? '1'
  const pagina = /^[1-9]\d{0,3}$/.test(paginaTexto) ? Number(paginaTexto) : 1

  const resultado = q
    ? await proveedorDeBusqueda().buscar({ texto: q, locale, pagina, porPagina: POR_PAGINA })
    : null
  // Loaded through the normal public path, so only published articles can appear.
  const articulos = resultado ? await articulosEnOrden(resultado.ids, locale) : []
  const paginas = resultado ? Math.ceil(resultado.total / POR_PAGINA) : 0

  return (
    <div className="contenedor pt-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <h1 className="text-[clamp(2rem,6vw,3rem)] font-extrabold">{t.buscarEnLaPizarra}</h1>

        <form action={r.buscar()} method="get" role="search" className="flex gap-2">
          <label htmlFor="q" className="sr-only">
            {t.buscarEnLaPizarra}
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={LARGO_MAXIMO_DE_CONSULTA}
            placeholder={t.buscarMarcador}
            autoComplete="off"
            enterKeyHint="search"
            required
            className="border-tinta bg-fondo font-ui placeholder:text-gris min-w-0 flex-1 rounded-full border px-5 py-3 text-base"
          />
          <button
            type="submit"
            className="bg-pizarra text-tiza font-ui rounded-full px-6 py-3 text-sm font-bold"
          >
            {t.buscar}
          </button>
        </form>

        {resultado && (
          <p className="meta" role="status">
            {resultado.total > 0 ? t.resultadosPara(resultado.total, q) : t.sinResultados(q)}
          </p>
        )}

        {resultado && resultado.total === 0 && <p className="text-gris">{t.consejoBusqueda}</p>}

        {articulos.length > 0 && (
          <div>
            {articulos.map((articulo) => (
              <TarjetaArticulo
                key={articulo.id}
                articulo={articulo}
                locale={locale}
                t={t}
                variante="fila"
                nivel="h2"
                mostrarBajada
              />
            ))}
          </div>
        )}

        <Paginacion pagina={pagina} paginas={paginas} hrefDe={(n) => r.buscar(q, n)} t={t} />
      </div>
    </div>
  )
}
