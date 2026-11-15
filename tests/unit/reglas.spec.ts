import { describe, expect, it } from 'vitest'

import { esAdmin, esColaborador, esEditorOAdmin, esPersonal } from '@/access/roles'
import { esEnlaceDeRedSocial, idDeYouTube } from '@/blocks/editor'
import { nombrePublicoDe } from '@/collections/Autores'
import { MUNICIPIOS, nombreDeMunicipio, OPCIONES_MUNICIPIOS } from '@/fields/municipios'
import { resolverFlujo } from '@/hooks/flujoEditorial'
import { validarContrasena } from '@/lib/contrasena'
import { aIniciales, aSlug, textoDesdeLexical, tiempoDeLectura } from '@/lib/texto'
import { cita, documento, titulo } from '@/seed/lexical'

describe('roles', () => {
  const admin = { id: 1, rol: 'admin' as const }
  const editor = { id: 2, rol: 'editor' as const }
  const colaborador = { id: 3, rol: 'colaborador' as const }

  it('classifies each role', () => {
    expect([esAdmin(admin), esAdmin(editor), esAdmin(colaborador)]).toEqual([true, false, false])
    expect([esEditorOAdmin(admin), esEditorOAdmin(editor), esEditorOAdmin(colaborador)]).toEqual([
      true,
      true,
      false,
    ])
    expect(esColaborador(colaborador)).toBe(true)
  })

  it('treats anonymous visitors and unknown roles as outsiders', () => {
    for (const nadie of [null, undefined, { id: 9 }, { id: 9, rol: 'otro' as never }]) {
      expect(esPersonal(nadie)).toBe(false)
      expect(esEditorOAdmin(nadie)).toBe(false)
      expect(esAdmin(nadie)).toBe(false)
    }
    expect(esPersonal(colaborador)).toBe(true)
  })
})

describe('flujo editorial', () => {
  it('starts as a draft', () => {
    expect(resolverFlujo({ rol: 'colaborador' })).toEqual({
      ok: true,
      estado: 'borrador',
      status: 'draft',
    })
  })

  it('lets a writer submit for review', () => {
    expect(
      resolverFlujo({
        rol: 'colaborador',
        estadoSolicitado: 'en_revision',
        estadoPrevio: 'borrador',
        statusSolicitado: 'draft',
      }),
    ).toEqual({ ok: true, estado: 'en_revision', status: 'draft' })
  })

  it('never lets a writer publish or archive', () => {
    expect(resolverFlujo({ rol: 'colaborador', statusSolicitado: 'published' }).ok).toBe(false)
    expect(resolverFlujo({ rol: 'colaborador', estadoSolicitado: 'publicado' }).ok).toBe(false)
    expect(resolverFlujo({ rol: 'colaborador', estadoSolicitado: 'archivado' }).ok).toBe(false)
  })

  it('marks an article as published when an editor publishes', () => {
    for (const rol of ['editor', 'admin', 'sistema'] as const) {
      expect(
        resolverFlujo({ rol, estadoSolicitado: 'en_revision', statusSolicitado: 'published' }),
      ).toEqual({ ok: true, estado: 'publicado', status: 'published' })
    }
  })

  it('returns to draft when unpublished', () => {
    expect(
      resolverFlujo({
        rol: 'editor',
        estadoSolicitado: 'publicado',
        estadoPrevio: 'publicado',
        statusSolicitado: 'draft',
        statusPrevio: 'published',
      }),
    ).toEqual({ ok: true, estado: 'borrador', status: 'draft' })
  })

  it('archiving always takes the article down, even with Publish pressed', () => {
    expect(
      resolverFlujo({
        rol: 'editor',
        estadoSolicitado: 'archivado',
        estadoPrevio: 'publicado',
        statusSolicitado: 'published',
        statusPrevio: 'published',
      }),
    ).toEqual({ ok: true, estado: 'archivado', status: 'draft' })
  })

  it('publishing an archived article brings it back', () => {
    expect(
      resolverFlujo({
        rol: 'editor',
        estadoSolicitado: 'archivado',
        estadoPrevio: 'archivado',
        statusSolicitado: 'published',
        statusPrevio: 'draft',
      }),
    ).toEqual({ ok: true, estado: 'publicado', status: 'published' })
  })

  it('keeps the previous state on partial updates', () => {
    expect(
      resolverFlujo({ rol: 'editor', estadoPrevio: 'publicado', statusPrevio: 'published' }),
    ).toEqual({ ok: true, estado: 'publicado', status: 'published' })
  })
})

