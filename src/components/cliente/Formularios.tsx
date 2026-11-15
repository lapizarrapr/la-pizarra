'use client'

import Link from 'next/link'
import Script from 'next/script'
import { useActionState, useEffect, useId, useRef, useState } from 'react'

import {
  confirmarSuscripcion,
  darDeBajaDelBoletin,
  enviarMensaje,
  suscribirAlBoletin,
  type EstadoDeFormulario,
} from '@/app/(frontend)/acciones'
import { LIMITES } from '@/lib/formularios'
import { es as t } from '@/lib/i18n/es'

const INICIAL: EstadoDeFormulario = { estado: 'inicial' }
const CLAVE_TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const campo =
  'border-tinta bg-fondo font-ui placeholder:text-gris w-full rounded-md border px-3.5 py-2.5 text-base aria-[invalid=true]:border-2'
const boton =
  'bg-pizarra text-tiza font-ui rounded-full px-6 py-3 text-sm font-bold disabled:opacity-60'
const rotulo = 'font-ui text-sm font-semibold'

/**
 * Hidden extras every public form carries: the spam trap (a field people
 * never see), the time the form was shown, and the Turnstile check when its
 * keys are configured.
 */
function Proteccion({ estado }: { estado: EstadoDeFormulario }) {
  const inicio = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inicio.current) inicio.current.value = String(Date.now())
  }, [])

  // A Turnstile token works once; ask for a fresh one after a failed attempt.
  useEffect(() => {
    if (estado.estado === 'error') {
      ;(window as { turnstile?: { reset: () => void } }).turnstile?.reset()
    }
  }, [estado])

  return (
    <>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          {t.form.noLlenar}
          <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input ref={inicio} type="hidden" name="inicio" defaultValue="" />
      {CLAVE_TURNSTILE && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div
            className="cf-turnstile"
            data-sitekey={CLAVE_TURNSTILE}
            data-theme="auto"
            data-language="es"
          />
        </>
      )}
    </>
  )
}

function Aviso({ estado }: { estado: EstadoDeFormulario }) {
  // Always in the page so screen readers announce the result when it appears.
  return (
    <p
      role={estado.estado === 'error' ? 'alert' : 'status'}
      className={
        estado.mensaje
          ? `font-ui rounded-md px-4 py-3 text-[0.9375rem] font-semibold ${
              estado.estado === 'ok'
                ? 'bg-pizarra text-tiza'
                : 'border-tinta bg-superficie border-2'
            }`
          : 'sr-only'
      }
    >
      {estado.mensaje}
    </p>
  )
}

function ErrorDeCampo({ id, mensaje }: { id: string; mensaje?: string }) {
  if (!mensaje) return null
  return (
    <p id={id} className="font-ui text-sm font-semibold">
      <span aria-hidden="true">⚠ </span>
      {mensaje}
    </p>
  )
}

