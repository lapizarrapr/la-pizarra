import type { Diccionario } from '@/lib/i18n'

import { CopiarEnlace } from './cliente/CopiarEnlace'

type Props = { url: string; titulo: string; t: Diccionario }

/**
 * Share buttons. Plain links (no third-party scripts, nothing loads until
 * the reader taps). WhatsApp goes first: it is how most readers in Puerto
 * Rico pass news along.
 */
export function Compartir({ url, titulo, t }: Props) {
  const u = encodeURIComponent(url)
  const texto = encodeURIComponent(titulo)
  const base =
    'border-tinta font-ui hover:bg-superficie inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold'

  const redes = [
    { nombre: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { nombre: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${texto}` },
  ]

  return (
    <section aria-label={t.compartir}>
      <ul className="flex flex-wrap gap-2">
        <li>
          <a
            href={`https://wa.me/?text=${texto}%20${u}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-acento text-fondo font-ui inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
          >
            {t.compartirPor('WhatsApp')}
          </a>
        </li>
        {redes.map((red) => (
          <li key={red.nombre}>
            <a
              href={red.href}
              target="_blank"
              rel="noopener noreferrer"
              className={base}
              aria-label={t.compartirPor(red.nombre)}
            >
              {red.nombre}
            </a>
          </li>
        ))}
        <li>
          <a
            href={`mailto:?subject=${texto}&body=${u}`}
            className={base}
            aria-label={t.compartirPor(t.correo)}
          >
            {t.correo}
          </a>
        </li>
        <li>
          <CopiarEnlace
            url={url}
            etiqueta={t.copiarEnlace}
            copiado={t.enlaceCopiado}
            className={base}
          />
        </li>
      </ul>
    </section>
  )
}
