import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionBeforeChangeHook,
  type CollectionConfig,
} from 'payload'

import {
  actualizarArticulos,
  campoEditorOAdmin,
  campoPersonal,
  campoSoloAdmin,
  crearArticulos,
  editorOAdmin,
  leerArticulos,
  leerVersionesArticulos,
} from '@/access'
import { esColaborador, type Rol, type UsuarioConRol } from '@/access/roles'
import { BLOQUES_DEL_EDITOR } from '@/blocks/editor'
import { OPCIONES_MUNICIPIOS } from '@/fields/municipios'
import { campoSlug } from '@/fields/slug'
import {
  ESTADOS,
  ESTADOS_DE_COLABORADOR,
  ETIQUETAS_ESTADO,
  resolverFlujo,
  type Estado,
  type Status,
} from '@/hooks/flujoEditorial'
import { revalidarAlBorrar, revalidarAlCambiar } from '@/hooks/revalidar'
import { textoDesdeLexical, tiempoDeLectura } from '@/lib/texto'

export const TIPOS_DE_ARTICULO = [
  { label: 'Noticia', value: 'noticia' },
  { label: 'Reportaje', value: 'reportaje' },
  { label: 'Opinión', value: 'opinion' },
  { label: 'Entrevista', value: 'entrevista' },
  { label: 'Carta de estudiante', value: 'carta_estudiante' },
] as const

type DatosArticulo = {
  _status?: Status | null
  estadoEditorial?: Estado | null
  cuerpo?: unknown
  fechaPublicacion?: string | null
  fechaActualizacion?: string | null
  creadoPor?: unknown
  autores?: unknown[] | null
}

/** Applies the workflow rules and fills in the computed fields. */
const aplicarFlujoEditorial: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  const datos = data as DatosArticulo
  const previo = originalDoc as DatosArticulo | undefined
  const usuario = req.user as UsuarioConRol

  const resultado = resolverFlujo({
    rol: (usuario?.rol as Rol | undefined) ?? 'sistema',
    estadoSolicitado: datos.estadoEditorial,
    estadoPrevio: previo?.estadoEditorial,
    statusSolicitado: datos._status,
    statusPrevio: previo?._status,
  })
  if (!resultado.ok) throw new APIError(resultado.motivo, 403)

  datos._status = resultado.status
  datos.estadoEditorial = resultado.estado

  const ahora = new Date().toISOString()
  if (resultado.status === 'published') {
    const fechaPublicacion = datos.fechaPublicacion ?? previo?.fechaPublicacion
    if (!fechaPublicacion) {
      datos.fechaPublicacion = ahora
    } else if (previo?._status === 'published' && req.context?.sinFechaActualizacion !== true) {
      // Re-publishing an article that was already live marks it as updated.
      datos.fechaActualizacion = ahora
    }
  }

  if (operation === 'create') {
    if (usuario) datos.creadoPor = usuario.id

    // A writer's new article is signed with their own author profile by default.
    if (usuario && (!datos.autores || datos.autores.length === 0)) {
      const perfiles = await req.payload.find({
        collection: 'autores',
        where: { usuario: { equals: usuario.id } },
        depth: 0,
        limit: 1,
        req,
      })
      if (perfiles.docs[0]) datos.autores = [perfiles.docs[0].id]
    }
  }

  if (datos.cuerpo !== undefined) {
    const texto = textoDesdeLexical(datos.cuerpo)
    data.textoPlano = texto
    data.tiempoDeLectura = tiempoDeLectura(texto)
  }

  return data
}

/**
 * "Guardar borrador" only writes a new version, so choosing "Archivado" on a
 * live article would leave it public. This takes it down for real.
 */
const retirarSiSeArchiva: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (context?.archivando || doc?.estadoEditorial !== 'archivado') return doc

  const publicado = await req.payload.find({
    collection: 'articulos',
    where: { and: [{ id: { equals: doc.id } }, { _status: { equals: 'published' } }] },
    depth: 0,
    limit: 1,
    draft: false,
    req,
  })
  if (publicado.totalDocs > 0) {
    await req.payload.update({
      collection: 'articulos',
      id: doc.id,
      data: { _status: 'draft', estadoEditorial: 'archivado' },
      context: { archivando: true },
      depth: 0,
      req,
    })
  }
  return doc
}

