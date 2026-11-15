/** Public URL builders. One place to change if the URL scheme ever changes. */
import { LOCALE_PREDETERMINADO } from './i18n'

export const SITIO = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
)

const prefijo = (locale: string) => (locale === LOCALE_PREDETERMINADO ? '' : `/${locale}`)
const conPagina = (base: string, pagina = 1) => (pagina > 1 ? `${base}/pagina/${pagina}` : base)

export const rutas = (locale: string = LOCALE_PREDETERMINADO) => {
  const p = prefijo(locale)
  return {
    portada: () => p || '/',
    articulo: (slug: string) => `${p}/articulo/${slug}`,
    seccion: (slug: string, pagina?: number) => conPagina(`${p}/seccion/${slug}`, pagina),
    etiqueta: (slug: string, pagina?: number) => conPagina(`${p}/etiqueta/${slug}`, pagina),
    autor: (slug: string, pagina?: number) => conPagina(`${p}/autor/${slug}`, pagina),
    pagina: (slug: string) => `${p}/${slug}`,
    /** Editor-entered links: internal paths get the locale prefix, others pass through. */
    libre: (enlace: string) => (enlace.startsWith('/') ? `${p}${enlace}` : enlace),
  }
}

export const absoluta = (ruta: string) => `${SITIO}${ruta === '/' ? '' : ruta}`
