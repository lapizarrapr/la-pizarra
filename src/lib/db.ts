/**
 * Direct access to the Postgres connection pool Payload already holds, for
 * the few queries Payload's API cannot express (full-text search, counters,
 * aggregates). Always use bound parameters ($1, $2, …) with it.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

type Pool = {
  query: <F = Record<string, unknown>>(
    texto: string,
    valores?: unknown[],
  ) => Promise<{ rows: F[]; rowCount: number | null }>
}

export const db = async (): Promise<Pool> => {
  const payload = await getPayload({ config })
  return (payload.db as unknown as { pool: Pool }).pool
}
