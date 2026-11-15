import config from '@payload-config'
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { getPayload } from 'payload'

import { correoConfirmarBoletin } from '../email/plantillas'
import { SITIO } from '../rutas'
import type { ProveedorDeBoletin } from './index'

const VIGENCIA_MS = 48 * 3600 * 1000

/** Only a hash of the confirmation token is stored, like a password. */
export const hashDeToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex')

const firmar = (id: string): string =>
  createHmac('sha256', process.env.PAYLOAD_SECRET || 'solo-desarrollo')
    .update(`baja|${id}`)
    .digest('base64url')

const firmaValida = (id: string, firma: string): boolean => {
  const [a, b] = [Buffer.from(firmar(id)), Buffer.from(firma)]
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Permanent unsubscribe link for a subscriber. Include it in every newsletter. */
export const enlaceDeBaja = (id: number | string): string =>
  `${SITIO}/boletin/baja?${new URLSearchParams({ id: String(id), firma: firmar(String(id)) })}`

export const proveedorPayload: ProveedorDeBoletin = {
  async suscribir(email) {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'suscriptores',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    })
    const existente = docs[0]
    if (existente?.estado === 'confirmado') return

    const token = randomBytes(32).toString('base64url')
    const datos = {
      estado: 'pendiente' as const,
      tokenHash: hashDeToken(token),
      tokenExpira: new Date(Date.now() + VIGENCIA_MS).toISOString(),
      bajaEn: null,
    }
    if (existente) {
      await payload.update({ collection: 'suscriptores', id: existente.id, data: datos })
    } else {
      await payload.create({ collection: 'suscriptores', data: { email, ...datos } })
    }

    const url = `${SITIO}/boletin/confirmar?${new URLSearchParams({ token })}`
    await payload.sendEmail({ to: email, ...correoConfirmarBoletin(url) })
  },

  async confirmar(token) {
    if (!/^[\w-]{20,100}$/.test(token)) return 'invalido'
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'suscriptores',
      where: {
        and: [
          { tokenHash: { equals: hashDeToken(token) } },
          { tokenExpira: { greater_than: new Date().toISOString() } },
        ],
      },
      limit: 1,
      depth: 0,
    })
    const suscriptor = docs[0]
    if (!suscriptor) return 'invalido'

    await payload.update({
      collection: 'suscriptores',
      id: suscriptor.id,
      data: {
        estado: 'confirmado',
        confirmadoEn: new Date().toISOString(),
        tokenHash: null,
        tokenExpira: null,
      },
    })
    return 'ok'
  },

  async darDeBaja(id, firma) {
    if (!/^\d{1,12}$/.test(id) || !firmaValida(id, firma)) return 'invalido'
    const payload = await getPayload({ config })
    try {
      await payload.update({
        collection: 'suscriptores',
        id: Number(id),
        data: {
          estado: 'baja',
          bajaEn: new Date().toISOString(),
          tokenHash: null,
          tokenExpira: null,
        },
      })
    } catch {
      // Already deleted: the person is not subscribed, which is what they asked for.
    }
    return 'ok'
  },
}
