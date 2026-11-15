import type { Metadata } from 'next'
import React from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: 'La Pizarra',
  description:
    'Periodismo independiente de la comunidad escolar pública de Puerto Rico, escrito por maestras, maestros y estudiantes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-papel text-tinta min-h-screen antialiased">{children}</body>
    </html>
  )
}
