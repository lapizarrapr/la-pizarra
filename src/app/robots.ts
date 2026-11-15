import type { MetadataRoute } from 'next'

import { SITIO } from '@/lib/rutas'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Admin, APIs, draft previews and search result pages are not for indexing.
        disallow: ['/admin', '/api/', '/vista-previa', '/buscar'],
      },
    ],
    sitemap: `${SITIO}/sitemap.xml`,
    host: SITIO,
  }
}
