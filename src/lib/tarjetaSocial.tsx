import { ImageResponse } from 'next/og'

/**
 * Generated 1200×630 sharing card in the site's colours: used when an
 * article has no photo, and as the site's default card.
 */
export const tarjetaSocial = ({
  titular,
  antetitulo,
}: {
  titular: string
  antetitulo?: string
}) => {
  const largo = titular.length
  const tamano = largo > 110 ? 50 : largo > 70 ? 60 : 72

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#1c3b33',
        color: '#f4f2ea',
        padding: 72,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {antetitulo ? (
          <div
            style={{ fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', color: '#f2c94c' }}
          >
            {antetitulo}
          </div>
        ) : null}
        <div style={{ fontSize: tamano, fontWeight: 700, lineHeight: 1.12, marginTop: 20 }}>
          {titular.length > 160 ? `${titular.slice(0, 157)}…` : titular}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 54, fontWeight: 800 }}>La Pizarra</div>
          <div
            style={{ width: 250, height: 8, borderRadius: 4, background: '#f2c94c', marginTop: 6 }}
          />
        </div>
        <div style={{ fontSize: 26, opacity: 0.85 }}>Periodismo desde el salón de clases</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    },
  )
}
