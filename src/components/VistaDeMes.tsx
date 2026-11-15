import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { articulosDelMes } from '@/lib/datos'
import { nombreDelMes } from '@/lib/fechas'
import { diccionario, esLocale } from '@/lib/i18n'
import { absoluta, rutas } from '@/lib/rutas'

import { Listado } from './articulos'

export type ParametrosDeMes = { locale: string; anio: string; mes: string; n?: string }

/** Accepts only real months written as /2026/11 (two digits) and clean page numbers. */
const leer = ({ anio, mes, n }: ParametrosDeMes) => {
  if (!/^(19|20)\d{2}$/.test(anio) || !/^(0[1-9]|1[0-2])$/.test(mes)) return null
  if (n !== undefined && (!/^[1-9]\d{0,3}$/.test(n) || Number(n) < 2)) return null
  return { anio: Number(anio), mes: Number(mes), pagina: n ? Number(n) : 1 }
}

const mayuscula = (texto: string) => texto.charAt(0).toLocaleUpperCase('es') + texto.slice(1)

export const metadatosDeMes = async (params: Promise<ParametrosDeMes>): Promise<Metadata> => {
  const p = await params
  const datos = leer(p)
  if (!datos) return {}
  const t = diccionario(p.locale)
  return {
    title: `${t.archivo}: ${nombreDelMes(datos.anio, datos.mes)}`,
    alternates: { canonical: absoluta(rutas(p.locale).mes(datos.anio, datos.mes, datos.pagina)) },
  }
}

export async function VistaDeMes({ params }: { params: Promise<ParametrosDeMes> }) {
  const p = await params
  const datos = leer(p)
  if (!esLocale(p.locale) || !datos) notFound()

  const t = diccionario(p.locale)
  const r = rutas(p.locale)
  const resultado = await articulosDelMes(datos.anio, datos.mes, datos.pagina, p.locale)
  if (resultado.total === 0 || datos.pagina > resultado.paginas) notFound()

  return (
    <div className="contenedor pt-8">
      <header className="border-tinta mb-8 flex flex-col gap-2 border-b pb-6">
        <p className="antetitulo">
          <Link href={r.archivo()} className="hover:underline">
            {t.archivo}
          </Link>
        </p>
        <h1 className="text-[clamp(2rem,6vw,3rem)] font-extrabold">
          {mayuscula(nombreDelMes(datos.anio, datos.mes))}
        </h1>
        <p className="meta">{t.articulos(resultado.total)}</p>
      </header>
      <Listado
        articulos={resultado.articulos}
        pagina={datos.pagina}
        paginas={resultado.paginas}
        hrefDe={(numero) => r.mes(datos.anio, datos.mes, numero)}
        locale={p.locale}
        t={t}
      />
    </div>
  )
}
