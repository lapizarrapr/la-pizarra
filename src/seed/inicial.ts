/**
 * First-deploy content for PRODUCTION: the nine sections, the five static
 * pages, the menus and the site identity. No sample articles, no accounts.
 *
 *   pnpm contenido:inicial      (runs by itself on every Vercel build)
 *
 * Safe to run any number of times: it only acts on a brand-new database
 * (no sections and no pages). It never deletes or overwrites anything.
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '@/payload.config'

import { crearMenus, crearPaginas, crearSecciones, IDENTIDAD } from './base'

const principal = async () => {
  const payload = await getPayload({ config: await config })
  const log = (mensaje: string) => payload.logger.info(`[contenido inicial] ${mensaje}`)
  try {
    const [secciones, paginas] = await Promise.all([
      payload.count({ collection: 'categorias' }),
      payload.count({ collection: 'paginas' }),
    ])
    if (secciones.totalDocs > 0 || paginas.totalDocs > 0) {
      log('El sitio ya tiene contenido. No se cambia nada.')
      return
    }

    log('Base de datos nueva: creando secciones, páginas y menús…')
    await crearSecciones(payload)
    await crearPaginas(payload)
    await crearMenus(payload)
    await payload.updateGlobal({ slug: 'ajustes', data: IDENTIDAD })
    log('Listo.')
  } finally {
    await payload.destroy()
  }
}

// Top-level await: `payload run` exits as soon as this module finishes loading.
await principal()
