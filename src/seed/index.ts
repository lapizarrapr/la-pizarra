/**
 * Fills the LOCAL development database with fictional sample content.
 *
 *   pnpm seed
 *
 * It deletes existing content first, so it refuses to run in production.
 */
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '@/payload.config'
import { aSlug } from '@/lib/texto'
import { validarContrasena } from '@/lib/contrasena'

import { ARTICULOS, CATEGORIAS, ETIQUETAS, PAGINAS, type AutorClave } from './contenido'
import { documento } from './lexical'

const COLECCIONES = [
  'vistas',
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

const xml = (texto: string) => texto.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** A flat placeholder "photo" so the layouts have real images to work with. */
const imagenDeMuestra = async (color: string, rotulo: string): Promise<Buffer> =>
  sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#111"/>
        </linearGradient></defs>
        <rect width="1600" height="900" fill="url(#g)"/>
        <text x="80" y="800" font-family="Georgia, serif" font-size="54" fill="#f7f5ef" opacity="0.85">${xml(rotulo)}</text>
        <text x="80" y="110" font-family="Arial, sans-serif" font-size="30" fill="#f7f5ef" opacity="0.6">IMAGEN DE MUESTRA</text>
      </svg>`,
    ),
  )
    .png()
    .toBuffer()

const sembrar = async (payload: Payload): Promise<void> => {
  const log = (mensaje: string) => payload.logger.info(`[seed] ${mensaje}`)

  const contrasena = process.env.SEED_PASSWORD ?? ''
  if (validarContrasena(contrasena) !== true) {
    throw new Error(
      'Define SEED_PASSWORD en .env con una contraseña fuerte (12+ caracteres) antes de sembrar.',
    )
  }

  log('Borrando contenido anterior…')
  for (const collection of COLECCIONES) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }

  log('Usuarios y autores…')
  const usuario = (nombre: string, email: string, rol: 'admin' | 'editor' | 'colaborador') =>
    payload.create({ collection: 'usuarios', data: { nombre, email, rol, password: contrasena } })

  await usuario('Administración', 'admin@lapizarra.test', 'admin')
  const uRafael = await usuario('Rafael Méndez Colón', 'editor@lapizarra.test', 'editor')
  const uCarmen = await usuario('Carmen Ortiz Vélez', 'maestra@lapizarra.test', 'colaborador')
  const uPitirre = await usuario(
    'Estudiante de muestra',
    'estudiante@lapizarra.test',
    'colaborador',
  )

  const autores: Record<AutorClave, number> = {
    carmen: (
      await payload.create({
        collection: 'autores',
        data: {
          nombre: 'Carmen',
          apellido: 'Ortiz Vélez',
          etiquetaDeRol: 'Maestra de Español, Caguas',
          bio: 'Enseña español en escuela intermedia desde hace 14 años. Escribe sobre comunidades escolares y educación especial.',
          usuario: uCarmen.id,
        },
      })
    ).id,
    rafael: (
      await payload.create({
        collection: 'autores',
        data: {
          nombre: 'Rafael',
          apellido: 'Méndez Colón',
          etiquetaDeRol: 'Maestro de Historia, Ponce',
          bio: 'Maestro de historia y editor de La Pizarra. Cubre presupuesto, magisterio y pensiones.',
          usuario: uRafael.id,
        },
      })
    ).id,
    pitirre: (
      await payload.create({
        collection: 'autores',
        data: {
          nombre: 'Estudiante',
          apellido: 'De Muestra',
          esMenorDeEdad: true,
          seudonimo: 'Pitirre de Undécimo',
          etiquetaDeRol: 'Estudiante de escuela superior',
          bio: 'Escribe desde la fila del comedor.',
          usuario: uPitirre.id,
        },
      })
    ).id,
  }

  log('Secciones y etiquetas…')
  const categorias = new Map<string, number>()
  for (const [i, [nombre, descripcion]] of CATEGORIAS.entries()) {
    const doc = await payload.create({
      collection: 'categorias',
      data: { nombre, descripcion, orden: (i + 1) * 10 },
    })
    categorias.set(nombre, doc.id)
  }
  const etiquetas = new Map<string, number>()
  for (const nombre of ETIQUETAS) {
    const doc = await payload.create({ collection: 'etiquetas', data: { nombre } })
    etiquetas.set(nombre, doc.id)
  }

  log('Artículos…')
  const ahora = Date.now()
  const publicados: number[] = []
  for (const [i, a] of ARTICULOS.entries()) {
    let imagenDestacada: number | undefined
    if (a.imagen) {
      const data = await imagenDeMuestra(a.imagen.color, a.categoria)
      const media = await payload.create({
        collection: 'media',
        data: { alt: a.imagen.alt, credito: 'Ilustración de muestra / La Pizarra' },
        file: {
          data,
          mimetype: 'image/png',
          name: `muestra-${aSlug(a.titulo).slice(0, 40)}.png`,
          size: data.length,
        },
      })
      imagenDestacada = media.id
    }

    const publicar = a.haceDias !== undefined
    const doc = await payload.create({
      collection: 'articulos',
      draft: !publicar,
      data: {
        titulo: a.titulo,
        subtitulo: a.subtitulo,
        cuerpo: a.cuerpo,
        imagenDestacada,
        autores: a.autores.map((clave) => autores[clave]),
        categoria: categorias.get(a.categoria)!,
        etiquetas: a.etiquetas.map((nombre) => etiquetas.get(nombre)!),
        tipo: a.tipo,
        region: a.region ?? 'puerto_rico',
        municipio: a.municipio as never,
        destacado: a.destacado ?? false,
        ultimaHora: a.ultimaHora ?? false,
        feDeErrata: a.feDeErrata,
        estadoEditorial: a.estado ?? 'borrador',
        creadoPor:
          a.autores[0] === 'rafael'
            ? uRafael.id
            : a.autores[0] === 'carmen'
              ? uCarmen.id
              : uPitirre.id,
        // Stagger times so "latest" ordering is stable and realistic.
        fechaPublicacion: publicar
          ? new Date(ahora - a.haceDias! * 86_400_000 - i * 37 * 60_000).toISOString()
          : undefined,
        _status: publicar ? 'published' : 'draft',
      },
    })
    if (publicar) publicados.push(doc.id)
  }

  log('Páginas…')
  for (const p of PAGINAS) {
    await payload.create({
      collection: 'paginas',
      data: {
        titulo: p.titulo,
        slug: p.slug,
        introduccion: p.introduccion,
        bloques: [
          { blockType: 'texto', contenido: documento(...p.bloques) },
          ...('formulario' in p && p.formulario
            ? [{ blockType: 'formulario' as const, tipo: p.formulario }]
            : []),
        ],
        _status: 'published',
      },
    })
  }

  log('Ajustes, menús y portada…')
  await payload.updateGlobal({
    slug: 'ajustes',
    data: {
      nombre: 'La Pizarra',
      lema: 'Periodismo desde el salón de clases',
      descripcion:
        'Noticias, reportajes y opinión sobre la educación pública de Puerto Rico, escritos por maestras, maestros y estudiantes.',
      cintillo: {
        activo: true,
        texto: 'Tres escuelas de la montaña comienzan el semestre sin maestros de ciencia',
        articulo: publicados[0],
      },
    },
  })

  const enlaceSeccion = (nombre: string) => ({
    etiqueta: nombre,
    enlace: `/seccion/${aSlug(nombre)}`,
  })
  await payload.updateGlobal({
    slug: 'navegacion',
    data: {
      principal: CATEGORIAS.map(([nombre]) => enlaceSeccion(nombre)),
      pie: [
        {
          titulo: 'La Pizarra',
          enlaces: [
            { etiqueta: 'Sobre Nosotros', enlace: '/sobre-nosotros' },
            { etiqueta: 'Política Editorial', enlace: '/politica-editorial' },
            { etiqueta: 'Privacidad', enlace: '/privacidad' },
          ],
        },
        {
          titulo: 'Participa',
          enlaces: [
            { etiqueta: 'Cómo Colaborar', enlace: '/como-colaborar' },
            { etiqueta: 'Contacto', enlace: '/contacto' },
          ],
        },
      ],
      textoLegal: 'La Pizarra. Hecho por maestras, maestros y estudiantes de la escuela pública.',
    },
  })

  await payload.updateGlobal({
    slug: 'portada',
    data: {
      principal: publicados[0],
      secundarias: publicados.slice(1, 5),
      secciones: [
        'Presupuesto y Fondos',
        'Cierres de Escuelas',
        'Educación Especial',
        'Magisterio y Pensiones',
      ].map((nombre) => categorias.get(nombre)!),
    },
  })

  log(
    `Listo: ${ARTICULOS.length} artículos (${publicados.length} publicados), ${PAGINAS.length} páginas, 4 usuarios.`,
  )
  log(
    'Cuentas: admin@ / editor@ / maestra@ / estudiante@lapizarra.test · contraseña = SEED_PASSWORD en .env',
  )
}

const principal = async () => {
  const url = process.env.DATABASE_URL ?? ''
  const esLocal = /@(localhost|127\.0\.0\.1|postgres)[:/]/.test(url)
  if (process.env.NODE_ENV === 'production' || !esLocal) {
    throw new Error('El seed borra contenido y solo corre contra la base de datos local.')
  }

  const payload = await getPayload({ config: await config })
  try {
    await sembrar(payload)
  } finally {
    await payload.destroy()
  }
}

// Top-level await: `payload run` exits as soon as this module finishes loading.
await principal()
