import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { documento } from '@/seed/lexical'

import {
  como,
  contrasenaDePrueba,
  crearMundo,
  iniciarPayload,
  vaciar,
  type Mundo,
} from '../helpers/payload'

let payload: Payload
let m: Mundo

beforeAll(async () => {
  payload = await iniciarPayload()
  await vaciar(payload)
  m = await crearMundo(payload)
})

afterAll(async () => {
  await vaciar(payload)
})

const cuerpo = documento('palabra '.repeat(450).trim())

describe('usuarios', () => {
  it('makes the very first account the administrator', async () => {
    await vaciar(payload)
    const primero = await payload.create({
      collection: 'usuarios',
      data: {
        nombre: 'Primera',
        email: 'primera@prueba.test',
        password: contrasenaDePrueba(),
        rol: 'colaborador',
      },
    })
    expect(primero.rol).toBe('admin')
    await vaciar(payload)
    m = await crearMundo(payload)
  })

  it('rejects weak passwords on create and update', async () => {
    await expect(
      payload.create({
        collection: 'usuarios',
        data: {
          nombre: 'Débil',
          email: 'debil@prueba.test',
          password: 'abc123',
          rol: 'colaborador',
        },
      }),
    ).rejects.toThrow(/contraseña/i)

    await expect(
      payload.update({ collection: 'usuarios', id: m.ana.id, data: { password: 'cortita' } }),
    ).rejects.toThrow(/contraseña/i)
  })

  it('does not let a writer promote themself', async () => {
    const actualizado = await payload.update({
      collection: 'usuarios',
      id: m.ana.id,
      data: { rol: 'admin', nombre: 'Ana R.' },
      user: como(m.ana),
      overrideAccess: false,
    })
    expect(actualizado.nombre).toBe('Ana R.')
    expect(actualizado.rol).toBe('colaborador')
  })

  it('hides other accounts from writers and everything from the public', async () => {
    const vistos = await payload.find({
      collection: 'usuarios',
      user: como(m.ana),
      overrideAccess: false,
    })
    expect(vistos.docs.map((u) => u.id)).toEqual([m.ana.id])

    await expect(payload.find({ collection: 'usuarios', overrideAccess: false })).rejects.toThrow()
  })

  it('only lets admins create or delete accounts', async () => {
    const datos = {
      nombre: 'Nueva',
      email: 'nueva@prueba.test',
      password: contrasenaDePrueba(),
      rol: 'colaborador' as const,
    }
    await expect(
      payload.create({
        collection: 'usuarios',
        data: datos,
        user: como(m.editor),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    await expect(
      payload.delete({
        collection: 'usuarios',
        id: m.luis.id,
        user: como(m.editor),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})

describe('artículos: flujo de colaborador a publicación', () => {
  let id: number

  it('a writer creates a draft signed with their own profile', async () => {
    const articulo = await payload.create({
      collection: 'articulos',
      draft: true,
      data: {
        titulo: 'Sin maestros de ciencia en tres escuelas',
        cuerpo,
        categoria: m.categoria.id,
        destacado: true,
        ultimaHora: true,
      },
      user: como(m.ana),
      overrideAccess: false,
      depth: 0,
    })
    id = articulo.id

    expect(articulo._status).toBe('draft')
    expect(articulo.estadoEditorial).toBe('borrador')
    expect(articulo.slug).toBe('sin-maestros-de-ciencia-en-tres-escuelas')
    expect(articulo.creadoPor).toBe(m.ana.id)
    expect(articulo.autores).toEqual([m.autorAna.id])
    expect(articulo.tiempoDeLectura).toBe(3)
    // Front-page flags are for editors only: silently ignored.
    expect(articulo.destacado).toBe(false)
    expect(articulo.ultimaHora).toBe(false)
  })

  it('the draft is invisible to the public and to other writers', async () => {
    const publico = await payload.find({ collection: 'articulos', overrideAccess: false })
    expect(publico.totalDocs).toBe(0)

    const otro = await payload.find({
      collection: 'articulos',
      draft: true,
      user: como(m.luis),
      overrideAccess: false,
    })
    expect(otro.totalDocs).toBe(0)

    await expect(
      payload.update({
        collection: 'articulos',
        id,
        draft: true,
        data: { titulo: 'Cambiado por otra persona' },
        user: como(m.luis),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('the writer cannot publish, archive or delete', async () => {
    await expect(
      payload.update({
        collection: 'articulos',
        id,
        data: { _status: 'published' },
        user: como(m.ana),
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    await expect(
      payload.update({
        collection: 'articulos',
        id,
        draft: true,
        data: { estadoEditorial: 'archivado' },
        user: como(m.ana),
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    await expect(
      payload.delete({ collection: 'articulos', id, user: como(m.ana), overrideAccess: false }),
    ).rejects.toThrow()

    const sigue = await payload.findByID({ collection: 'articulos', id, draft: true, depth: 0 })
    expect(sigue._status).toBe('draft')
  })

  it('the writer submits for review', async () => {
    const enviado = await payload.update({
      collection: 'articulos',
      id,
      draft: true,
      data: { estadoEditorial: 'en_revision' },
      user: como(m.ana),
      overrideAccess: false,
      depth: 0,
    })
    expect(enviado.estadoEditorial).toBe('en_revision')
    expect(enviado._status).toBe('draft')
  })

  it('an editor publishes and the public can read it', async () => {
    const publicado = await payload.update({
      collection: 'articulos',
      id,
      data: { _status: 'published', destacado: true },
      user: como(m.editor),
      overrideAccess: false,
      depth: 0,
    })
    expect(publicado._status).toBe('published')
    expect(publicado.estadoEditorial).toBe('publicado')
    expect(publicado.destacado).toBe(true)
    expect(publicado.fechaPublicacion).toBeTruthy()
    expect(publicado.fechaActualizacion ?? null).toBeNull()

    const publico = await payload.find({ collection: 'articulos', overrideAccess: false, depth: 0 })
    expect(publico.docs.map((a) => a.id)).toEqual([id])
    // The search copy of the body is not exposed publicly.
    expect(publico.docs[0]).not.toHaveProperty('textoPlano')
    expect(publico.docs[0]).not.toHaveProperty('creadoPor')
  })

  it('once published, the writer can no longer change it', async () => {
    await expect(
      payload.update({
        collection: 'articulos',
        id,
        data: { titulo: 'Título cambiado sin permiso' },
        user: como(m.ana),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('re-publishing marks the article as updated', async () => {
    const actualizado = await payload.update({
      collection: 'articulos',
      id,
      data: { _status: 'published', feDeErrata: 'Se corrigió el número de escuelas.' },
      user: como(m.editor),
      overrideAccess: false,
      depth: 0,
    })
    expect(actualizado.fechaActualizacion).toBeTruthy()
    expect(actualizado.feDeErrata).toContain('corrigió')
  })

  it('archiving from "save draft" really takes it off the site', async () => {
    await payload.update({
      collection: 'articulos',
      id,
      draft: true,
      data: { estadoEditorial: 'archivado' },
      user: como(m.editor),
      overrideAccess: false,
    })

    const publico = await payload.find({ collection: 'articulos', overrideAccess: false })
    expect(publico.totalDocs).toBe(0)

    const interno = await payload.findByID({ collection: 'articulos', id, depth: 0 })
    expect(interno._status).toBe('draft')
    expect(interno.estadoEditorial).toBe('archivado')
  })

  it('an editor can delete it', async () => {
    await payload.delete({
      collection: 'articulos',
      id,
      user: como(m.editor),
      overrideAccess: false,
    })
    const resto = await payload.find({ collection: 'articulos', draft: true })
    expect(resto.totalDocs).toBe(0)
  })
})

describe('autores: protección de menores', () => {
  it('stores a public name and URL that never contain the real name', async () => {
    expect(m.estudiante.nombrePublico).toBe('Coquí de Salón')
    expect(m.estudiante.slug).toBe('coqui-de-salon')
  })

  it('hides name, last name, photo and social links from the public', async () => {
    const { docs } = await payload.find({
      collection: 'autores',
      where: { slug: { equals: 'coqui-de-salon' } },
      overrideAccess: false,
    })
    const visto = docs[0] as unknown as Record<string, unknown>
    expect(visto.nombrePublico).toBe('Coquí de Salón')
    for (const campo of ['nombre', 'apellido', 'foto', 'usuario', 'esMenorDeEdad', 'seudonimo']) {
      expect(visto).not.toHaveProperty(campo)
    }
    expect(visto.redes ?? []).toEqual([])
    expect(JSON.stringify(visto)).not.toMatch(/Valeria|Quiñones|valeria\.privada/)
  })

  it('does not allow probing hidden fields through filters', async () => {
    // Payload refuses to filter on a field the requester cannot read.
    await expect(
      payload.find({
        collection: 'autores',
        where: { apellido: { like: 'Quiñones' } },
        overrideAccess: false,
      }),
    ).rejects.toThrow(/apellido/)
  })

  it('still shows adult authors normally', async () => {
    const adulta = await payload.findByID({
      collection: 'autores',
      id: m.autorAna.id,
      overrideAccess: false,
    })
    expect(adulta.nombrePublico).toBe('Ana Rivera Soto')
    expect(adulta.apellido).toBe('Rivera Soto')
    expect(adulta).not.toHaveProperty('usuario')
  })

  it('keeps the minor protected when the author is embedded in an article', async () => {
    const articulo = await payload.create({
      collection: 'articulos',
      data: {
        titulo: 'Carta desde el salón',
        cuerpo,
        categoria: m.categoria.id,
        autores: [m.estudiante.id],
        tipo: 'carta_estudiante',
        region: 'puerto_rico',
        estadoEditorial: 'borrador',
        _status: 'published',
      },
      user: como(m.editor),
      overrideAccess: false,
    })
    const publico = await payload.findByID({
      collection: 'articulos',
      id: articulo.id,
      depth: 2,
      overrideAccess: false,
    })
    expect(JSON.stringify(publico)).not.toMatch(/Valeria|Quiñones|valeria\.privada|prueba\.test/)
    expect(JSON.stringify(publico)).toContain('Coquí de Salón')
  })

  it('lets staff see the full profile, and writers edit only their own', async () => {
    const interno = await payload.findByID({
      collection: 'autores',
      id: m.estudiante.id,
      user: como(m.editor),
      overrideAccess: false,
    })
    expect(interno.apellido).toBe('Quiñones Marrero')

    await expect(
      payload.update({
        collection: 'autores',
        id: m.estudiante.id,
        data: { bio: 'Editado por otra persona' },
        user: como(m.ana),
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    // The owner cannot remove their own minor protection.
    const propio = await payload.update({
      collection: 'autores',
      id: m.estudiante.id,
      data: { esMenorDeEdad: false, bio: 'Me gusta escribir.' },
      user: como(m.luis),
      overrideAccess: false,
    })
    expect(propio.bio).toBe('Me gusta escribir.')
    expect(propio.esMenorDeEdad).toBe(true)
  })
})

describe('buzón y ajustes', () => {
  it('keeps messages and subscribers closed to the public API', async () => {
    await expect(
      payload.create({
        collection: 'mensajes',
        data: { tipo: 'contacto', asunto: 'Hola', mensaje: 'Spam', estado: 'nuevo' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    await expect(
      payload.find({ collection: 'suscriptores', overrideAccess: false }),
    ).rejects.toThrow()
    await expect(
      payload.find({ collection: 'mensajes', user: como(m.ana), overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('lets the public read site settings but only editors change them', async () => {
    const ajustes = await payload.findGlobal({ slug: 'ajustes', overrideAccess: false })
    expect(ajustes.nombre).toBe('La Pizarra')
    await expect(
      payload.updateGlobal({
        slug: 'ajustes',
        data: { lema: 'Cambiado' },
        user: como(m.ana),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
