import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import {
  actualizarAutores,
  campoEditorOAdmin,
  campoPersonal,
  campoVisibleSiNoEsMenor,
  cualquiera,
  editorOAdmin,
} from '@/access'
import { revalidarAlBorrar, revalidarAlCambiar } from '@/hooks/revalidar'
import { aIniciales, aSlug } from '@/lib/texto'

type DatosAutor = {
  nombre?: string | null
  apellido?: string | null
  seudonimo?: string | null
  usarSeudonimo?: boolean | null
  esMenorDeEdad?: boolean | null
  slug?: string | null
}

/**
 * The only name the public site ever shows.
 *  - Minor: pen name if given, otherwise initials. Never the real name.
 *  - Adult using a pen name: the pen name (initials if left empty).
 *  - Everyone else: first + last name.
 */
export const nombrePublicoDe = (autor: DatosAutor): string => {
  const seudonimo = autor.seudonimo?.trim()
  if (autor.esMenorDeEdad || autor.usarSeudonimo) {
    return seudonimo || aIniciales(autor.nombre, autor.apellido)
  }
  return [autor.nombre, autor.apellido]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(' ')
}

const calcularNombrePublico: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data) return data
  const completo: DatosAutor = { ...(originalDoc as DatosAutor | undefined), ...data }
  const nombrePublico = nombrePublicoDe(completo)
  data.nombrePublico = nombrePublico

  // For minors and pen names the URL must never contain the real name.
  const protegido = Boolean(completo.esMenorDeEdad || completo.usarSeudonimo)
  if (protegido || !completo.slug) data.slug = aSlug(nombrePublico)

  return data
}

export const Autores: CollectionConfig = {
  slug: 'autores',
  labels: { singular: 'Autor/a', plural: 'Autores' },
  admin: {
    useAsTitle: 'nombrePublico',
    defaultColumns: ['nombrePublico', 'etiquetaDeRol', 'esMenorDeEdad', 'usuario'],
    group: 'Redacción',
    description:
      'Perfiles públicos de quienes firman. Para estudiantes menores de edad, marca "Es menor de edad": el sitio nunca mostrará su apellido, foto ni redes.',
  },
  access: {
    read: cualquiera,
    create: editorOAdmin,
    update: actualizarAutores,
    delete: editorOAdmin,
  },
  hooks: {
    beforeValidate: [calcularNombrePublico],
    afterChange: [revalidarAlCambiar('autores')],
    afterDelete: [revalidarAlBorrar('autores')],
  },
  fields: [
    {
      name: 'nombrePublico',
      type: 'text',
      label: 'Nombre que verá el público',
      index: true,
      admin: {
        readOnly: true,
        description: 'Se calcula solo al guardar, según las opciones de abajo.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre',
          required: true,
          access: { read: campoVisibleSiNoEsMenor },
        },
        {
          name: 'apellido',
          type: 'text',
          label: 'Apellido(s)',
          access: { read: campoVisibleSiNoEsMenor },
        },
      ],
    },
    {
      name: 'esMenorDeEdad',
      type: 'checkbox',
      label: 'Es menor de edad',
      defaultValue: false,
      access: { read: campoPersonal, create: campoEditorOAdmin, update: campoEditorOAdmin },
      admin: {
        description:
          'Protege a estudiantes: firma solo con seudónimo o iniciales y oculta apellido, foto y redes del sitio público.',
      },
    },
    {
      name: 'usarSeudonimo',
      type: 'checkbox',
      label: 'Firmar con seudónimo',
      defaultValue: false,
      access: { read: campoPersonal },
      admin: { condition: (datos) => !datos?.esMenorDeEdad },
    },
    {
      name: 'seudonimo',
      type: 'text',
      label: 'Seudónimo',
      access: { read: campoPersonal },
      admin: {
        condition: (datos) => Boolean(datos?.esMenorDeEdad || datos?.usarSeudonimo),
        description: 'Si lo dejas vacío, se usarán las iniciales.',
      },
    },
    {
      name: 'etiquetaDeRol',
      type: 'text',
      label: 'Descripción breve',
      localized: true,
      admin: {
        description:
          'Ejemplo: "Maestra de Ciencias, Bayamón". Para menores, evita datos que permitan identificarles (escuela, grupo, pueblo pequeño).',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biografía',
      localized: true,
      maxLength: 600,
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto',
      access: { read: campoVisibleSiNoEsMenor },
      admin: { condition: (datos) => !datos?.esMenorDeEdad },
    },
    {
      name: 'redes',
      type: 'array',
      label: 'Redes sociales',
      labels: { singular: 'Red', plural: 'Redes' },
      access: { read: campoVisibleSiNoEsMenor },
      admin: { condition: (datos) => !datos?.esMenorDeEdad },
      fields: [
        {
          name: 'plataforma',
          type: 'select',
          label: 'Plataforma',
          required: true,
          options: [
            { label: 'X (Twitter)', value: 'x' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Threads', value: 'threads' },
            { label: 'Bluesky', value: 'bluesky' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Página web', value: 'web' },
          ],
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
    {
      name: 'usuario',
      type: 'relationship',
      relationTo: 'usuarios',
      label: 'Cuenta de usuario',
      unique: true,
      access: { read: campoPersonal, create: campoEditorOAdmin, update: campoEditorOAdmin },
      admin: {
        position: 'sidebar',
        description: 'Cuenta con la que esta persona entra al panel (si tiene una).',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Dirección (URL)',
      index: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description:
          'Se genera sola. Con seudónimo o menores, siempre sale del nombre público, nunca del nombre real.',
      },
    },
  ],
}
