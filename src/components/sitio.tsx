import Link from 'next/link'

import { poblado } from '@/lib/datos'
import { formatearFecha } from '@/lib/fechas'
import type { Diccionario } from '@/lib/i18n'
import { rutas } from '@/lib/rutas'
import type { Ajuste, Articulo, Media, Navegacion } from '@/payload-types'

import { BotonTema } from './cliente/BotonTema'
import { ImagenMedia } from './ImagenMedia'

type Base = { locale: string; t: Diccionario }

export function Cabecera({
  ajustes,
  navegacion,
  locale,
  t,
}: Base & { ajustes: Ajuste; navegacion: Navegacion }) {
  const r = rutas(locale)
  const logo = poblado<Media>(ajustes.logo)
  return (
    <header className="mast bg-pizarra text-tiza">
      <div className="contenedor">
        <div className="flex items-end justify-between gap-4 pt-4 pb-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
            <Link
              href={r.portada()}
              className="font-display block text-[clamp(2.1rem,8vw,3.25rem)] leading-none font-extrabold"
            >
              {logo ? (
                <ImagenMedia
                  media={logo}
                  alt={ajustes.nombre}
                  tamanos="220px"
                  prioridad
                  className="h-12 w-auto"
                />
              ) : (
                <span className="raya-tiza inline-block">{ajustes.nombre}</span>
              )}
            </Link>
            {ajustes.lema && <p className="text-[0.95rem] italic opacity-85">{ajustes.lema}</p>}
          </div>
          <BotonTema etiquetaClaro={t.temaClaro} etiquetaOscuro={t.temaOscuro} />
        </div>
        {/* Date computed at render; pages re-render at least hourly (see lib/datos.ts). */}
        <p className="font-ui pb-1 text-xs capitalize opacity-80">
          {new Intl.DateTimeFormat('es-PR', {
            weekday: 'long',
            timeZone: 'America/Puerto_Rico',
          }).format(new Date())}
          <span className="normal-case">, {formatearFecha(new Date())}</span>
        </p>
        {navegacion.principal?.length ? (
          <nav aria-label={t.secciones} className="-mx-1">
            <ul className="font-ui flex gap-x-1 overflow-x-auto py-2 text-sm font-medium whitespace-nowrap [scrollbar-width:none]">
              {navegacion.principal.map((item) => (
                <li key={item.id}>
                  <Link
                    href={r.libre(item.enlace)}
                    className="block rounded px-2 py-1.5 hover:bg-white/10"
                  >
                    {item.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  )
}

export function Cintillo({ ajustes, locale, t }: Base & { ajustes: Ajuste }) {
  const cintillo = ajustes.cintillo
  if (!cintillo?.activo || !cintillo.texto) return null
  const articulo = poblado<Articulo>(cintillo.articulo)
  return (
    <div className="bg-alerta text-alerta-tinta">
      <p className="contenedor font-ui flex items-baseline gap-2.5 py-2 text-sm leading-snug font-semibold">
        <span className="text-[0.6875rem] font-extrabold tracking-widest whitespace-nowrap uppercase">
          {t.ultimaHora}
        </span>
        {articulo?.slug ? (
          <Link href={rutas(locale).articulo(articulo.slug)} className="hover:underline">
            {cintillo.texto}
          </Link>
        ) : (
          <span>{cintillo.texto}</span>
        )}
      </p>
    </div>
  )
}

export function Pie({
  ajustes,
  navegacion,
  locale,
  t,
}: Base & { ajustes: Ajuste; navegacion: Navegacion }) {
  const r = rutas(locale)
  return (
    <footer className="border-linea font-ui mt-16 border-t">
      <div className="contenedor grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl font-extrabold">{ajustes.nombre}</p>
          {ajustes.descripcion && (
            <p className="text-gris mt-2 max-w-md text-sm">{ajustes.descripcion}</p>
          )}
          {ajustes.redes?.length ? (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
              {ajustes.redes.map((red) => (
                <li key={red.id}>
                  <a
                    href={red.url}
                    rel="noopener noreferrer me"
                    className="text-acento hover:underline"
                  >
                    {t.redes[red.plataforma]}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {navegacion.pie?.map((columna) => (
          <nav key={columna.id} aria-label={columna.titulo}>
            <p className="text-gris text-xs font-bold tracking-widest uppercase">
              {columna.titulo}
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {columna.enlaces?.map((enlace) => (
                <li key={enlace.id}>
                  <Link href={r.libre(enlace.enlace)} className="hover:underline">
                    {enlace.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      {navegacion.textoLegal && (
        <p className="contenedor border-linea text-gris border-t py-5 text-xs">
          {navegacion.textoLegal}
        </p>
      )}
    </footer>
  )
}
