import Link from 'next/link'

import { diccionario, LOCALE_PREDETERMINADO } from '@/lib/i18n'
import { rutas } from '@/lib/rutas'

export default function NoEncontrado() {
  const t = diccionario(LOCALE_PREDETERMINADO)
  return (
    <div className="contenedor flex flex-col items-start gap-4 py-20">
      <p className="antetitulo">Error 404</p>
      <h1 className="text-[clamp(2rem,6vw,3rem)] font-extrabold">{t.noEncontradoTitulo}</h1>
      <p className="text-gris max-w-xl text-lg">{t.noEncontradoTexto}</p>
      <Link
        href={rutas().portada()}
        className="bg-pizarra text-tiza font-ui rounded-full px-5 py-2.5 text-sm font-bold"
      >
        {t.volverAPortada}
      </Link>
    </div>
  )
}
