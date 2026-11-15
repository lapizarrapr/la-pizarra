import { notFound } from 'next/navigation'

// Any address no other route matches lands here, so readers always get the
// Spanish 404 page with the site's header and footer.
export default function RutaDesconocida() {
  notFound()
}
