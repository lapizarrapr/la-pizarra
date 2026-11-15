/**
 * Collections written by the public site through server-side code only
 * (forms and the view counter). `create` is closed to the API on purpose:
 * the server actions validate, check spam protection and rate limits, and
 * then write with the Local API.
 */
import type { CollectionConfig } from 'payload'

import { editorOAdmin, nadie, soloAdmin } from '@/access'

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
