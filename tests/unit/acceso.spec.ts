import type { AccessArgs, PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  actualizarArticulos,
  actualizarAutores,
  actualizarMedia,
  actualizarUsuarios,
  campoVisibleSiNoEsMenor,
  crearArticulos,
  editorOAdmin,
  leerArticulos,
  leerUsuarios,
  leerVersionesArticulos,
  personal,
  publicadoOPersonal,
  soloAdmin,
} from '@/access'

/**
 * The access rules are plain functions: given who is asking, they answer
 * yes, no, or "only the documents matching this filter". These tests call
 * them directly, without a database.
 */
type Quien = { id: number; rol: 'admin' | 'editor' | 'colaborador' } | null

const admin: Quien = { id: 1, rol: 'admin' }
const editor: Quien = { id: 2, rol: 'editor' }
const colaboradora: Quien = { id: 3, rol: 'colaborador' }
const publico: Quien = null

const pedir = (usuario: Quien, data?: Record<string, unknown>) =>
  ({ req: { user: usuario } as unknown as PayloadRequest, data }) as AccessArgs

const PUBLICADO = { _status: { equals: 'published' } }

describe('reglas generales', () => {
  it('soloAdmin, editorOAdmin and personal form a ladder', () => {
    const tabla = [admin, editor, colaboradora, publico].map((u) => [
      soloAdmin(pedir(u)),
      editorOAdmin(pedir(u)),
      personal(pedir(u)),
    ])
    expect(tabla).toEqual([
      [true, true, true],
      [false, true, true],
      [false, false, true],
      [false, false, false],
    ])
  })

  it('the public only gets published documents', () => {
    expect(publicadoOPersonal(pedir(publico))).toEqual(PUBLICADO)
    expect(publicadoOPersonal(pedir(colaboradora))).toBe(true)
  })
})

describe('artículos', () => {
  it('read: public sees published; writers also see their own; editors see all', () => {
    expect(leerArticulos(pedir(publico))).toEqual(PUBLICADO)
    expect(leerArticulos(pedir(colaboradora))).toEqual({
      or: [PUBLICADO, { creadoPor: { equals: 3 } }],
    })
    expect(leerArticulos(pedir(editor))).toBe(true)
    expect(leerArticulos(pedir(admin))).toBe(true)
  })

  it('create: the newsroom starts drafts; only editors create something published', () => {
    expect(crearArticulos(pedir(publico))).toBe(false)
    expect(crearArticulos(pedir(colaboradora, { _status: 'draft' }))).toBe(true)
    expect(crearArticulos(pedir(colaboradora, {}))).toBe(true)
    expect(crearArticulos(pedir(colaboradora, { _status: 'published' }))).toBe(false)
    expect(crearArticulos(pedir(editor, { _status: 'published' }))).toBe(true)
  })

  it('update: writers only touch their own unpublished articles and never publish', () => {
    expect(actualizarArticulos(pedir(publico))).toBe(false)
    expect(actualizarArticulos(pedir(colaboradora, { titulo: 'x' }))).toEqual({
      and: [{ creadoPor: { equals: 3 } }, { _status: { equals: 'draft' } }],
    })
    // This is the question the admin asks before drawing the Publish button.
    expect(actualizarArticulos(pedir(colaboradora, { _status: 'published' }))).toBe(false)
    expect(actualizarArticulos(pedir(editor, { _status: 'published' }))).toBe(true)
  })

  it('version history: own articles for writers, all for editors, none for the public', () => {
    expect(leerVersionesArticulos(pedir(publico))).toBe(false)
    expect(leerVersionesArticulos(pedir(colaboradora))).toEqual({
      'version.creadoPor': { equals: 3 },
    })
    expect(leerVersionesArticulos(pedir(editor))).toBe(true)
  })
})

describe('usuarios, autores, imágenes', () => {
  it('accounts: writers see and edit only themselves; only admins edit others', () => {
    expect(leerUsuarios(pedir(publico))).toBe(false)
    expect(leerUsuarios(pedir(colaboradora))).toEqual({ id: { equals: 3 } })
    expect(leerUsuarios(pedir(editor))).toBe(true)
    expect(actualizarUsuarios(pedir(editor))).toEqual({ id: { equals: 2 } })
    expect(actualizarUsuarios(pedir(admin))).toBe(true)
    expect(actualizarUsuarios(pedir(publico))).toBe(false)
  })

  it('author profiles and images: own for writers, all for editors', () => {
    expect(actualizarAutores(pedir(colaboradora))).toEqual({ usuario: { equals: 3 } })
    expect(actualizarAutores(pedir(editor))).toBe(true)
    expect(actualizarAutores(pedir(publico))).toBe(false)
    expect(actualizarMedia(pedir(colaboradora))).toEqual({ subidoPor: { equals: 3 } })
    expect(actualizarMedia(pedir(publico))).toBe(false)
  })
})

describe('protección de menores (campo)', () => {
  const campo = (usuario: Quien, doc?: Record<string, unknown>) =>
    campoVisibleSiNoEsMenor({ req: { user: usuario }, doc } as never)

  it('hides the field from the public when the author is a minor', () => {
    expect(campo(publico, { esMenorDeEdad: true })).toBe(false)
    expect(campo(publico, { esMenorDeEdad: false })).toBe(true)
    expect(campo(publico, {})).toBe(true)
  })

  it('denies the public when there is no document, so filters cannot probe it', () => {
    expect(campo(publico, undefined)).toBe(false)
  })

  it('always shows it to the newsroom', () => {
    expect(campo(colaboradora, { esMenorDeEdad: true })).toBe(true)
    expect(campo(editor, undefined)).toBe(true)
  })
})