describe('nombre público de autores', () => {
  const real = { nombre: 'Ana María', apellido: 'Rivera Soto' }

  it('uses the full name for adults', () => {
    expect(nombrePublicoDe(real)).toBe('Ana María Rivera Soto')
  })

  it('uses the pen name when chosen', () => {
    expect(nombrePublicoDe({ ...real, usarSeudonimo: true, seudonimo: 'Tiza Rebelde' })).toBe(
      'Tiza Rebelde',
    )
  })

  it('never shows the real name of a minor', () => {
    expect(nombrePublicoDe({ ...real, esMenorDeEdad: true })).toBe('A. M. R. S.')
    expect(nombrePublicoDe({ ...real, esMenorDeEdad: true, seudonimo: ' Coquí ' })).toBe('Coquí')
    // Even if "use pen name" is off, the minor flag wins.
    expect(nombrePublicoDe({ ...real, esMenorDeEdad: true, usarSeudonimo: false })).not.toContain(
      'Rivera',
    )
  })
})

describe('contraseñas', () => {
  it('accepts a strong password', () => {
    expect(validarContrasena('Pizarra-Verde-2026', 'maestra@example.com')).toBe(true)
  })

  it('rejects short, simple or email-based passwords', () => {
    expect(validarContrasena('Corta1!')).not.toBe(true)
    expect(validarContrasena('solominusculaslargas')).not.toBe(true)
    expect(validarContrasena('Maestra-2026-xyz', 'maestra@example.com')).not.toBe(true)
    expect(validarContrasena('aaaaaaaaaaaaaaaa')).not.toBe(true)
  })
})

describe('texto', () => {
  it('builds clean slugs from Spanish text', () => {
    expect(aSlug('Educación Pública: ¿qué sigue?')).toBe('educacion-publica-que-sigue')
    expect(aSlug('  Añasco y Mayagüez  ')).toBe('anasco-y-mayaguez')
    expect(aSlug('a'.repeat(200)).length).toBeLessThanOrEqual(90)
  })

  it('builds initials', () => {
    expect(aIniciales('Ana María', 'Rivera Soto')).toBe('A. M. R. S.')
    expect(aIniciales('óscar', null)).toBe('Ó.')
  })

  it('extracts plain text from the editor, including pull quotes', () => {
    const doc = documento('Primer párrafo.', titulo('Un subtítulo'), cita('Una cita.', 'Alguien'))
    expect(textoDesdeLexical(doc)).toBe('Primer párrafo.\nUn subtítulo\nUna cita.')
    expect(textoDesdeLexical(null)).toBe('')
  })

  it('estimates reading time with a one-minute minimum', () => {
    expect(tiempoDeLectura('')).toBe(1)
    expect(tiempoDeLectura('palabra '.repeat(200))).toBe(1)
    expect(tiempoDeLectura('palabra '.repeat(201))).toBe(2)
    expect(tiempoDeLectura('palabra '.repeat(1000))).toBe(5)
  })
})

describe('municipios', () => {
  it('lists the 78 municipalities without duplicates', () => {
    expect(MUNICIPIOS).toHaveLength(78)
    expect(new Set(OPCIONES_MUNICIPIOS.map((o) => o.value)).size).toBe(78)
    expect(nombreDeMunicipio('mayaguez')).toBe('Mayagüez')
    expect(nombreDeMunicipio('no-existe')).toBeUndefined()
  })
})

describe('incrustaciones', () => {
  it('recognises YouTube links', () => {
    expect(idDeYouTube('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(idDeYouTube('https://youtu.be/dQw4w9WgXcQ?t=10')).toBe('dQw4w9WgXcQ')
    expect(idDeYouTube('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(idDeYouTube('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull()
    expect(idDeYouTube('https://evil.example/watch?v=dQw4w9WgXcQ')).toBeNull()
    expect(idDeYouTube('javascript:alert(1)')).toBeNull()
  })

  it('only allows https links to known social networks', () => {
    expect(esEnlaceDeRedSocial('https://x.com/usuario/status/1')).toBe(true)
    expect(esEnlaceDeRedSocial('https://www.instagram.com/p/abc/')).toBe(true)
    expect(esEnlaceDeRedSocial('https://x.com.evil.example/')).toBe(false)
    expect(esEnlaceDeRedSocial('http://x.com/usuario')).toBe(false)
  })
})
