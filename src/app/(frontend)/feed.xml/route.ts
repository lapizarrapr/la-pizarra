import { listarArticulos, obtenerAjustes } from '@/lib/datos'
import { construirFeed } from '@/lib/feed'
import { LOCALE_PREDETERMINADO } from '@/lib/i18n'

export async function GET() {
  const locale = LOCALE_PREDETERMINADO
  const [ajustes, { articulos }] = await Promise.all([
    obtenerAjustes(locale),
    listarArticulos({ limite: 30 }, locale),
  ])
  return construirFeed({
    titulo: ajustes.nombre,
    descripcion: ajustes.descripcion ?? ajustes.lema ?? ajustes.nombre,
    ruta: '/',
    rutaDelFeed: '/feed.xml',
    articulos,
    locale,
  })
}
