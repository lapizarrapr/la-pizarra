import type { Payload } from 'payload'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { enlaceDeBaja, proveedorDeBoletin } from '@/lib/newsletter'
import { dentroDelLimite } from '@/lib/proteccion'

import { iniciarPayload } from '../helpers/payload'

let payload: Payload
const enviados: { to?: unknown; text?: unknown }[] = []

const limpiar = async () => {
  await payload.delete({ collection: 'suscriptores', where: { id: { exists: true } } })
  await payload.delete({ collection: 'limites', where: { id: { exists: true } } })
}

const suscriptor = async (email: string) =>
  (await payload.find({ collection: 'suscriptores', where: { email: { equals: email } } })).docs[0]

const tokenDelUltimoCorreo = (): string => {
  const texto = String(enviados.at(-1)?.text ?? '')
  return new URL(texto.match(/https?:\/\/\S+/)![0]).searchParams.get('token')!
}

beforeAll(async () => {
  payload = await iniciarPayload()
  vi.spyOn(payload, 'sendEmail').mockImplementation(async (mensaje) => {
    enviados.push(mensaje as { to?: unknown; text?: unknown })
  })
  await limpiar()
})

beforeEach(() => {
  enviados.length = 0
})

afterAll(async () => {
  await limpiar()
  vi.restoreAllMocks()
})

describe('boletín: doble confirmación', () => {
  const boletin = proveedorDeBoletin()
  const email = 'lectora@prueba.test'

  it('a new address is pending until confirmed, and gets one email', async () => {
    await boletin.suscribir(email)
    const s = await suscriptor(email)
    expect(s?.estado).toBe('pendiente')
    expect(enviados).toHaveLength(1)
    expect(enviados[0]?.to).toBe(email)
  })

  it('stores only a hash of the token, and never exposes it', async () => {
    const token = tokenDelUltimoCorreoDe(email)
    const crudo = await payload.find({
      collection: 'suscriptores',
      where: { email: { equals: email } },
      showHiddenFields: true,
    })
    expect(JSON.stringify(crudo.docs[0])).not.toContain(token)
  })

  it('rejects wrong or malformed tokens', async () => {
    expect(await boletin.confirmar('token-que-no-existe-0123456789')).toBe('invalido')
    expect(await boletin.confirmar("' OR 1=1 --")).toBe('invalido')
    expect((await suscriptor(email))?.estado).toBe('pendiente')
  })

  it('confirms with the emailed token, once', async () => {
    await boletin.suscribir(email)
    const token = tokenDelUltimoCorreo()
    expect(await boletin.confirmar(token)).toBe('ok')
    const s = await suscriptor(email)
    expect(s?.estado).toBe('confirmado')
    expect(s?.confirmadoEn).toBeTruthy()
    expect(await boletin.confirmar(token)).toBe('invalido')
  })

  it('does not email someone who is already subscribed', async () => {
    await boletin.suscribir(email)
    expect(enviados).toHaveLength(0)
    expect((await suscriptor(email))?.estado).toBe('confirmado')
  })

  it('rejects expired tokens', async () => {
    const otro = 'tarde@prueba.test'
    await boletin.suscribir(otro)
    const token = tokenDelUltimoCorreo()
    const s = await suscriptor(otro)
    await payload.update({
      collection: 'suscriptores',
      id: s!.id,
      data: { tokenExpira: new Date(Date.now() - 1000).toISOString() },
    })
    expect(await boletin.confirmar(token)).toBe('invalido')
  })

  it('unsubscribes only with a correctly signed link', async () => {
    const s = await suscriptor(email)
    const url = new URL(enlaceDeBaja(s!.id))
    const id = url.searchParams.get('id')!
    const firma = url.searchParams.get('firma')!

    expect(await boletin.darDeBaja(id, 'firma-falsa')).toBe('invalido')
    expect(await boletin.darDeBaja(String(Number(id) + 1), firma)).toBe('invalido')
    expect((await suscriptor(email))?.estado).toBe('confirmado')

    expect(await boletin.darDeBaja(id, firma)).toBe('ok')
    expect((await suscriptor(email))?.estado).toBe('baja')
  })

  it('lets someone who left subscribe again, with a new confirmation', async () => {
    await boletin.suscribir(email)
    expect(enviados).toHaveLength(1)
    expect((await suscriptor(email))?.estado).toBe('pendiente')
  })

  // Helper kept next to its only use: subscribes again to read a fresh token.
  function tokenDelUltimoCorreoDe(direccion: string): string {
    const ultimo = [...enviados].reverse().find((m) => m.to === direccion) ?? enviados.at(-1)
    const texto = String(ultimo?.text ?? '')
    const enlace = texto.match(/https?:\/\/\S+/)
    return enlace ? new URL(enlace[0]).searchParams.get('token')! : 'sin-token'
  }
})

describe('límite de envíos por hora', () => {
  it('allows up to the limit and then blocks, per action and per visitor', async () => {
    const ip = '203.0.113.50'
    const intentos = []
    for (let i = 0; i < 4; i++) intentos.push(await dentroDelLimite('prueba', ip, 3))
    expect(intentos).toEqual([true, true, true, false])

    expect(await dentroDelLimite('prueba', '203.0.113.51', 3)).toBe(true)
    expect(await dentroDelLimite('otra-accion', ip, 3)).toBe(true)
  })

  it('keeps no IP address in the database', async () => {
    const { docs } = await payload.find({ collection: 'limites', limit: 50 })
    expect(docs.length).toBeGreaterThan(0)
    expect(JSON.stringify(docs)).not.toContain('203.0.113')
  })
})
