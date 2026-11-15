/**
 * Collections written by the public site through server-side code only
 * (forms and the view counter). `create` is closed to the API on purpose:
 * the server actions validate, check spam protection and rate limits, and
 * then write with the Local API.
 */
import type { CollectionConfig } from 'payload'

import { editorOAdmin, nadie, soloAdmin } from '@/access'
import { diaEnPuertoRico } from '@/lib/fechas'

const ROBOTS = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|headless|lighthouse/i

export const Mensajes: CollectionConfig = {
  slug: 'mensajes',
  labels: { singular: 'Mensaje', plural: 'Mensajes recibidos' },
  admin: {
    useAsTitle: 'asunto',
    defaultColumns: ['asunto', 'tipo', 'nombre', 'estado', 'createdAt'],
    group: 'Buzón',
    description: 'Mensajes de contacto e historias enviadas por el público.',
  },
  defaultSort: '-createdAt',
  access: { read: editorOAdmin, create: nadie, update: editorOAdmin, delete: editorOAdmin },
  fields: [
    {
      name: 'tipo',
      type: 'select',
      label: 'Tipo',
      required: true,
      defaultValue: 'contacto',
      options: [
        { label: 'Contacto', value: 'contacto' },
        { label: 'Historia o pista', value: 'historia' },
      ],
      admin: { readOnly: true },
    },
    { name: 'asunto', type: 'text', label: 'Asunto', required: true, admin: { readOnly: true } },
    { name: 'nombre', type: 'text', label: 'Nombre', admin: { readOnly: true } },
    { name: 'email', type: 'email', label: 'Correo electrónico', admin: { readOnly: true } },
    {
      name: 'mensaje',
      type: 'textarea',
      label: 'Mensaje',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'anonimo',
      type: 'checkbox',
      label: 'Pidió anonimato',
      defaultValue: false,
      admin: { readOnly: true },
    },
    {
      name: 'estado',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'nuevo',
      options: [
        { label: 'Nuevo', value: 'nuevo' },
        { label: 'Leído', value: 'leido' },
        { label: 'Atendido', value: 'atendido' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'notas',
      type: 'textarea',
      label: 'Notas internas',
      admin: { position: 'sidebar' },
    },
  ],
}

export const Suscriptores: CollectionConfig = {
  slug: 'suscriptores',
  labels: { singular: 'Suscriptor/a', plural: 'Suscriptores del boletín' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'estado', 'confirmadoEn', 'createdAt'],
    group: 'Buzón',
    description:
      'Personas suscritas al boletín. Solo cuentan las confirmadas (doble confirmación).',
  },
  defaultSort: '-createdAt',
  access: { read: editorOAdmin, create: nadie, update: soloAdmin, delete: editorOAdmin },
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Correo electrónico',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'estado',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'pendiente',
      index: true,
      options: [
        { label: 'Pendiente de confirmar', value: 'pendiente' },
        { label: 'Confirmado', value: 'confirmado' },
        { label: 'Dado de baja', value: 'baja' },
      ],
    },
    { name: 'confirmadoEn', type: 'date', label: 'Confirmado el', admin: { readOnly: true } },
    { name: 'bajaEn', type: 'date', label: 'Baja el', admin: { readOnly: true } },
    // Only a hash of the confirmation token is stored; it is never readable.
    {
      name: 'tokenHash',
      type: 'text',
      index: true,
      access: { read: () => false, update: () => false },
      admin: { hidden: true },
    },
    {
      name: 'tokenExpira',
      type: 'date',
      access: { read: () => false, update: () => false },
      admin: { hidden: true },
    },
  ],
}

/** Daily view counter for "Más leídas". No IP, cookie or reader data. */
export const Vistas: CollectionConfig = {
  slug: 'vistas',
  labels: { singular: 'Vista', plural: 'Vistas' },
  admin: { hidden: true },
  access: { read: editorOAdmin, create: nadie, update: nadie, delete: soloAdmin },
  indexes: [{ fields: ['articulo', 'dia'], unique: true }],
  endpoints: [
    {
      // POST /api/vistas/registrar  { "slug": "…" }
      // Adds one view to today's counter for a published article. Stores no
      // IP address, cookie or anything else about the reader.
      path: '/registrar',
      method: 'post',
      handler: async (req) => {
        const vacio = new Response(null, { status: 204 })
        // Only count views coming from our own pages, and skip crawlers and
        // link-preview fetchers (WhatsApp, Facebook, …).
        if (req.headers.get('sec-fetch-site') !== 'same-origin') return vacio
        if (ROBOTS.test(req.headers.get('user-agent') ?? '')) return vacio

        let slug: unknown
        try {
          slug = ((await req.json?.()) as { slug?: unknown } | undefined)?.slug
        } catch {
          return vacio
        }
        if (typeof slug !== 'string' || !/^[a-z0-9-]{1,120}$/.test(slug)) return vacio

        const { pool } = req.payload.db as unknown as {
          pool: { query: (texto: string, valores: unknown[]) => Promise<unknown> }
        }
        await pool.query(
          `INSERT INTO vistas (articulo_id, dia, conteo, updated_at, created_at)
           SELECT id, $2, 1, now(), now() FROM articulos WHERE slug = $1 AND _status = 'published'
           ON CONFLICT (articulo_id, dia) DO UPDATE SET conteo = vistas.conteo + 1, updated_at = now()`,
          [slug, diaEnPuertoRico(Date.now())],
        )
        return vacio
      },
    },
  ],
  fields: [
    {
      name: 'articulo',
      type: 'relationship',
      relationTo: 'articulos',
      required: true,
      index: true,
    },
    { name: 'dia', type: 'text', required: true, index: true },
    { name: 'conteo', type: 'number', required: true, defaultValue: 0 },
  ],
}
