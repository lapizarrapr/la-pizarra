import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { mesesDeArchivo } from '@/lib/datos'
import { absoluta, rutas } from '@/lib/rutas'

// Rebuilt at most every 10 minutes; search engines don't need it fresher.
export const revalidate = 600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const r = rutas()

  // Read as an anonymous visitor: only published, public documents are listed.
  const todos = async (
    collection: 'articulos' | 'categorias' | 'etiquetas' | 'autores' | 'paginas',
  ) =>
    (
      await payload.find({
        collection,
        limit: 5000,
        depth: 0,
        pagination: false,
        select: { slug: true, updatedAt: true },
        overrideAccess: false,
      })
    ).docs.filter((doc) => Boolean(doc.slug)) as { slug: string; updatedAt: string }[]

  const [articulos, categorias, etiquetas, autores, paginas, meses] = await Promise.all([
    todos('articulos'),
    todos('categorias'),
    todos('etiquetas'),
    todos('autores'),
    todos('paginas'),
    mesesDeArchivo(),
  ])

  const entrada = (
    ruta: string,
    fecha?: string,
    prioridad = 0.5,
  ): MetadataRoute.Sitemap[number] => ({
    url: absoluta(ruta),
    lastModified: fecha ? new Date(fecha) : undefined,
    priority: prioridad,
  })

  return [
    entrada(r.portada(), articulos[0]?.updatedAt, 1),
    ...articulos.map((a) => entrada(r.articulo(a.slug), a.updatedAt, 0.8)),
    ...categorias.map((c) => entrada(r.seccion(c.slug), undefined, 0.7)),
    ...paginas.map((p) => entrada(r.pagina(p.slug), p.updatedAt, 0.4)),
    ...autores.map((a) => entrada(r.autor(a.slug), undefined, 0.3)),
    ...etiquetas.map((e) => entrada(r.etiqueta(e.slug), undefined, 0.3)),
    entrada(r.archivo(), undefined, 0.3),
    ...meses.map((m) => entrada(r.mes(m.anio, m.mes), undefined, 0.2)),
  ]
}