export function FormularioDeMensaje({
  tipo,
  titulo,
  rutaPrivacidad,
}: {
  tipo: 'contacto' | 'historia'
  titulo?: string | null
  rutaPrivacidad: string
}) {
  const [estado, accion, enviando] = useActionState(enviarMensaje, INICIAL)
  const [anonimo, setAnonimo] = useState(false)
  const id = useId()
  const e = estado.errores ?? {}
  const v = estado.valores ?? {}
  const esHistoria = tipo === 'historia'

  if (estado.estado === 'ok') return <Aviso estado={estado} />

  return (
    <section aria-labelledby={`${id}-titulo`} className="border-linea rounded-md border p-5 sm:p-6">
      <h2 id={`${id}-titulo`} className="mb-4 text-2xl font-bold">
        {titulo || (esHistoria ? t.form.historia : t.form.contacto)}
      </h2>
      <form action={accion} className="relative flex flex-col gap-4" noValidate>
        <input type="hidden" name="tipo" value={tipo} />
        <Aviso estado={estado} />

        {esHistoria && (
          <div className="bg-superficie flex flex-col gap-1 rounded-md p-3.5">
            <label className="font-ui flex items-start gap-2.5 text-[0.9375rem] font-semibold">
              <input
                type="checkbox"
                name="anonimo"
                checked={anonimo}
                onChange={(evento) => setAnonimo(evento.target.checked)}
                className="mt-1 size-4"
                aria-describedby={`${id}-anonimo`}
              />
              {t.form.anonimo}
            </label>
            <p id={`${id}-anonimo`} className="meta pl-6.5">
              {t.form.anonimoAyuda}
            </p>
          </div>
        )}

        {!anonimo && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-nombre`} className={rotulo}>
                {t.form.nombre} <span className="text-gris font-normal">({t.form.opcional})</span>
              </label>
              <input
                id={`${id}-nombre`}
                name="nombre"
                defaultValue={v.nombre}
                type="text"
                autoComplete="name"
                maxLength={LIMITES.nombre}
                className={campo}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-email`} className={rotulo}>
                {t.form.email}{' '}
                {esHistoria && <span className="text-gris font-normal">({t.form.opcional})</span>}
              </label>
              <input
                id={`${id}-email`}
                name="email"
                defaultValue={v.email}
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={LIMITES.email}
                required={!esHistoria}
                aria-invalid={Boolean(e.email)}
                aria-describedby={e.email ? `${id}-email-error` : undefined}
                className={campo}
              />
              <ErrorDeCampo id={`${id}-email-error`} mensaje={e.email} />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-asunto`} className={rotulo}>
            {t.form.asunto}
          </label>
          <input
            id={`${id}-asunto`}
            name="asunto"
            defaultValue={v.asunto}
            type="text"
            maxLength={LIMITES.asunto}
            required
            aria-invalid={Boolean(e.asunto)}
            aria-describedby={e.asunto ? `${id}-asunto-error` : undefined}
            className={campo}
          />
          <ErrorDeCampo id={`${id}-asunto-error`} mensaje={e.asunto} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-mensaje`} className={rotulo}>
            {esHistoria ? t.form.tuHistoria : t.form.mensaje}
          </label>
          {esHistoria && (
            <p id={`${id}-mensaje-ayuda`} className="meta">
              {t.form.ayudaHistoria}
            </p>
          )}
          <textarea
            id={`${id}-mensaje`}
            name="mensaje"
            defaultValue={v.mensaje}
            rows={7}
            maxLength={LIMITES.mensaje}
            required
            aria-invalid={Boolean(e.mensaje)}
            aria-describedby={
              [esHistoria && `${id}-mensaje-ayuda`, e.mensaje && `${id}-mensaje-error`]
                .filter(Boolean)
                .join(' ') || undefined
            }
            className={campo}
          />
          <ErrorDeCampo id={`${id}-mensaje-error`} mensaje={e.mensaje} />
        </div>

        <Proteccion estado={estado} />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="submit" disabled={enviando} className={boton}>
            {enviando ? t.form.enviando : t.form.enviar}
          </button>
          <p className="meta">
            {t.form.privacidad}{' '}
            <Link href={rutaPrivacidad} className="text-acento underline underline-offset-2">
              {t.form.verPrivacidad}
            </Link>
          </p>
        </div>
      </form>
    </section>
  )
}

export function FormularioDeBoletin({
  titulo,
  compacto = false,
}: {
  titulo?: string | null
  compacto?: boolean
}) {
  const [estado, accion, enviando] = useActionState(suscribirAlBoletin, INICIAL)
  const id = useId()
  const error = estado.errores?.email
  const v = estado.valores ?? {}

  return (
    <section
      aria-labelledby={`${id}-titulo`}
      className={compacto ? '' : 'bg-superficie rounded-md p-5 sm:p-6'}
    >
      <h2
        id={`${id}-titulo`}
        className={
          compacto
            ? 'text-gris font-ui text-xs font-bold tracking-widest uppercase'
            : 'text-2xl font-bold'
        }
      >
        {titulo || t.boletin.titulo}
      </h2>
      <p className={compacto ? 'font-ui mt-3 text-sm' : 'text-gris mt-1'}>
        {t.boletin.descripcion}
      </p>

      {estado.estado === 'ok' ? (
        <div className="mt-3">
          <Aviso estado={estado} />
        </div>
      ) : (
        <form action={accion} className="relative mt-3 flex flex-col gap-2" noValidate>
          <Aviso estado={estado} />
          <label htmlFor={`${id}-email`} className="sr-only">
            {t.form.email}
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id={`${id}-email`}
              name="email"
              defaultValue={v.email}
              type="email"
              autoComplete="email"
              inputMode="email"
              maxLength={LIMITES.email}
              required
              placeholder="nombre@correo.com"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              className={`${campo} min-w-0 flex-1 rounded-full`}
            />
            <button type="submit" disabled={enviando} className={boton}>
              {enviando ? t.form.enviando : t.boletin.suscribirme}
            </button>
          </div>
          <ErrorDeCampo id={`${id}-error`} mensaje={error} />
          <Proteccion estado={estado} />
        </form>
      )}
    </section>
  )
}

/** One-button pages reached from email links: confirm subscription / unsubscribe. */
export function BotonDeEnlace({
  tipo,
  campos,
}: {
  tipo: 'confirmar' | 'baja'
  campos: Record<string, string>
}) {
  const [estado, accion, enviando] = useActionState(
    tipo === 'confirmar' ? confirmarSuscripcion : darDeBajaDelBoletin,
    INICIAL,
  )

  if (estado.estado !== 'inicial') return <Aviso estado={estado} />

  return (
    <form action={accion}>
      {Object.entries(campos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
      <button type="submit" disabled={enviando} className={boton}>
        {enviando ? t.form.enviando : tipo === 'confirmar' ? t.boletin.confirmar : t.boletin.baja}
      </button>
    </form>
  )
}
