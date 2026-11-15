import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BotonDeEnlace } from '@/components/cliente/Formularios'
import { diccionario, esLocale } from '@/lib/i18n'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ id?: string | string[]; firma?: string | string[] }>
}

const primero = (valor: string | string[] | undefined): string =>
  (Array.isArray(valor) ? valor[0] : valor) ?? ''

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { title: diccionario(locale).boletin.bajaTitulo, robots: { index: false, follow: false } }
}

// Opening the link only shows this page. Nothing changes until the person
// presses the button, so email scanners that pre-open links can't trigger it.
export default async function Pagina({ params, searchParams }: Props) {
  const { locale } = await params
  if (!esLocale(locale)) notFound()
  const t = diccionario(locale)
  const consulta = await searchParams

  return (
    <div className="contenedor flex flex-col items-start gap-4 py-16">
      <h1 className="text-[clamp(2rem,6vw,3rem)] font-extrabold">{t.boletin.bajaTitulo}</h1>
      <p className="text-gris max-w-xl text-lg">{t.boletin.bajaTexto}</p>
      <BotonDeEnlace
        tipo="baja"
        campos={{ id: primero(consulta.id), firma: primero(consulta.firma) }}
      />
    </div>
  )
}