export const Articulos: CollectionConfig = {
  slug: 'articulos',
  labels: { singular: 'Artículo', plural: 'Artículos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'estadoEditorial', 'categoria', 'autores', 'fechaPublicacion'],
    group: 'Contenido',
    listSearchableFields: ['titulo', 'subtitulo', 'slug'],
    description:
      'Noticias, reportajes, opinión y cartas. Quienes colaboran guardan borradores y los envían a revisión; la redacción publica.',
  },
  defaultSort: '-updatedAt',
  access: {
    read: leerArticulos,
    create: crearArticulos,
    update: actualizarArticulos,
    delete: editorOAdmin,
    readVersions: leerVersionesArticulos,
  },
  versions: {
    maxPerDoc: 50,
    drafts: {
      autosave: { interval: 2000, showSaveDraftButton: true },
      schedulePublish: true,
      validate: false,
    },
  },
  hooks: {
    beforeChange: [aplicarFlujoEditorial],
    afterChange: [retirarSiSeArchiva, revalidarAlCambiar('articulos')],
    afterDelete: [revalidarAlBorrar('articulos')],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenido',
          fields: [
            {
              name: 'titulo',
              type: 'text',
              label: 'Título',
              required: true,
              localized: true,
              maxLength: 160,
            },
            {
              name: 'subtitulo',
              type: 'textarea',
              label: 'Bajada (subtítulo)',
              localized: true,
              maxLength: 300,
              admin: {
                description: 'Una o dos oraciones que resumen la nota. Aparece bajo el título.',
              },
            },
            {
              name: 'imagenDestacada',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagen principal',
              admin: {
                description:
                  'El texto alternativo y el crédito se escriben al subir la imagen. Si la foto muestra estudiantes, confirma que hay autorización.',
              },
            },
            {
              name: 'leyendaImagen',
              type: 'text',
              label: 'Pie de foto',
              localized: true,
              admin: {
                description: 'Opcional. Si lo dejas vacío se usa el pie guardado con la imagen.',
              },
            },
            {
              name: 'cuerpo',
              type: 'richText',
              label: 'Texto',
              required: true,
              localized: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  BlocksFeature({ blocks: BLOQUES_DEL_EDITOR }),
                ],
              }),
            },
            {
              name: 'feDeErrata',
              type: 'textarea',
              label: 'Fe de errata',
              localized: true,
              access: { create: campoEditorOAdmin, update: campoEditorOAdmin },
              admin: {
                description:
                  'Corrección que se muestra públicamente al final del artículo. Explica qué estaba mal y cuándo se corrigió.',
              },
            },
          ],
        },
        {
          label: 'Clasificación',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'tipo',
                  type: 'select',
                  label: 'Tipo de artículo',
                  required: true,
                  defaultValue: 'noticia',
                  options: [...TIPOS_DE_ARTICULO],
                },
                {
                  name: 'region',
                  type: 'select',
                  label: 'Región',
                  required: true,
                  defaultValue: 'puerto_rico',
                  options: [
                    { label: 'Puerto Rico', value: 'puerto_rico' },
                    { label: 'Internacional', value: 'internacional' },
                  ],
                },
              ],
            },
            {
              name: 'municipio',
              type: 'select',
              label: 'Municipio',
              options: OPCIONES_MUNICIPIOS,
              admin: {
                condition: (datos) => datos?.region !== 'internacional',
                description: 'Opcional. Elige el pueblo si la nota trata de un lugar específico.',
              },
            },
            {
              name: 'etiquetas',
              type: 'relationship',
              relationTo: 'etiquetas',
              hasMany: true,
              label: 'Etiquetas',
              admin: { description: 'Temas libres. Puedes crear etiquetas nuevas desde aquí.' },
            },
          ],
        },
      ],
    },

    // ── Sidebar ──────────────────────────────────────────────────────────────
    {
      name: 'estadoEditorial',
      type: 'select',
      label: 'Estado editorial',
      required: true,
      defaultValue: 'borrador',
      index: true,
      options: ESTADOS.map((valor) => ({ label: ETIQUETAS_ESTADO[valor], value: valor })),
      // Writers only see the two states they may use. Editors, admins and
      // trusted server code (scheduled publishing) keep every option; the
      // workflow hook is what enforces the rules.
      filterOptions: ({ options, req }) =>
        esColaborador(req.user as UsuarioConRol)
          ? options.filter((o) =>
              ESTADOS_DE_COLABORADOR.includes((typeof o === 'string' ? o : o.value) as Estado),
            )
          : options,
      admin: {
        position: 'sidebar',
        description:
          'Borrador: aún lo estás escribiendo. En revisión: listo para que la redacción lo revise. Para publicar, la redacción usa el botón "Publicar".',
      },
    },
    campoSlug('titulo'),
    {
      name: 'autores',
      type: 'relationship',
      relationTo: 'autores',
      hasMany: true,
      required: true,
      label: 'Firma(s)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categorias',
      required: true,
      label: 'Sección',
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'destacado',
      type: 'checkbox',
      label: 'Destacado en portada',
      defaultValue: false,
      index: true,
      access: { create: campoEditorOAdmin, update: campoEditorOAdmin },
      admin: { position: 'sidebar' },
    },
    {
      name: 'ultimaHora',
      type: 'checkbox',
      label: 'Última hora',
      defaultValue: false,
      access: { create: campoEditorOAdmin, update: campoEditorOAdmin },
      admin: {
        position: 'sidebar',
        description: 'Muestra la etiqueta "Última hora" junto al titular.',
      },
    },
    {
      name: 'fechaPublicacion',
      type: 'date',
      label: 'Fecha de publicación',
      index: true,
      access: { create: campoEditorOAdmin, update: campoEditorOAdmin },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, h:mm aaaa' },
        description:
          'Se llena sola al publicar. Para programar una publicación futura usa "Programar publicación" en el menú del botón Publicar.',
      },
    },
    {
      name: 'fechaActualizacion',
      type: 'date',
      label: 'Última actualización',
      access: { create: campoEditorOAdmin, update: campoEditorOAdmin },
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, h:mm aaaa' },
        description: 'Se llena sola cuando se vuelve a publicar un artículo ya publicado.',
      },
    },
    {
      name: 'tiempoDeLectura',
      type: 'number',
      label: 'Minutos de lectura',
      access: { create: () => false, update: () => false },
      admin: { position: 'sidebar', readOnly: true, description: 'Se calcula solo.' },
    },
    {
      name: 'creadoPor',
      type: 'relationship',
      relationTo: 'usuarios',
      label: 'Creado por',
      index: true,
      // Internal account id: never shown to the public.
      access: { read: campoPersonal, create: campoSoloAdmin, update: campoSoloAdmin },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      // Plain-text copy of the body, kept for search indexing. Never shown.
      name: 'textoPlano',
      type: 'textarea',
      localized: true,
      access: { read: campoEditorOAdmin, create: () => false, update: () => false },
      admin: { hidden: true },
    },
  ],
}
