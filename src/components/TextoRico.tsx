import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  LinkJSXConverter,
  RichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

import { idDeYouTube, esEnlaceDeRedSocial } from '@/blocks/editor'
import type { Diccionario } from '@/lib/i18n'
import { rutas } from '@/lib/rutas'
import type { Media } from '@/payload-types'

import { VideoYouTube } from './cliente/VideoYouTube'
import { ImagenMedia } from './ImagenMedia'

type Cita = { cita: string; atribucion?: string | null }
type Video = { url: string; titulo: string }
type Social = { url: string; descripcion: string }
type Nodos = DefaultNodeTypes | SerializedBlockNode<Cita | Video | Social>

const NOMBRE_RED: Record<string, string> = {
  'x.com': 'X',
  'twitter.com': 'X',
  'facebook.com': 'Facebook',
  'instagram.com': 'Instagram',
  'tiktok.com': 'TikTok',
  'threads.net': 'Threads',
  'threads.com': 'Threads',
  'bsky.app': 'Bluesky',
}

const convertidores =
  (locale: string, t: Diccionario): JSXConvertersFunction<Nodos> =>
  ({ defaultConverters }) => {
    const r = rutas(locale)

    const enlaceInterno = ({ linkNode }: { linkNode: SerializedLinkNode }): string => {
      const { relationTo, value } = linkNode.fields.doc ?? {}
      const slug =
        typeof value === 'object' && value ? (value as { slug?: string }).slug : undefined
      if (!slug) return r.portada()
      switch (relationTo) {
        case 'articulos':
          return r.articulo(slug)
        case 'categorias':
          return r.seccion(slug)
        case 'etiquetas':
          return r.etiqueta(slug)
        case 'autores':
          return r.autor(slug)
        default:
          return r.pagina(slug)
      }
    }

    return {
      ...defaultConverters,
      ...LinkJSXConverter({ internalDocToHref: enlaceInterno }),

      upload: ({ node }) => {
        const media = node.value as Media | number
        if (typeof media !== 'object' || !media?.url) return null
        const pie = [media.leyenda, media.credito].filter(Boolean).join(' · ')
        return (
          <figure className="my-8">
            <ImagenMedia
              media={media}
              tamanos="(min-width: 768px) 680px, 100vw"
              className="h-auto w-full rounded-md"
            />
            {pie && <figcaption className="meta mt-2">{pie}</figcaption>}
          </figure>
        )
      },

      blocks: {
        citaDestacada: ({ node }: { node: SerializedBlockNode<Cita> }) => (
          <figure className="border-alerta my-8 border-l-4 py-1 pl-5">
            <blockquote className="font-display text-tinta border-0 p-0 text-2xl leading-snug font-medium not-italic sm:text-[1.7rem]">
              {node.fields.cita}
            </blockquote>
            {node.fields.atribucion && (
              <figcaption className="meta mt-2">{node.fields.atribucion}</figcaption>
            )}
          </figure>
        ),

        youtube: ({ node }: { node: SerializedBlockNode<Video> }) => {
          const id = idDeYouTube(node.fields.url)
          if (!id) return null
          return (
            <div className="my-8">
              <VideoYouTube
                id={id}
                titulo={node.fields.titulo}
                etiquetaVer={t.verVideo}
                aviso={t.avisoYouTube}
              />
            </div>
          )
        },

        publicacionSocial: ({ node }: { node: SerializedBlockNode<Social> }) => {
          const { url, descripcion } = node.fields
          // Validated on save; checked again so a bad value can never render a link.
          if (!esEnlaceDeRedSocial(url)) return null
          const host = new URL(url).hostname.replace(/^www\.|^m\.|^mobile\./, '')
          const red = NOMBRE_RED[host] ?? host
          return (
            <aside className="border-linea bg-superficie font-ui my-8 rounded-md border p-4 text-base">
              <p className="text-tinta">{descripcion}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-acento mt-2 inline-block font-semibold underline underline-offset-4"
              >
                {t.verPublicacion} {red}
                <span className="sr-only"> (abre en una pestaña nueva)</span> ↗
              </a>
            </aside>
          )
        },
      },
    } as ReturnType<JSXConvertersFunction<Nodos>>
  }

type Props = {
  datos: unknown
  locale: string
  t: Diccionario
  className?: string
}

/** Renders editor content as React elements (never as raw HTML). */
export function TextoRico({ datos, locale, t, className = 'cuerpo' }: Props) {
  if (!datos || typeof datos !== 'object') return null
  return (
    <RichText
      data={datos as SerializedEditorState}
      converters={convertidores(locale, t)}
      className={className}
    />
  )
}
