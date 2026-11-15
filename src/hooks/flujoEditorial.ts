/**
 * Editorial workflow rules as a pure function.
 *
 * Two values travel together on every article:
 *  - `_status` (Payload): 'draft' | 'published'. Decides public visibility.
 *  - `estadoEditorial` (ours): what the newsroom sees and filters on.
 *
 * borrador → en_revision → publicado, plus archivado.
 * Only editors and admins can publish or archive.
 */
import type { Rol } from '@/access/roles'

export const ESTADOS = ['borrador', 'en_revision', 'publicado', 'archivado'] as const
export type Estado = (typeof ESTADOS)[number]
export type Status = 'draft' | 'published'

export const ETIQUETAS_ESTADO: Record<Estado, string> = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  publicado: 'Publicado',
  archivado: 'Archivado',
}

export const ESTADOS_DE_COLABORADOR: readonly Estado[] = ['borrador', 'en_revision']

type Entrada = {
  /** 'sistema' = trusted server code (seed, scheduled jobs without a user). */
  rol: Rol | 'sistema'
  estadoSolicitado?: Estado | null
  estadoPrevio?: Estado | null
  statusSolicitado?: Status | null
  statusPrevio?: Status | null
}

type Resultado = { ok: true; estado: Estado; status: Status } | { ok: false; motivo: string }

export const resolverFlujo = ({
  rol,
  estadoSolicitado,
  estadoPrevio,
  statusSolicitado,
  statusPrevio,
}: Entrada): Resultado => {
  let status: Status = statusSolicitado ?? statusPrevio ?? 'draft'
  let estado: Estado = estadoSolicitado ?? estadoPrevio ?? 'borrador'

  if (rol === 'colaborador') {
    if (status === 'published') {
      return {
        ok: false,
        motivo:
          'No tienes permiso para publicar. Cambia el estado a "En revisión" para enviarlo a la redacción.',
      }
    }
    if (!ESTADOS_DE_COLABORADOR.includes(estado)) {
      return {
        ok: false,
        motivo: 'Solo puedes usar los estados "Borrador" y "En revisión".',
      }
    }
  }

  // Archiving always takes the article off the public site. Pressing
  // "Publicar" on an article that was already archived brings it back.
  const archivandoAhora = estado === 'archivado' && estadoPrevio !== 'archivado'
  if (archivandoAhora || (estado === 'archivado' && statusSolicitado !== 'published')) {
    return { ok: true, estado: 'archivado', status: 'draft' }
  }

  if (status === 'published') {
    estado = 'publicado'
  } else if (estado === 'publicado' || estado === 'archivado') {
    // Unpublished, or a new unpublished revision of a published article.
    estado = 'borrador'
    status = 'draft'
  }

  return { ok: true, estado, status }
}
