/**
 * Shown above the subscribers list in the admin panel. The link downloads a
 * CSV of confirmed subscribers; the endpoint itself checks the role.
 */
export default function ExportarSuscriptores() {
  return (
    <p style={{ marginBottom: '1.5rem' }}>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download from an API route */}
      <a
        href="/api/suscriptores/exportar"
        className="btn btn--style-secondary btn--size-small"
        style={{ textDecoration: 'none' }}
      >
        Descargar suscriptores confirmados (CSV)
      </a>
    </p>
  )
}
