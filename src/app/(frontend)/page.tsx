import Link from 'next/link'

import { formatearFecha } from '@/lib/fechas'

// Placeholder until the public site is built in phase 3.
export default function PortadaProvisional() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-16">
      <p className="text-pizarra text-sm font-semibold tracking-widest uppercase">
        {formatearFecha(new Date())}
      </p>
      <h1 className="mt-2 font-serif text-5xl font-bold">La Pizarra</h1>
      <p className="mt-4 text-lg">
        Periodismo independiente de la comunidad escolar pública de Puerto Rico. El sitio está en
        construcción.
      </p>
      <p className="mt-8">
        <Link className="text-pizarra font-semibold underline underline-offset-4" href="/admin">
          Entrar al panel de redacción
        </Link>
      </p>
    </main>
  )
}
