import type { Block, CollectionConfig } from 'payload'

import { editorOAdmin, publicadoOPersonal } from '@/access'
import { revalidarAlBorrar, revalidarAlCambiar } from '@/hooks/revalidar'
import { campoSlug } from '@/fields/slug'

const TextoEnriquecido: Block = {
  slug: 'texto',
  labels: { singular: 'Texto', plural: 'Bloques de texto' },
  fields: [
    { name: 'contenido', type: 'richText', label: 'Contenido', required: true, localized: true },
  ],
}

const LlamadaALaAccion: Block = {
  slug: 'llamada',
  labels: { singular: 'Llamada a la acción', plural: 'Llamadas a la acción' },
  fields: [
    { name: 'titulo', type: 'text', label: 'Título', required: true, localized: true },
    { name: 'texto', type: 'textarea', label: 'Texto', localized: true },
    {
      name: 'etiquetaBoton',
      type: 'text',
      label: 'Texto del botón',
      required: true,
      localized: true,
    },
    {
      name: 'enlace',
      type: 'text',
      label: 'Enlace del botón',
      required: true,
      admin: {
        description: 'Página interna (por ejemplo /contacto) o enlace completo con https://',
      },
      validate: (valor: unknown) =>
        typeof valor === 'string' && /^(\/(?!\/)|https:\/\/|mailto:)\S*$/.test(valor.trim())
          ? true
          : 'Usa una ruta interna que empiece con / o un enlace que empiece con https://',
    },
  ],
}

const Imagen: Block = {
  slug: 'imagen',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  fields: [
    { name: 'imagen', type: 'upload', relationTo: 'media', label: 'Imagen', required: true },
    { name: 'leyenda', type: 'text', label: 'Pie de foto', localized: true },
  ],
}

const Formulario: Block = {
  slug: 'formulario',
  labels: { singular: 'Formulario', plural: 'Formularios' },
  fields: [
    {
      name: 'tipo',
      type: 'select',
      label: 'Formulario',
      required: true,
      defaultValue: 'contacto',
      options: [
        { label: 'Contacto', value: 'contacto' },
        { label: 'Envía tu historia', value: 'historia' },
        { label: 'Suscripción al boletín', value: 'boletin' },
      ],
    },
    { name: 'titulo', type: 'text', label: 'Título', localized: true },
  ],
}

const Preguntas: Block = {
  slug: 'preguntas',
  labels: { singular: 'Preguntas frecuentes', plural: 'Preguntas frecuentes' },
  fields: [
    { name: 'titulo', type: 'text', label: 'Título', localized: true },
    {
      name: 'items',
      type: 'array',
      label: 'Preguntas',
      labels: { singular: 'Pregunta', plural: 'Preguntas' },
      minRows: 1,
      fields: [
        { name: 'pregunta', type: 'text', label: 'Pregunta', required: true, localized: true },
        {
          name: 'respuesta',
          type: 'textarea',
          label: 'Respuesta',
          required: true,
          localized: true,
        },
      ],
    },
  ],
}

export const Paginas: CollectionConfig = {
  slug: 'paginas',
  labels: { singular: 'Página', plural: 'Páginas' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'slug', '_status', 'updatedAt'],
    group: 'Sitio',
    description:
      'Páginas fijas: Sobre Nosotros, Política Editorial, Contacto, Cómo Colaborar, Privacidad.',
  },
  access: {
    read: publicadoOPersonal,
    create: editorOAdmin,
    update: editorOAdmin,
    delete: editorOAdmin,
    readVersions: editorOAdmin,
  },
  hooks: {
    afterChange: [revalidarAlCambiar('paginas')],
    afterDelete: [revalidarAlBorrar('paginas')],
  },
  versions: { maxPerDoc: 25, drafts: { autosave: { interval: 2000, showSaveDraftButton: true } } },
  fields: [
    { name: 'titulo', type: 'text', label: 'Título', required: true, localized: true },
    campoSlug('titulo'),
    {
      name: 'introduccion',
      type: 'textarea',
      label: 'Introducción',
      localized: true,
      maxLength: 300,
    },
    {
      name: 'bloques',
      type: 'blocks',
      label: 'Contenido',
      labels: { singular: 'Bloque', plural: 'Bloques' },
      blocks: [TextoEnriquecido, LlamadaALaAccion, Imagen, Formulario, Preguntas],
    },
  ],
}
