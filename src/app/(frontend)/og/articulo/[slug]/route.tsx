import { articuloPorSlug, poblado } from '@/lib/datos'
import { tarjetaSocial } from '@/lib/tarjetaSocial'
import type { Categoria } from '@/payload-types'

type Contexto = { params: Promise<{ slug: string }> }

// Published articles only: `articuloPorSlug` reads as an anonymous visitor.
export async function GET(_request: Request, { params }: Contexto) {
  const { slug } = await params
  const articulo = /^[a-z0-9-]{1,120}$/.test(slug) ? await articuloPorSlug(slug) : null
  if (!articulo) return new Response('No encontrado', { status: 404 })

  return tarjetaSocial({
    titular: articulo.titulo,
    antetitulo: poblado<Categoria>(articulo.categoria)?.nombre,
  })
}
