import { categoriaPorSlug, listarArticulos, obtenerAjustes } from '@/lib/datos'
import { construirFeed } from '@/lib/feed'
import { LOCALE_PREDETERMINADO } from '@/lib/i18n'
import { rutas } from '@/lib/rutas'

type Contexto = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Contexto) {
  const { slug } = await params
  const locale = LOCALE_PREDETERMINADO
  const categoria = /^[a-z0-9-]{1,120}$/.test(slug) ? await categoriaPorSlug(slug, locale) : null
  if (!categoria) return new Response('No encontrado', { status: 404 })

  const [ajustes, { articulos }] = await Promise.all([
    obtenerAjustes(locale),
    listarArticulos({ categoria: categoria.id, limite: 30 }, locale),
  ])
  const ruta = rutas(locale).seccion(slug)
  return construirFeed({
    titulo: `${categoria.nombre} | ${ajustes.nombre}`,
    descripcion: categoria.descripcion ?? categoria.nombre,
    ruta,
    rutaDelFeed: `${ruta}/feed.xml`,
    articulos,
    locale,
  })
}
