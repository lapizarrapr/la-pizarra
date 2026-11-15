import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { documento } from '@/seed/lexical'

import { como, crearMundo, iniciarPayload, vaciar, type Mundo } from '../helpers/payload'

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

const nuevoArticulo = (titulo: string) =>
  payload.create({
    collection: 'articulos',
    data: {
      titulo,
      cuerpo: documento('Texto de prueba.'),
      categoria: m.categoria.id,
      autores: [m.autorAna.id],
      tipo: 'noticia',
      region: 'puerto_rico',
      estadoEditorial: 'borrador',
      _status: 'published',
    },
  })

describe('borrado', () => {
  it('deletes an article that readers have already viewed, with its counters', async () => {
    const articulo = await nuevoArticulo('Nota con visitas')
    await payload.create({
      collection: 'vistas',
      data: { articulo: articulo.id, dia: '2026-11-14', conteo: 7 },
    })

    await payload.delete({
      collection: 'articulos',
      id: articulo.id,
      user: como(m.editor),
      overrideAccess: false,
    })

    expect((await payload.find({ collection: 'vistas' })).totalDocs).toBe(0)
    expect((await payload.find({ collection: 'articulos', draft: true })).totalDocs).toBe(0)
  })

  it('refuses to delete a section or author that articles still use, and says why', async () => {
    const articulo = await nuevoArticulo('Nota que usa sección y firma')

    await expect(
      payload.delete({
        collection: 'categorias',
        id: m.categoria.id,
        user: como(m.editor),
        overrideAccess: false,
      }),
    ).rejects.toThrow(/No se puede borrar esta sección: 1 artículo la usa/)

    await expect(
      payload.delete({
        collection: 'autores',
        id: m.autorAna.id,
        user: como(m.editor),
        overrideAccess: false,
      }),
    ).rejects.toThrow(/No se puede borrar esta firma/)

    const sigue = await payload.findByID({ collection: 'categorias', id: m.categoria.id })
    expect(sigue.id).toBe(m.categoria.id)

    await payload.delete({ collection: 'articulos', id: articulo.id })
  })

  it('allows deleting a section or author nobody uses', async () => {
    const vacia = await payload.create({
      collection: 'categorias',
      data: { nombre: 'Sección vacía' },
    })
    await payload.delete({
      collection: 'categorias',
      id: vacia.id,
      user: como(m.editor),
      overrideAccess: false,
    })
    // The article from the previous test is gone, so the author is free now.
    await payload.delete({
      collection: 'autores',
      id: m.autorAna.id,
      user: como(m.editor),
      overrideAccess: false,
    })
    const resto = await payload.find({
      collection: 'categorias',
      where: { id: { equals: vacia.id } },
    })
    expect(resto.totalDocs).toBe(0)
  })
})
