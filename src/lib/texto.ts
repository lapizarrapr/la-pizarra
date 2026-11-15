/**
 * Pure text helpers: slugs, initials, plain text from rich text, reading time.
 */

/** "Educación Pública: ¿qué sigue?" → "educacion-publica-que-sigue" */
export const aSlug = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents (ñ → n, ü → u)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
    .replace(/-+$/g, '')

/** "Ana María" + "Rivera Soto" → "A. M. R. S." */
export const aIniciales = (...partes: (string | null | undefined)[]): string =>
  partes
    .filter((parte): parte is string => Boolean(parte))
    .flatMap((parte) => parte.trim().split(/\s+/))
    .filter(Boolean)
    .map((palabra) => `${palabra[0]!.toLocaleUpperCase('es')}.`)
    .join(' ')

type NodoLexical = {
  type?: string
  text?: string
  children?: NodoLexical[]
  fields?: Record<string, unknown>
}

const NODOS_DE_BLOQUE = new Set(['paragraph', 'heading', 'quote', 'listitem', 'block'])

/**
 * Flattens a Lexical editor document into plain text. Used for search indexing
 * and reading time. Includes pull-quote text; ignores embeds and images.
 */
export const textoDesdeLexical = (documento: unknown): string => {
  const raiz = (documento as { root?: NodoLexical } | null | undefined)?.root
  if (!raiz) return ''

  const partes: string[] = []

  const recorrer = (nodo: NodoLexical): void => {
    if (typeof nodo.text === 'string') partes.push(nodo.text)
    if (nodo.type === 'linebreak') partes.push(' ')
    if (nodo.type === 'block' && typeof nodo.fields?.cita === 'string') {
      partes.push(nodo.fields.cita)
    }
    nodo.children?.forEach(recorrer)
    if (nodo.type && NODOS_DE_BLOQUE.has(nodo.type)) partes.push('\n')
  }

  recorrer(raiz)

  return partes
    .join('')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

export const contarPalabras = (texto: string): number => texto.split(/\s+/).filter(Boolean).length

const PALABRAS_POR_MINUTO = 200

/** Estimated reading time in whole minutes (minimum 1). */
export const tiempoDeLectura = (texto: string): number =>
  Math.max(1, Math.ceil(contarPalabras(texto) / PALABRAS_POR_MINUTO))
