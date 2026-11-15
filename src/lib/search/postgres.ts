/**
 * PostgreSQL full-text search over title, dek and body.
 *
 * - Spanish stemming ("escuelas" finds "escuela") and accent-insensitive
 *   ("educacion" finds "educación") through the `unaccent` extension, which
 *   the Payload adapter enables (see payload.config.ts).
 * - Title matches rank above dek matches, which rank above body matches.
 * - `websearch_to_tsquery` accepts what people naturally type: plain words,
 *   "exact phrases" and -excluded words, and never throws on odd input.
 * - Only published articles are searched, and the reader's text is always
 *   passed as a bound parameter (never concatenated into SQL).
 *
 * The vector is computed per query. That is fast for a few thousand
 * articles; if the archive grows much larger, add a stored tsvector column
 * with a GIN index in a migration and query that instead.
 */
import { db } from '../db'
import type { ProveedorDeBusqueda } from './index'

const SQL = `
  WITH consulta AS (SELECT websearch_to_tsquery('spanish', unaccent($1)) AS q),
  candidatos AS (
    SELECT a.id, a.fecha_publicacion,
      setweight(to_tsvector('spanish', unaccent(coalesce(l.titulo, ''))), 'A') ||
      setweight(to_tsvector('spanish', unaccent(coalesce(l.subtitulo, ''))), 'B') ||
      setweight(to_tsvector('spanish', unaccent(coalesce(l.texto_plano, ''))), 'D') AS vector
    FROM articulos a
    JOIN articulos_locales l ON l._parent_id = a.id AND l._locale = $2
    WHERE a._status = 'published'
  )
  SELECT c.id, count(*) OVER() AS total
  FROM candidatos c, consulta
  WHERE c.vector @@ consulta.q
  ORDER BY ts_rank(c.vector, consulta.q) DESC, c.fecha_publicacion DESC NULLS LAST
  LIMIT $3 OFFSET $4
`

export const proveedorPostgres: ProveedorDeBusqueda = {
  async buscar({ texto, locale, pagina, porPagina }) {
    if (!texto) return { ids: [], total: 0 }
    const { rows } = await (
      await db()
    ).query<{ id: number; total: string }>(SQL, [
      texto,
      locale,
      porPagina,
      (Math.max(1, pagina) - 1) * porPagina,
    ])
    return { ids: rows.map((fila) => fila.id), total: Number(rows[0]?.total ?? 0) }
  },
}
