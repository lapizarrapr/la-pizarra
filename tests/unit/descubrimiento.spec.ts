import { describe, expect, it } from 'vitest'

import { limitesDelMes, nombreDelMes } from '@/lib/fechas'
import { rutas } from '@/lib/rutas'
import { LARGO_MAXIMO_DE_CONSULTA, limpiarConsulta } from '@/lib/search'
import { serializarJsonLd } from '@/lib/seo'

describe('búsqueda', () => {
  it('cleans what the reader typed', () => {
    expect(limpiarConsulta('  comedores \n  escolares ')).toBe('comedores escolares')
    expect(limpiarConsulta(undefined)).toBe('')
    expect(limpiarConsulta(['a', 'b'])).toBe('')
    expect(limpiarConsulta('x'.repeat(500))).toHaveLength(LARGO_MAXIMO_DE_CONSULTA)
  })
})

describe('archivo por mes', () => {
  it('uses Puerto Rico midnight (UTC-4) as the month boundary', () => {
    expect(limitesDelMes(2026, 11)).toEqual({
      inicio: '2026-11-01T04:00:00.000Z',
      fin: '2026-12-01T04:00:00.000Z',
    })
    // December rolls into the next year.
    expect(limitesDelMes(2026, 12).fin).toBe('2027-01-01T04:00:00.000Z')
  })

  it('names months in Spanish', () => {
    expect(nombreDelMes(2026, 11)).toBe('noviembre de 2026')
    expect(nombreDelMes(2027, 1)).toBe('enero de 2027')
  })
})

describe('rutas', () => {
  const r = rutas('es')

  it('serves Spanish without a prefix', () => {
    expect(r.portada()).toBe('/')
    expect(r.articulo('mi-nota')).toBe('/articulo/mi-nota')
    expect(r.seccion('opinion')).toBe('/seccion/opinion')
    expect(r.seccion('opinion', 3)).toBe('/seccion/opinion/pagina/3')
    expect(r.mes(2026, 3)).toBe('/archivo/2026/03')
  })

  it('encodes search text safely', () => {
    expect(r.buscar()).toBe('/buscar')
    expect(r.buscar('educación & más', 2)).toBe('/buscar?q=educaci%C3%B3n+%26+m%C3%A1s&pagina=2')
  })

  it('leaves external links alone and prefixes internal ones', () => {
    expect(r.libre('/contacto')).toBe('/contacto')
    expect(r.libre('https://example.org')).toBe('https://example.org')
    expect(rutas('en').libre('/contacto')).toBe('/en/contacto')
  })
})

describe('datos estructurados', () => {
  it('cannot break out of the script tag', () => {
    const salida = serializarJsonLd({ titular: '</script><script>alert(1)</script>' })
    expect(salida).not.toContain('<')
    expect(JSON.parse(salida).titular).toContain('</script>')
  })
})
