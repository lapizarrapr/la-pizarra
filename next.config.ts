import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const desarrollo = process.env.NODE_ENV !== 'production'

/** "https://media.example.org/x" → "https://media.example.org" (or nothing if unset/invalid). */
const origenDe = (url: string | undefined): string[] => {
  try {
    return url ? [new URL(url).origin] : []
  } catch {
    return []
  }
}

const R2_PUBLICO = origenDe(process.env.R2_PUBLIC_URL)
const R2_SUBIDAS = origenDe(process.env.R2_ENDPOINT)
const TURNSTILE = 'https://challenges.cloudflare.com'
const ANALITICA = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'

const politica = (directivas: Record<string, string[]>): string =>
  Object.entries(directivas)
    .map(([nombre, valores]) => `${nombre} ${valores.join(' ')}`.trim())
    .join('; ')

/**
 * Content-Security-Policy for the public site: the browser may only load
 * scripts, frames, images and connections from this short list. Inline
 * scripts stay allowed because statically generated Next.js pages need them
 * (a per-request nonce would force every page to render on demand).
 */
const CSP_PUBLICA = politica({
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    TURNSTILE,
    ...(ANALITICA ? ['https://va.vercel-scripts.com'] : []),
    ...(desarrollo ? ["'unsafe-eval'"] : []),
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', ...R2_PUBLICO],
  'font-src': ["'self'"],
  'connect-src': ["'self'", ...(desarrollo ? ['ws:'] : [])],
  'frame-src': ['https://www.youtube-nocookie.com', TURNSTILE],
  'media-src': ["'self'", ...R2_PUBLICO],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  // Only our own admin (live preview) may show the site inside a frame.
  'frame-ancestors': ["'self'"],
  ...(desarrollo ? {} : { 'upgrade-insecure-requests': [] }),
})

/** The admin panel is a rich app (editor, uploads straight to storage), so its policy is wider. */
const CSP_ADMIN = politica({
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', ...R2_PUBLICO],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", ...R2_SUBIDAS, ...R2_PUBLICO, ...(desarrollo ? ['ws:'] : [])],
  'frame-src': ["'self'", 'https://www.youtube-nocookie.com'],
  'worker-src': ["'self'", 'blob:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
})

const CABECERAS_COMUNES = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  ...(desarrollo
    ? []
    : [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ]),
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  async headers() {
    return [
      { source: '/:path*', headers: CABECERAS_COMUNES },
      {
        // Everything except the admin panel and the APIs.
        source: '/((?!admin|api).*)',
        headers: [{ key: 'Content-Security-Policy', value: CSP_PUBLICA }],
      },
      { source: '/admin/:path*', headers: [{ key: 'Content-Security-Policy', value: CSP_ADMIN }] },
      {
        // Uploaded files are served as files only: never run as a page.
        source: '/api/media/file/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; style-src 'unsafe-inline'",
          },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
