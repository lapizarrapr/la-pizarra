import type { CollectionConfig } from 'payload'

import { cualquiera, editorOAdmin, personal } from '@/access'
import { impedirSiTieneArticulos } from '@/hooks/borrado'
import { revalidarAlBorrar, revalidarAlCambiar } from '@/hooks/revalidar'
import { campoSlug } from '@/fields/slug'

export const Categorias: CollectionConfig = {
  slug: 'categorias',
  labels: { singular: 'Sección', plural: 'Secciones' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'slug', 'orden'],
    group: 'Contenido',
    description: 'Las secciones del periódico. Cada una tiene su propia página.',
  },
  defaultSort: 'orden',
  access: {
    read: cualquiera,
    create: editorOAdmin,
    update: editorOAdmin,
    delete: editorOAdmin,
  },
  hooks: {
    afterChange: [revalidarAlCambiar('taxonomias')],
    beforeDelete: [impedirSiTieneArticulos('categoria', 'sección')],
    afterDelete: [revalidarAlBorrar('taxonomias')],
  },
  fields: [
    { name: 'nombre', type: 'text', label: 'Nombre', required: true, localized: true },
    campoSlug('nombre'),
    {
      name: 'descripcion',
      type: 'textarea',
      label: 'Descripción',
      localized: true,
      maxLength: 300,
      admin: { description: 'Aparece en la página de la sección y en buscadores.' },
    },
    {
      name: 'orden',
      type: 'number',
      label: 'Orden',
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description: 'Número menor aparece primero en el menú.',
      },
    },
  ],
}

export const Etiquetas: CollectionConfig = {
  slug: 'etiquetas',
  labels: { singular: 'Etiqueta', plural: 'Etiquetas' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'slug'],
    group: 'Contenido',
    description:
      'Temas libres para agrupar artículos (por ejemplo: "Ley 85", "Comedores escolares").',
  },
  defaultSort: 'nombre',
  access: {
    read: cualquiera,
    create: personal,
    update: editorOAdmin,
    delete: editorOAdmin,
  },
  hooks: {
    afterChange: [revalidarAlCambiar('taxonomias')],
    afterDelete: [revalidarAlBorrar('taxonomias')],
  },
  fields: [
    { name: 'nombre', type: 'text', label: 'Nombre', required: true, localized: true },
    campoSlug('nombre'),
  ],
}
