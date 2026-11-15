import { describe, expect, it } from 'vitest'

import { aISO, diaEnPuertoRico, formatearFecha, formatearFechaHora } from '@/lib/fechas'

describe('fechas', () => {
  // 02:30 UTC on 15 Nov is still 14 Nov, 10:30 p.m. in Puerto Rico (UTC-4, no DST).
  const instante = '2026-11-15T02:30:00.000Z'

  it('formats dates in Spanish using the Puerto Rico time zone', () => {
    expect(formatearFecha(instante)).toBe('14 de noviembre de 2026')
  })

  it('includes the local time', () => {
    const texto = formatearFechaHora(instante)
    expect(texto).toContain('14 de noviembre de 2026')
    expect(texto).toMatch(/10:30/)
  })

  it('returns the Puerto Rico calendar day, not the UTC day', () => {
    expect(diaEnPuertoRico(instante)).toBe('2026-11-14')
  })

  it('accepts Date objects and timestamps', () => {
    const fecha = new Date(instante)
    expect(formatearFecha(fecha)).toBe(formatearFecha(fecha.getTime()))
    expect(aISO(fecha)).toBe(instante)
  })

  it('rejects invalid dates', () => {
    expect(() => formatearFecha('no es una fecha')).toThrow(RangeError)
  })
})
