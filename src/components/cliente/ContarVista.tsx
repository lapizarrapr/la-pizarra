'use client'

import { useEffect } from 'react'

/**
 * Tells the server this article was opened, for "Más leídas". Sends only the
 * article's slug. Counts once per browser tab session, so reloading the page
 * doesn't inflate the number.
 */
export function ContarVista({ slug }: { slug: string }) {
  useEffect(() => {
    const clave = `vista:${slug}`
    try {
      if (sessionStorage.getItem(clave)) return
      sessionStorage.setItem(clave, '1')
    } catch {
      // Storage blocked: count anyway.
    }
    fetch('/api/vistas/registrar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {})
  }, [slug])

  return null
}
