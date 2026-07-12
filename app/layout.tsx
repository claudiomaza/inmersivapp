import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Inmersivapp — Experiencias que transforman',
  description:
    'Conectá con experiencias auténticas y multisensoriales cerca tuyo.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Open+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}