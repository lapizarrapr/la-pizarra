import Link from 'next/link'

import { poblado } from '@/lib/datos'
import type { Diccionario } from '@/lib/i18n'
import { rutas } from '@/lib/rutas'
import type { Autore, Media } from '@/payload-types'

import { ImagenMedia } from './ImagenMedia'

/** "Ana María Rivera" → "AR"; "Pitirre de Undécimo" → "PU". */
const iniciales = (nombre: string): string => {
  const palabras = nombre.split(/\s+/).filter((p) => /^\p{Lu}/u.test(p))
  const elegidas = palabras.length > 1 ? [palabras[0]!, palabras.at(-1)!] : palabras
  return elegidas.map((p) => p[0]).join('') || nombre.charAt(0).toLocaleUpperCase('es')
}

/**
 * "About the author" box at the end of an article: photo, short description
 * and bio, with a link to everything they have written.
 *
 * Student safety needs no special code here: for authors marked as minors
 * the API has already removed the photo, real name and social links before
 * this component ever sees them, so it shows the pen name and a monogram.
 */
export function CajaDeAutores({
  autores,
  locale,
  t,
}: {
  autores: Autore[]
  locale: string
  t: Diccionario
}) {
  // Nothing useful to show for a profile with neither description nor bio.
  const conPerfil = autores.filter((a) => a.nombrePublico && (a.bio || a.etiquetaDeRol))
  if (!conPerfil.length) return null
  const r = rutas(locale)

  return (
    <section aria-labelledby="quien-firma" className="border-tinta border-t-2 pt-5">
      <h2
        id="quien-firma"
        className="font-ui text-acento mb-4 text-[0.8125rem] leading-none font-bold tracking-widest uppercase"
      >
        {t.quienFirma}
      </h2>
      <ul className="flex flex-col gap-6">
        {conPerfil.map((autor) => {
          const foto = poblado<Media>(autor.foto)
          const nombre = autor.nombrePublico!
          return (
            <li key={autor.id} className="grid grid-cols-[4.5rem_1fr] gap-4">
              {foto ? (
                <ImagenMedia
                  media={foto}
                  alt=""
                  tamanos="72px"
                  className="size-18 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="bg-pizarra text-tiza font-display grid size-18 place-items-center rounded-full text-2xl font-bold"
                >
                  {iniciales(nombre)}
                </span>
              )}
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-display text-xl leading-tight font-bold">
                  {autor.slug ? (
                    <Link href={r.autor(autor.slug)} className="enlace-titular">
                      {nombre}
                    </Link>
                  ) : (
                    nombre
                  )}
                </p>
                {autor.etiquetaDeRol && <p className="meta">{autor.etiquetaDeRol}</p>}
                {autor.bio && <p className="text-[1.0625rem] leading-relaxed">{autor.bio}</p>}
                {autor.slug && (
                  <p className="font-ui mt-1 text-sm font-semibold">
                    <Link
                      href={r.autor(autor.slug)}
                      className="text-acento underline underline-offset-4"
                    >
                      {t.masDeEstaFirma}
                      <span className="sr-only">: {nombre}</span>
                    </Link>
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
