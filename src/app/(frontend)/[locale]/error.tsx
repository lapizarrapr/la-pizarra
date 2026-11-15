'use client'

import { es as t } from '@/lib/i18n/es'

export default function ErrorDePagina({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="contenedor flex flex-col items-start gap-4 py-20" role="alert">
      <h1 className="text-[clamp(2rem,6vw,3rem)] font-extrabold">{t.errorTitulo}</h1>
      <p className="text-gris max-w-xl text-lg">{t.errorTexto}</p>
      <button
        type="button"
        onClick={reset}
        className="bg-pizarra text-tiza font-ui rounded-full px-5 py-2.5 text-sm font-bold"
      >
        {t.reintentar}
      </button>
    </div>
  )
}
