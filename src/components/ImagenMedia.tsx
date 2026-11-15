import type { Media } from '@/payload-types'

type Props = {
  media: Media
  /** CSS `sizes` hint, e.g. "(min-width: 768px) 60vw, 100vw". */
  tamanos: string
  /** True for the one image at the top of the page (loads first). */
  prioridad?: boolean
  className?: string
  /** Override the stored alt text (pass "" when the image is decorative). */
  alt?: string
}

const NOMBRES = ['pequena', 'mediana', 'grande', 'enorme'] as const

/**
 * Responsive image built from the WebP sizes Payload generated at upload.
 * Plain <img> with srcset on purpose: no image-optimisation service needed,
 * and phones on slow connections download only the size they need.
 */
export function ImagenMedia({ media, tamanos, prioridad = false, className, alt }: Props) {
  const candidatos = NOMBRES.map((nombre) => media.sizes?.[nombre]).filter(
    (t): t is { url: string; width: number; height: number } =>
      Boolean(t?.url && t.width && t.height),
  )
  // Sizes are skipped when the original is smaller; fall back to the original.
  const mayor = candidatos.at(-1)
  const src = mayor?.url ?? media.url
  if (!src) return null

  const srcSet = candidatos.length
    ? candidatos.map((t) => `${t.url} ${t.width}w`).join(', ')
    : undefined

  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized by Payload; see comment above
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? tamanos : undefined}
      width={mayor?.width ?? media.width ?? undefined}
      height={mayor?.height ?? media.height ?? undefined}
      alt={alt ?? media.alt}
      loading={prioridad ? 'eager' : 'lazy'}
      fetchPriority={prioridad ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  )
}
