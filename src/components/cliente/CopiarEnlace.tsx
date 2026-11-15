'use client'

import { useState } from 'react'

type Props = { url: string; etiqueta: string; copiado: string; className?: string }

export function CopiarEnlace({ url, etiqueta, copiado, className }: Props) {
  const [hecho, setHecho] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setHecho(true)
      setTimeout(() => setHecho(false), 2500)
    } catch {
      // Clipboard unavailable (old browser, permissions): show the link to copy by hand.
      window.prompt(etiqueta, url)
    }
  }

  return (
    <button type="button" onClick={copiar} className={className}>
      <span aria-live="polite">{hecho ? copiado : etiqueta}</span>
    </button>
  )
}
