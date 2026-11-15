/**
 * Search behind a small interface, so the engine can be swapped later
 * (Algolia, Meilisearch, …) without touching any page: write another
 * `ProveedorDeBusqueda` and return it from `proveedorDeBusqueda()`.
 */
import { proveedorPostgres } from './postgres'

export type ConsultaDeBusqueda = {
  texto: string
  locale: string
  pagina: number
  porPagina: number
}

export type ResultadoDeBusqueda = {
  /** Article ids, best match first. Pages load the articles through the normal access-controlled path. */
  ids: number[]
  total: number
}

export interface ProveedorDeBusqueda {
  buscar(consulta: ConsultaDeBusqueda): Promise<ResultadoDeBusqueda>
}

export const LARGO_MAXIMO_DE_CONSULTA = 100

/** Trims, collapses whitespace and caps the length of what the reader typed. */
export const limpiarConsulta = (valor: unknown): string =>
  (typeof valor === 'string' ? valor : '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LARGO_MAXIMO_DE_CONSULTA)

export const proveedorDeBusqueda = (): ProveedorDeBusqueda => proveedorPostgres
