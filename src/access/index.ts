/**
 * Access rules. Each export is one rule, enforced by Payload on the server for
 * the REST API, GraphQL, the admin panel and the Local API (when
 * `overrideAccess: false`). Hiding something in the UI is never the control.
 */
import type { Access, FieldAccess, Where } from 'payload'

import { esAdmin, esEditorOAdmin, esPersonal, type UsuarioConRol } from './roles'

const usuarioDe = (req: { user?: unknown }): UsuarioConRol => req.user as UsuarioConRol

const PUBLICADO: Where = { _status: { equals: 'published' } }
const BORRADOR: Where = { _status: { equals: 'draft' } }
const donde = (consulta: Where): Where => consulta

// ── Generic ──────────────────────────────────────────────────────────────────
export const cualquiera: Access = () => true
export const nadie: Access = () => false
export const soloAdmin: Access = ({ req }) => esAdmin(usuarioDe(req))
export const editorOAdmin: Access = ({ req }) => esEditorOAdmin(usuarioDe(req))
export const personal: Access = ({ req }) => esPersonal(usuarioDe(req))

export const campoSoloAdmin: FieldAccess = ({ req }) => esAdmin(usuarioDe(req))
export const campoEditorOAdmin: FieldAccess = ({ req }) => esEditorOAdmin(usuarioDe(req))
export const campoPersonal: FieldAccess = ({ req }) => esPersonal(usuarioDe(req))

/** Public sees published documents only; the newsroom sees everything. */
export const publicadoOPersonal: Access = ({ req }) => {
  if (esPersonal(usuarioDe(req))) return true
  return PUBLICADO
}

// ── Artículos ────────────────────────────────────────────────────────────────
export const leerArticulos: Access = ({ req }) => {
  const usuario = usuarioDe(req)
  if (esEditorOAdmin(usuario)) return true
  if (esPersonal(usuario)) {
    return donde({ or: [PUBLICADO, { creadoPor: { equals: usuario!.id } }] })
  }
  return PUBLICADO
}

export const crearArticulos: Access = ({ req }) => esPersonal(usuarioDe(req))

/**
 * Editors and admins can update anything. Writers can update only their own
 * articles, and only while they are unpublished. The workflow hook
 * (`hooks/flujoEditorial.ts`) additionally rejects any attempt by a writer to
 * publish.
 */
export const actualizarArticulos: Access = ({ req }) => {
  const usuario = usuarioDe(req)
  if (esEditorOAdmin(usuario)) return true
  if (esPersonal(usuario)) {
    return donde({ and: [{ creadoPor: { equals: usuario!.id } }, BORRADOR] })
  }
  return false
}

/** Writers see the version history of their own articles only. */
export const leerVersionesArticulos: Access = ({ req }) => {
  const usuario = usuarioDe(req)
  if (esEditorOAdmin(usuario)) return true
  if (esPersonal(usuario)) return { 'version.creadoPor': { equals: usuario!.id } }
  return false
}

// ── Usuarios ─────────────────────────────────────────────────────────────────
export const leerUsuarios: Access = ({ req }) => {
  const usuario = usuarioDe(req)
  if (esEditorOAdmin(usuario)) return true
  if (esPersonal(usuario)) return { id: { equals: usuario!.id } }
  return false
}

export const actualizarUsuarios: Access = ({ req }) => {
  const usuario = usuarioDe(req)
  if (esAdmin(usuario)) return true
  if (esPersonal(usuario)) return { id: { equals: usuario!.id } }
  return false
}

// ── Autores ──────────────────────────────────────────────────────────────────
export const actualizarAutores: Access = ({ req }) => {
  const usuario = usuarioDe(req)
  if (esEditorOAdmin(usuario)) return true
  if (esPersonal(usuario)) return { usuario: { equals: usuario!.id } }
  return false
}

/**
 * Student safety. Sensitive author fields are visible to the public only when
 * the author is NOT flagged as a minor. When Payload evaluates this rule
 * without a document (for example while validating a `where` query), the
 * public is denied, so hidden values cannot be probed through filters.
 */
export const campoVisibleSiNoEsMenor: FieldAccess = ({ req, doc }) => {
  if (esPersonal(usuarioDe(req))) return true
  if (!doc) return false
  return (doc as { esMenorDeEdad?: boolean | null }).esMenorDeEdad !== true
}

// ── Media ────────────────────────────────────────────────────────────────────
export const actualizarMedia: Access = ({ req }) => {
  const usuario = usuarioDe(req)
  if (esEditorOAdmin(usuario)) return true
  if (esPersonal(usuario)) return { subidoPor: { equals: usuario!.id } }
  return false
}
