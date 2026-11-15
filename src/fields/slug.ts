import type { Field, FieldHook } from 'payload'

import { aSlug } from '@/lib/texto'

/**
 * URL slug field. Filled in automatically from another field (usually the
 * title) when left empty; editors can still type their own. Always normalised
 * to lowercase ASCII with hyphens.
 */
export const campoSlug = (campoFuente: string): Field => {
  const generar: FieldHook = ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return aSlug(value)
    const fuente = data?.[campoFuente] ?? originalDoc?.[campoFuente]
    if (typeof fuente === 'string' && fuente.trim()) return aSlug(fuente)
    return value
  }

  return {
    name: 'slug',
    type: 'text',
    label: 'Dirección (URL)',
    index: true,
    unique: true,
    // Not `required`: the hook below fills it in, and this keeps it optional in
    // the generated types so code can create documents without passing a slug.
    validate: (valor: unknown) =>
      typeof valor === 'string' && valor.length > 0 ? true : 'Falta la dirección (URL).',
    admin: {
      position: 'sidebar',
      description:
        'Se genera sola a partir del título. Es la parte final del enlace. Evita cambiarla después de publicar.',
    },
    hooks: { beforeValidate: [generar] },
  }
}
