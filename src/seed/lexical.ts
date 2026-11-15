/**
 * Tiny builders for Lexical editor documents, used by the seed script and tests.
 */
type Nodo = { [k: string]: unknown; type: string; version: number }

const base = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }

const texto = (contenido: string): Nodo => ({
  type: 'text',
  text: contenido,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

export const parrafo = (contenido: string): Nodo => ({
  ...base,
  type: 'paragraph',
  textFormat: 0,
  textStyle: '',
  children: [texto(contenido)],
})

export const titulo = (contenido: string, tag: 'h2' | 'h3' = 'h2'): Nodo => ({
  ...base,
  type: 'heading',
  tag,
  children: [texto(contenido)],
})

export const cita = (frase: string, atribucion?: string): Nodo => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { blockType: 'citaDestacada', blockName: '', cita: frase, atribucion },
})

/** Strings become paragraphs; pass `titulo()` / `cita()` nodes for the rest. */
export const documento = (...partes: (string | Nodo)[]) => ({
  root: {
    ...base,
    type: 'root',
    children: partes.map((parte) => (typeof parte === 'string' ? parrafo(parte) : parte)),
  },
})
