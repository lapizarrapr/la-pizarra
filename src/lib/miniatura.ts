type DocDeMedia = {
  _objectKey?: unknown
  filename?: unknown
  url?: unknown
  sizes?: Record<string, { filename?: unknown; url?: unknown } | undefined>
}

const texto = (valor: unknown): string | null => (typeof valor === 'string' && valor ? valor : null)

/**
 * Address of the small preview the admin shows for an image.
 *
 * Payload builds this from the URL stored in the database, which always points
 * at `/api/media/file/…`. With Cloudflare R2 the files are served straight from
 * the bucket and that route has nothing to serve (it answered 500 on the first
 * production deploy), so the preview is built from the bucket address instead.
 * Without R2 (local development) the stored URL is correct and is used as is.
 */
export const miniaturaDeAdmin = (
  doc: DocDeMedia,
  basePublica: string | undefined,
  tamano = 'pequena',
): string | null => {
  const version = doc.sizes?.[tamano]
  const archivo = texto(version?.filename) ?? texto(doc.filename)
  if (!basePublica) return texto(version?.url) ?? texto(doc.url)
  if (!archivo) return null
  const carpeta = texto(doc._objectKey)
  return `${basePublica.replace(/\/+$/, '')}/${carpeta ? `${carpeta}/` : ''}${archivo}`
}
