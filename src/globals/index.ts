import type { Field, GlobalConfig } from 'payload'

import { cualquiera, editorOAdmin } from '@/access'
import { revalidarGlobal } from '@/hooks/revalidar'

const enlaceValido = (valor: unknown): string | true =>
  typeof valor === 'string' && /^(\/(?!\/)|https:\/\/|mailto:)\S*$/.test(valor.trim())
    ? true
    : 'Usa una ruta interna que empiece con / o un enlace que empiece con https://'

const camposDeEnlace: Field[] = [
  { name: 'etiqueta', type: 'text', label: 'Texto', required: true, localized: true },
  {
    name: 'enlace',
    type: 'text',
    label: 'Enlace',
    required: true,
    admin: { description: 'Ejemplos: /seccion/opinion, /sobre-nosotros, https://…' },
    validate: enlaceValido,
  },
]

const REDES = [
  { label: 'WhatsApp (canal)', value: 'whatsapp' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'X (Twitter)', value: 'x' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Threads', value: 'threads' },
  { label: 'Bluesky', value: 'bluesky' },
]

export const Ajustes: GlobalConfig = {
  slug: 'ajustes',
  label: 'Ajustes del sitio',
  admin: { group: 'Sitio', description: 'Nombre, lema, logo, redes y cintillo de última hora.' },
  access: { read: cualquiera, update: editorOAdmin },
  hooks: { afterChange: [revalidarGlobal('globales')] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad',
          fields: [
            {
              name: 'nombre',
              type: 'text',
              label: 'Nombre del sitio',
              required: true,
              defaultValue: 'La Pizarra',
            },
            {
              name: 'lema',
              type: 'text',
              label: 'Lema',
              localized: true,
              defaultValue: 'Periodismo desde el salón de clases',
            },
            {
              name: 'descripcion',
              type: 'textarea',
              label: 'Descripción para buscadores y redes',
              localized: true,
              maxLength: 200,
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
              admin: { description: 'Opcional. Si no hay logo se muestra el nombre en texto.' },
            },
            {
              name: 'redes',
              type: 'array',
              label: 'Redes sociales',
              labels: { singular: 'Red', plural: 'Redes' },
              fields: [
                {
                  name: 'plataforma',
                  type: 'select',
                  label: 'Plataforma',
                  required: true,
                  options: REDES,
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Enlace',
                  required: true,
                  validate: (valor: unknown) =>
                    typeof valor === 'string' && /^https:\/\/\S+$/.test(valor.trim())
                      ? true
                      : 'Escribe un enlace completo que empiece con https://',
                },
              ],
            },
          ],
        },
        {
          label: 'Última hora',
          fields: [
            {
              name: 'cintillo',
              type: 'group',
              label: 'Cintillo de última hora',
              fields: [
                {
                  name: 'activo',
                  type: 'checkbox',
                  label: 'Mostrar cintillo',
                  defaultValue: false,
                },
                {
                  name: 'texto',
                  type: 'text',
                  label: 'Texto',
                  localized: true,
                  maxLength: 140,
                  admin: { condition: (_, hermanos) => Boolean(hermanos?.activo) },
                },
                {
                  name: 'articulo',
                  type: 'relationship',
                  relationTo: 'articulos',
                  label: 'Artículo enlazado',
                  admin: {
                    condition: (_, hermanos) => Boolean(hermanos?.activo),
                    description: 'Opcional. El cintillo llevará a este artículo.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const Navegacion: GlobalConfig = {
  slug: 'navegacion',
  label: 'Menús',
  admin: { group: 'Sitio', description: 'Menú principal y pie de página.' },
  access: { read: cualquiera, update: editorOAdmin },
  hooks: { afterChange: [revalidarGlobal('globales')] },
  fields: [
    {
      name: 'principal',
      type: 'array',
      label: 'Menú principal',
      labels: { singular: 'Enlace', plural: 'Enlaces' },
      maxRows: 12,
      fields: camposDeEnlace,
    },
    {
      name: 'pie',
      type: 'array',
      label: 'Columnas del pie de página',
      labels: { singular: 'Columna', plural: 'Columnas' },
      maxRows: 4,
      fields: [
        { name: 'titulo', type: 'text', label: 'Título', required: true, localized: true },
        {
          name: 'enlaces',
          type: 'array',
          label: 'Enlaces',
          labels: { singular: 'Enlace', plural: 'Enlaces' },
          fields: camposDeEnlace,
        },
      ],
    },
    {
      name: 'textoLegal',
      type: 'text',
      label: 'Texto legal del pie',
      localized: true,
      admin: {
        description: 'Ejemplo: "© La Pizarra. Hecho por maestras, maestros y estudiantes."',
      },
    },
  ],
}

export const Portada: GlobalConfig = {
  slug: 'portada',
  label: 'Portada',
  admin: {
    group: 'Sitio',
    description:
      'Decide qué aparece en la página principal. Lo que dejes vacío se llena solo con los artículos destacados y más recientes.',
  },
  access: { read: cualquiera, update: editorOAdmin },
  hooks: { afterChange: [revalidarGlobal('globales')] },
  fields: [
    {
      name: 'principal',
      type: 'relationship',
      relationTo: 'articulos',
      label: 'Noticia principal',
      admin: { description: 'El titular grande de arriba.' },
    },
    {
      name: 'secundarias',
      type: 'relationship',
      relationTo: 'articulos',
      hasMany: true,
      maxRows: 6,
      label: 'Noticias destacadas',
      admin: { description: 'Hasta 6, en el orden en que quieres que aparezcan.' },
    },
    {
      name: 'secciones',
      type: 'relationship',
      relationTo: 'categorias',
      hasMany: true,
      label: 'Filas por sección',
      admin: { description: 'Secciones que tienen su propia fila en la portada, en orden.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'mostrarOpinion',
          type: 'checkbox',
          label: 'Mostrar columna de Opinión',
          defaultValue: true,
        },
        {
          name: 'mostrarVocesEstudiantiles',
          type: 'checkbox',
          label: 'Mostrar Voces Estudiantiles',
          defaultValue: true,
        },
        {
          name: 'mostrarMasLeidas',
          type: 'checkbox',
          label: 'Mostrar Más leídas',
          defaultValue: true,
        },
      ],
    },
  ],
}
