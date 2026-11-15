import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { mesesDeArchivo } from '@/lib/datos'
import { nombreDelMes } from '@/lib/fechas'
import { diccionario, esLocale } from '@/lib/i18n'
import { absoluta, rutas } from '@/lib/rutas'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = diccionario(locale)
  return {
    title: t.archivo,
    description: t.archivoDescripcion,
    alternates: { canonical: absoluta(rutas(locale).archivo()) },
  }
}

export default async function Archivo({ params }: Props) {
  const { locale } = await params
  if (!esLocale(locale)) notFound()
  const t = diccionario(locale)
  const r = rutas(locale)
  const meses = await mesesDeArchivo()
  const anios = [...new Set(meses.map((m) => m.anio))]

  return (
    <div className="contenedor pt-8">
      <header className="border-tinta mb-8 flex flex-col gap-2 border-b pb-6">
        <h1 className="text-[clamp(2rem,6vw,3rem)] font-extrabold">{t.archivo}</h1>
        <p className="text-gris text-lg">{t.archivoDescripcion}</p>
      </header>

      {meses.length === 0 && <p className="text-gris">{t.sinArticulos}</p>}

      <div className="flex flex-col gap-10">
        {anios.map((anio) => (
          <section key={anio} aria-labelledby={`anio-${anio}`}>
            <h2 id={`anio-${anio}`} className="mb-3 text-3xl font-bold tabular-nums">
              {anio}
            </h2>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {meses
                .filter((m) => m.anio === anio)
                .map((m) => (
                  <li key={m.mes} className="border-linea border-b">
                    <Link
                      href={r.mes(m.anio, m.mes)}
                      className="font-ui flex items-baseline justify-between gap-4 py-3 capitalize hover:underline"
                    >
                      <span className="font-semibold">
                        {nombreDelMes(m.anio, m.mes).split(' de ')[0]}
                      </span>
                      <span className="meta normal-case tabular-nums">{t.articulos(m.total)}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
