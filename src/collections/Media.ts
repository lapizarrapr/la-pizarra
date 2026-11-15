import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { revalidarAlCambiar } from '@/hooks/revalidar'
import { actualizarMedia, campoSoloAdmin, cualquiera, editorOAdmin, personal } from '@/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const webp = { format: 'webp' as const, options: { quality: 80 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  admin: {
    group: 'Contenido',
    defaultColumns: ['filename', 'alt', 'credito', 'updatedAt'],
    description:
      'Fotos e ilustraciones. Toda imagen necesita texto alternativo. No subas fotos de estudiantes sin autorización escrita de su familia.',
  },
  access: {
    read: cualquiera,
    create: personal,
    update: actualizarMedia,
    delete: editorOAdmin,
  },
  hooks: {
    afterChange: [revalidarAlCambiar('articulos')],
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user) data.subidoPor = req.user.id
        return data
      },
    ],
  },
  upload: {
    // Local disk in development. In production the S3 adapter (Cloudflare R2)
    // takes over; see payload.config.ts.
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
    focalPoint: true,
    crop: true,
    adminThumbnail: 'pequena',
    // Cap the stored original so phone photos don't fill the storage bucket.
    resizeOptions: { width: 2400, withoutEnlargement: true },
    formatOptions: webp,
    imageSizes: [
      { name: 'pequena', width: 400, withoutEnlargement: true, formatOptions: webp },
      { name: 'mediana', width: 800, withoutEnlargement: true, formatOptions: webp },
      { name: 'grande', width: 1200, withoutEnlargement: true, formatOptions: webp },
      { name: 'enorme', width: 1600, withoutEnlargement: true, formatOptions: webp },
      {
        // Social sharing card (WhatsApp, Facebook, X). JPEG for compatibility.
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: { format: 'jpeg', options: { quality: 82 } },
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      required: true,
      localized: true,
      admin: {
        description:
          'Describe lo que se ve, para quienes usan lector de pantalla. Ejemplo: "Maestras marchan frente al Capitolio con pancartas".',
      },
    },
    {
      name: 'credito',
      type: 'text',
      label: 'Crédito de la foto',
      admin: { description: 'Quién tomó la foto o de dónde viene. Ejemplo: "Foto: Ana Rivera".' },
    },
    {
      name: 'leyenda',
      type: 'text',
      label: 'Pie de foto',
      localized: true,
    },
    {
      name: 'subidoPor',
      type: 'relationship',
      relationTo: 'usuarios',
      label: 'Subida por',
      access: {
        read: ({ req }) => Boolean(req.user),
        create: campoSoloAdmin,
        update: campoSoloAdmin,
      },
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
