/**
 * Draft preview entry point, opened by the admin panel's "Vista previa".
 * Turns on Next.js draft mode (so the page shows the unpublished version)
 * only when BOTH are true: the link carries the preview secret, and the
 * browser is logged in to the admin as a member of the newsroom.
 */
import config from '@payload-config'
import { timingSafeEqual } from 'crypto'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { esPersonal, type UsuarioConRol } from '@/access/roles'

const iguales = (a: string, b: string): boolean => {
  const [x, y] = [Buffer.from(a), Buffer.from(b)]
  return x.length === y.length && timingSafeEqual(x, y)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const ruta = searchParams.get('ruta') ?? ''
  const secreto = searchParams.get('secreto') ?? ''
  const esperado = process.env.PREVIEW_SECRET ?? ''

  if (!esperado || !iguales(secreto, esperado)) {
    return new Response('Enlace de vista previa inválido.', { status: 401 })
  }
  // Same-site paths only: never redirect to another website.
  if (!/^\/(?!\/)[\w\-/]*$/.test(ruta)) {
    return new Response('Ruta inválida.', { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!esPersonal(user as UsuarioConRol)) {
    return new Response('Inicia sesión en el panel para ver borradores.', { status: 403 })
  }

  ;(await draftMode()).enable()
  redirect(ruta)
}
