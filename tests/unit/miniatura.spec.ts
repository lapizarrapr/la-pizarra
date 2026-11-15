import { describe, expect, it } from 'vitest'

import { miniaturaDeAdmin } from '@/lib/miniatura'

const doc = {
  _objectKey: 'abc-123',
  filename: 'foto.webp',
  url: '/api/media/file/foto.webp',
  sizes: {
    pequena: { filename: 'foto-400x210.webp', url: '/api/media/file/foto-400x210.webp' },
  },
}

describe('miniaturaDeAdmin', () => {
  it('uses the stored URL when there is no bucket (local development)', () => {
    expect(miniaturaDeAdmin(doc, undefined)).toBe('/api/media/file/foto-400x210.webp')
  })

  it('points at the bucket, inside the upload folder, when R2 is on', () => {
    expect(miniaturaDeAdmin(doc, 'https://pub-x.r2.dev')).toBe(
      'https://pub-x.r2.dev/abc-123/foto-400x210.webp',
    )
  })

  it('tolerates a trailing slash and a missing upload folder', () => {
    expect(miniaturaDeAdmin({ ...doc, _objectKey: null }, 'https://pub-x.r2.dev/')).toBe(
      'https://pub-x.r2.dev/foto-400x210.webp',
    )
  })

  it('falls back to the original when the small size does not exist', () => {
    expect(miniaturaDeAdmin({ ...doc, sizes: {} }, 'https://pub-x.r2.dev')).toBe(
      'https://pub-x.r2.dev/abc-123/foto.webp',
    )
    expect(miniaturaDeAdmin({}, 'https://pub-x.r2.dev')).toBeNull()
  })
})
