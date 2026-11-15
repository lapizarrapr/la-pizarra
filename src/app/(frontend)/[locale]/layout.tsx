import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter, Newsreader } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { Cabecera, Cintillo, Pie } from '@/components/sitio'
import { obtenerAjustes, obtenerNavegacion } from '@/lib/datos'
import { diccionario, esLocale, LOCALES } from '@/lib/i18n'
import { SITIO } from '@/lib/rutas'
import { GUION_TEMA } from '@/lib/tema'

import '../globals.css'

// Self-hosted at build time: no request to Google from the reader's browser.
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
})
// Inter is only used for small labels, so it is not preloaded: on a slow phone
// connection the headline font and the lead photo get the bandwidth first.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
})

type Props = { children: ReactNode; params: Promise<{ locale: string }> }

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }))

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params
  if (!esLocale(locale)) return {}
  const ajustes = await obtenerAjustes(locale)
  return {
    metadataBase: new URL(SITIO),
    title: { default: ajustes.nombre, template: `%s | ${ajustes.nombre}` },
    description: ajustes.descripcion ?? undefined,
    applicationName: ajustes.nombre,
    alternates: {
      types: { 'application/rss+xml': [{ url: '/feed.xml', title: ajustes.nombre }] },
    },
    openGraph: {
      siteName: ajustes.nombre,
      locale: 'es_PR',
      type: 'website',
      images: [{ url: '/og/sitio', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1c3b33' },
    { media: '(prefers-color-scheme: dark)', color: '#17362e' },
  ],
}

export default async function LayoutPublico({ children, params }: Props) {
  const { locale } = await params
  if (!esLocale(locale)) notFound()

  const t = diccionario(locale)
  const [ajustes, navegacion] = await Promise.all([
    obtenerAjustes(locale),
    obtenerNavegacion(locale),
  ])

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${newsreader.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: GUION_TEMA }} />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#contenido"
          className="bg-alerta text-alerta-tinta font-ui sr-only z-50 rounded px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {t.saltarAlContenido}
        </a>
        <Cabecera ajustes={ajustes} navegacion={navegacion} locale={locale} t={t} />
        <Cintillo ajustes={ajustes} locale={locale} t={t} />
        <main id="contenido" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Pie ajustes={ajustes} navegacion={navegacion} locale={locale} t={t} />
        {/* Cookie-less page-view counts. Off unless NEXT_PUBLIC_ANALYTICS_ENABLED=true. */}
        {process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' && <Analytics />}
      </body>
    </html>
  )
}
