import { randomBytes } from 'crypto'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Autore, Categoria, Usuario } from '@/payload-types'

/** A fresh strong password per run; nothing is hard-coded. */
export const contrasenaDePrueba = (): string => `Aa1-${randomBytes(12).toString('hex')}`

const COLECCIONES = [
  'vistas',
  'limites',
  'articulos',
  'paginas',
  'autores',
  'media',
  'categorias',
  'etiquetas',
  'mensajes',
  'suscriptores',
  'usuarios',
] as const

export const iniciarPayload = async (): Promise<Payload> => {
  if (!process.env.DATABASE_URL?.includes('_test')) {
    throw new Error('Integration tests must run against the *_test database.')
  }
  return getPayload({ config: await config })
}

export const vaciar = async (payload: Payload): Promise<void> => {
  for (const collection of COLECCIONES) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }
}

export type Mundo = {
  admin: Usuario
  editor: Usuario
  ana: Usuario
  luis: Usuario
  autorAna: Autore
  estudiante: Autore
  categoria: Categoria
}

/** One admin, one editor, two writers, an adult author and a minor author. */
export const crearMundo = async (payload: Payload): Promise<Mundo> => {
  const usuario = (nombre: string, rol: Usuario['rol']) =>
    payload.create({
      collection: 'usuarios',
      data: {
        nombre,
        rol,
        email: `${nombre.toLowerCase()}@prueba.test`,
        password: contrasenaDePrueba(),
      },
    })

  const admin = await usuario('Admin', 'admin')
  const editor = await usuario('Editora', 'editor')
  const ana = await usuario('Ana', 'colaborador')
  const luis = await usuario('Luis', 'colaborador')

  const autorAna = await payload.create({
    collection: 'autores',
    data: { nombre: 'Ana', apellido: 'Rivera Soto', usuario: ana.id },
  })
  const estudiante = await payload.create({
    collection: 'autores',
    data: {
      nombre: 'Valeria',
      apellido: 'Quiñones Marrero',
      esMenorDeEdad: true,
      seudonimo: 'Coquí de Salón',
      etiquetaDeRol: 'Estudiante de escuela superior',
      redes: [{ plataforma: 'instagram', url: 'https://instagram.com/valeria.privada' }],
      usuario: luis.id,
    },
  })
  const categoria = await payload.create({
    collection: 'categorias',
    data: { nombre: 'Educación Pública' },
  })

  return { admin, editor, ana, luis, autorAna, estudiante, categoria }
}

/** Shape Payload expects for `user` in Local API calls. */
export const como = (usuario: Usuario) => ({ ...usuario, collection: 'usuarios' as const })
