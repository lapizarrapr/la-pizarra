'use client'

import { useEffect, useState } from 'react'

type Props = { etiquetaClaro: string; etiquetaOscuro: string }

/** Light/dark switch. Remembers the choice on this device only. */
export function BotonTema({ etiquetaClaro, etiquetaOscuro }: Props) {
  const [oscuro, setOscuro] = useState<boolean | null>(null)

  useEffect(() => {
    const elegido = document.documentElement.dataset.theme
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the browser's theme once after mount
    setOscuro(
      elegido ? elegido === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches,
    )
  }, [])

  const cambiar = () => {
    const siguiente = !oscuro
    setOscuro(siguiente)
    document.documentElement.dataset.theme = siguiente ? 'dark' : 'light'
    try {
      localStorage.setItem('tema', siguiente ? 'dark' : 'light')
    } catch {
      // Private browsing: the choice just won't be remembered.
    }
  }

  return (
    <button
      type="button"
      onClick={cambiar}
      aria-label={oscuro ? etiquetaClaro : etiquetaOscuro}
      title={oscuro ? etiquetaClaro : etiquetaOscuro}
      className="grid size-9 place-items-center rounded-full border border-current/30 hover:bg-white/10"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        {oscuro ? (
          <>
            <circle cx="12" cy="12" r="4.5" />
            <path
              strokeLinecap="round"
              d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"
            />
          </>
        ) : (
          <path strokeLinejoin="round" d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  )
}
