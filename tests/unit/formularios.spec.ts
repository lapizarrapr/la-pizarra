import { describe, expect, it } from 'vitest'

import { correoAvisoDeMensaje, escaparHtml } from '@/lib/email/plantillas'
import {
  aCsv,
  celdaCsv,
  LIMITES,
  normalizarEmail,
  pareceRobot,
  validarMensaje,
} from '@/lib/formularios'
import { huella, ipDe } from '@/lib/proteccion'

describe('validación de mensajes', () => {
  const base = {
    tipo: 'contacto',
    asunto: 'Una pregunta',
    mensaje: 'Quisiera saber cómo colaborar con ustedes.',
    email: ' Maestra@Ejemplo.COM ',
    nombre: 'Ana',
  }

  it('accepts a normal contact message and normalises it', () => {
    const r = validarMensaje(base)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.datos.email).toBe('maestra@ejemplo.com')
      expect(r.datos.tipo).toBe('contacto')
      expect(r.datos.anonimo).toBe(false)
    }
  })

  it('requires an email for contact, a subject and a real message', () => {
    const r = validarMensaje({ tipo: 'contacto', asunto: 'a', mensaje: 'corto', email: '' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(Object.keys(r.errores).sort()).toEqual(['asunto', 'email', 'mensaje'])
  })

  it('rejects malformed emails', () => {
    for (const malo of ['ana@', 'ana@ejemplo', 'a b@c.com', 'ana@ejemplo.com\nBcc: x@y.com']) {
      expect(normalizarEmail(malo)).toBeNull()
    }
    expect(normalizarEmail('x'.repeat(200) + '@a.com')).toBeNull()
  })

  it('lets a story tip arrive without contact details', () => {
    expect(validarMensaje({ ...base, tipo: 'historia', email: '', nombre: '' }).ok).toBe(true)
  })

  it('stores no name or email for an anonymous tip, even if typed', () => {
    const r = validarMensaje({ ...base, tipo: 'historia', anonimo: 'on' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.datos.anonimo).toBe(true)
      expect(r.datos.nombre).toBe('')
      expect(r.datos.email).toBeNull()
    }
  })

  it('ignores the anonymous flag on the contact form and unknown types', () => {
    const r = validarMensaje({ ...base, tipo: 'otra-cosa', anonimo: 'on' })
    expect(r.ok && r.datos.tipo).toBe('contacto')
    expect(r.ok && r.datos.anonimo).toBe(false)
  })

  it('strips control characters and caps lengths', () => {
    const r = validarMensaje({
      ...base,
      asunto: 'Hola\r\nBcc: otro@ejemplo.com',
      mensaje: `${'x'.repeat(LIMITES.mensaje + 500)}\u0000`,
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.datos.asunto).toBe('Hola Bcc: otro@ejemplo.com')
      expect(r.datos.mensaje).toHaveLength(LIMITES.mensaje)
    }
  })
})

describe('trampa contra robots', () => {
  const ahora = 1_800_000_000_000

  it('flags a filled honeypot or an instant submission', () => {
    expect(pareceRobot({ sitio_web: 'http://spam.example', inicio: ahora - 60_000 }, ahora)).toBe(
      true,
    )
    expect(pareceRobot({ sitio_web: '', inicio: String(ahora - 300) }, ahora)).toBe(true)
    expect(pareceRobot({ inicio: 'abc' }, ahora)).toBe(true)
  })

  it('lets people through, including browsers without scripts', () => {
    expect(pareceRobot({ sitio_web: '', inicio: String(ahora - 20_000) }, ahora)).toBe(false)
    expect(pareceRobot({ sitio_web: '' }, ahora)).toBe(false)
  })
})

describe('exportación CSV', () => {
  it('quotes commas, quotes and line breaks', () => {
    expect(celdaCsv('a,b')).toBe('"a,b"')
    expect(celdaCsv('di "hola"')).toBe('"di ""hola"""')
    expect(celdaCsv(null)).toBe('')
  })

  it('neutralises spreadsheet formulas', () => {
    expect(celdaCsv('=HYPERLINK("http://x")')).toBe(`"'=HYPERLINK(""http://x"")"`)
    expect(celdaCsv('+1787')).toBe("'+1787")
    expect(celdaCsv('@cmd')).toBe("'@cmd")
  })

  it('builds a file Excel reads correctly', () => {
    const csv = aCsv([
      ['email', 'confirmado_en'],
      ['a@b.com', '2026-11-14'],
    ])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv).toContain('email,confirmado_en\r\na@b.com,2026-11-14\r\n')
  })
})

describe('correos', () => {
  it('escapes everything a visitor typed', () => {
    expect(escaparHtml(`<img src=x onerror="alert('x')">`)).toBe(
      '&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;',
    )
    const correo = correoAvisoDeMensaje({
      tipo: 'historia',
      asunto: '<script>alert(1)</script>',
      nombre: '<b>Ana</b>',
      email: 'ana@ejemplo.com',
      mensaje: 'Hola <a href="http://x">clic</a>',
      anonimo: false,
      urlPanel: 'https://lapizarra.example/admin/collections/mensajes/1',
    })
    expect(correo.html).not.toMatch(/<script>|<b>Ana|<a href="http:\/\/x"/)
    expect(correo.subject).not.toMatch(/[\r\n]/)
  })

  it('does not name the sender of an anonymous tip', () => {
    const correo = correoAvisoDeMensaje({
      tipo: 'historia',
      asunto: 'Pista',
      mensaje: 'Algo pasa en la escuela.',
      anonimo: true,
      urlPanel: 'https://lapizarra.example/admin',
    })
    expect(correo.text).toContain('Pidió anonimato')
  })
})

describe('límite de envíos', () => {
  it('stores a keyed hash, never the IP itself', () => {
    const clave = huella('mensaje', '203.0.113.7')
    expect(clave).toMatch(/^[0-9a-f]{40}$/)
    expect(clave).not.toContain('203')
    expect(huella('mensaje', '203.0.113.7')).toBe(clave)
    expect(huella('boletin', '203.0.113.7')).not.toBe(clave)
    expect(huella('mensaje', '203.0.113.8')).not.toBe(clave)
  })

  it('reads the visitor address from proxy headers', () => {
    expect(ipDe(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7')
    expect(ipDe(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2')
    expect(ipDe(new Headers())).toBe('desconocida')
  })
})
