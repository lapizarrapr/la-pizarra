/**
 * Locale routing. Public pages live under app/(frontend)/[locale]/…, but the
 * default language (Spanish) is served without a prefix:
 *
 *   /seccion/opinion      → rendered by /es/seccion/opinion (rewrite)
 *   /es/seccion/opinion   → redirected to /seccion/opinion (one canonical URL)
 *
 * Keep this file dependency-free: it runs in front of every page request.
 */
import { NextResponse, type NextRequest } from 'next/server'

const LOCALES = ['es']
const PREDETERMINADO = 'es'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const primero = pathname.split('/')[1] ?? ''

  if (primero === PREDETERMINADO) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(PREDETERMINADO.length + 1) || '/'
    return NextResponse.redirect(url, 308)
  }

  if (LOCALES.includes(primero)) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${PREDETERMINADO}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Everything except the admin, APIs, Next internals, uploaded media, the
    // preview endpoint, feeds/metadata files, and anything with a file extension.
    '/((?!admin|api|_next|media|vista-previa|og/|feed\\.xml|sitemap\\.xml|robots\\.txt|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)',
  ],
}
