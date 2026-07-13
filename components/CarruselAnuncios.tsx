'use client'

import { useCallback } from 'react'
import type { Anuncio } from '@/types'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1559526324-4bc2007eaa27?auto=format&fit=crop&w=800&q=60'

export default function CarruselAnuncios({ anuncios }: { anuncios: Anuncio[] }) {
  const registrarClick = useCallback(async (id: string) => {
    try {
      await fetch('/api/anuncios/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anuncio_id: id }),
      })
    } catch {
      // Silencioso — no bloquear navegación
    }
  }, [])

  if (!anuncios.length) return null

  return (
    <section className="mt-8 mb-4">
      <h2 className="font-titulos text-2xl font-bold text-texto mb-4">
        Patrocinado ✦
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {anuncios.map((anuncio) => (
          <a
            key={anuncio.id}
            href={anuncio.url_destino}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registrarClick(anuncio.id)}
            className="group flex w-72 shrink-0 flex-col overflow-hidden rounded-xl bg-superficie shadow-sm transition hover:shadow-md"
          >
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={anuncio.imagen_url || FALLBACK_IMG}
                alt={anuncio.titulo}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center p-4">
              <h3 className="font-titulos text-sm font-bold text-texto line-clamp-2 group-hover:text-primario">
                {anuncio.titulo}
              </h3>
              <span className="mt-2 text-xs font-medium text-primario-light">
                Saber más →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}