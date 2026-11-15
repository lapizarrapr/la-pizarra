'use client'

import { useState } from 'react'

type Props = { id: string; titulo: string; etiquetaVer: string; aviso: string }

/**
 * Click-to-load YouTube player. Nothing is requested from YouTube until the
 * reader presses play, and then the privacy-enhanced domain is used.
 */
export function VideoYouTube({ id, titulo, etiquetaVer, aviso }: Props) {
  const [activo, setActivo] = useState(false)

  if (activo) {
    return (
      <iframe
        className="aspect-video w-full rounded-md"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={titulo}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
    )
  }

  return (
    <div className="bg-pizarra text-tiza flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-md p-6 text-center">
      <p className="font-display text-xl font-bold text-balance">{titulo}</p>
      <button
        type="button"
        onClick={() => setActivo(true)}
        className="bg-alerta text-alerta-tinta font-ui inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        {etiquetaVer}
      </button>
      <p className="font-ui max-w-sm text-xs opacity-80">{aviso}</p>
    </div>
  )
}
