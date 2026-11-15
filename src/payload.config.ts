import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Articulos } from './collections/Articulos'
import { Autores } from './collections/Autores'
import { Mensajes, Suscriptores, Vistas } from './collections/Buzon'
import { Media } from './collections/Media'
import { Paginas } from './collections/Paginas'
import { Categorias, Etiquetas } from './collections/Taxonomias'
import { Usuarios } from './collections/Usuarios'
import { Ajustes, Navegacion, Portada } from './globals'
import { ZONA_HORARIA } from './lib/fechas'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SITIO = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const usarR2 = Boolean(process.env.R2_BUCKET)

export default buildConfig({
  admin: {
    user: Usuarios.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · La Pizarra' },
    dateFormat: "d 'de' MMMM 'de' yyyy, h:mm aaaa",
    timezones: {
      defaultTimezone: ZONA_HORARIA,
      supportedTimezones: [{ label: 'Puerto Rico (AST)', value: ZONA_HORARIA }],
    },
  },

  // Admin panel language. Spanish first; English stays available per user.
  i18n: {
    supportedLanguages: { es, en },
    fallbackLanguage: 'es',
  },

  // Content language. Only Spanish for now; adding { code: 'en' } later
  // enables translations for every field marked `localized: true`.
  localization: {
    locales: [{ code: 'es', label: 'Español' }],
    defaultLocale: 'es',
    fallback: true,
  },

  collections: [
    Articulos,
    Categorias,
    Etiquetas,
    Media,
    Paginas,
    Autores,
    Usuarios,
    Mensajes,
    Suscriptores,
    Vistas,
  ],
  globals: [Portada, Ajustes, Navegacion],

  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      // h1 is reserved for the article headline.
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      FixedToolbarFeature(),
    ],
  }),

  secret: process.env.PAYLOAD_SECRET || '',
  csrf: [SITIO],
  cors: [SITIO],
  upload: { limits: { fileSize: 12 * 1024 * 1024 } },

  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),

  // Scheduled publishing runs as a queued job. On Vercel nothing runs in the
  // background, so a timer (GitHub Actions) calls GET /api/payload-jobs/run
  // with `Authorization: Bearer <CRON_SECRET>`.
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        const usuario = req.user as { rol?: string } | null
        if (usuario?.rol === 'admin' || usuario?.rol === 'editor') return true
        const secreto = process.env.CRON_SECRET
        if (!secreto) return false
        return req.headers.get('authorization') === `Bearer ${secreto}`
      },
    },
  },

  sharp,

  plugins: [
    seoPlugin({
      collections: ['articulos', 'paginas'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${(doc as { titulo?: string })?.titulo ?? ''} | La Pizarra`,
      generateDescription: ({ doc }) =>
        (doc as { subtitulo?: string; introduccion?: string })?.subtitulo ??
        (doc as { introduccion?: string })?.introduccion ??
        '',
      generateURL: ({ doc, collectionSlug }) => {
        const slug = (doc as { slug?: string })?.slug ?? ''
        return collectionSlug === 'articulos' ? `${SITIO}/articulo/${slug}` : `${SITIO}/${slug}`
      },
    }),
    s3Storage({
      enabled: usarR2,
      bucket: process.env.R2_BUCKET || '',
      clientUploads: true,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${process.env.R2_PUBLIC_URL}/${prefix ? `${prefix}/` : ''}${filename}`,
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: true,
      },
    }),
  ],
})
