/**
 * Rules that run just before something is deleted in the admin, so a delete
 * either works cleanly or stops with a message the editor can act on
 * (instead of a database error).
 */
import { APIError, type CollectionBeforeDeleteHook } from 'payload'

/** An article's view counters go with it. */
export const borrarVistasDelArticulo: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({
    collection: 'vistas',
    where: { articulo: { equals: id } },
    req,
  })
}

/**
 * Stops the deletion of a section or an author that articles still use, and
 * says how many, so no published article is left without a section or a byline.
 */
export const impedirSiTieneArticulos =
  (campo: 'categoria' | 'autores', queEs: string): CollectionBeforeDeleteHook =>
  async ({ id, req }) => {
    const { totalDocs } = await req.payload.count({
      collection: 'articulos',
      where: { [campo]: campo === 'autores' ? { contains: id } : { equals: id } },
      req,
    })
    if (totalDocs > 0) {
      const cuantos = totalDocs === 1 ? '1 artículo la usa' : `${totalDocs} artículos la usan`
      throw new APIError(
        `No se puede borrar esta ${queEs}: ${cuantos}. Cambia primero esos artículos y vuelve a intentarlo.`,
        409,
        undefined,
        true,
      )
    }
  }
