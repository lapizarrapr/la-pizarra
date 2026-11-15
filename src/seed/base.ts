/**
 * The site's skeleton: sections, static pages and menus. Shared by the
 * development seed (`pnpm seed`) and by the first production deploy
 * (`src/seed/inicial.ts`). Nothing here is sample journalism.
 */
import type { Payload } from 'payload'

import { aSlug } from '@/lib/texto'

import { CATEGORIAS, PAGINAS } from './contenido'
import { documento } from './lexical'

/** Creates the nine sections. Returns their ids by name. */
export const crearSecciones = async (payload: Payload): Promise<Map<string, number>> => {
  const categorias = new Map<string, number>()
  for (const [i, [nombre, descripcion]] of CATEGORIAS.entries()) {
    const doc = await payload.create({
      collection: 'categorias',
      data: { nombre, descripcion, orden: (i + 1) * 10 },
    })
    categorias.set(nombre, doc.id)
  }
  return categorias
}

/** Creates the five static pages (Sobre Nosotros, Contacto…), published. */
export const crearPaginas = async (payload: Payload): Promise<void> => {
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
}

/** Main menu with every section, and the footer columns. */
export const crearMenus = async (payload: Payload): Promise<void> => {
  await payload.updateGlobal({
    slug: 'navegacion',
    data: {
      principal: CATEGORIAS.map(([nombre]) => ({
        etiqueta: nombre,
        enlace: `/seccion/${aSlug(nombre)}`,
      })),
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
}

export const IDENTIDAD = {
  nombre: 'La Pizarra',
  lema: 'Periodismo desde el salón de clases',
  descripcion:
    'Noticias, reportajes y opinión sobre la educación pública de Puerto Rico, escritos por maestras, maestros y estudiantes.',
}
