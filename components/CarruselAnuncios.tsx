'use client'

import { useCallback } from 'react'
import type { Anuncio } from '@/types'

export default function CarruselAnuncios({ anuncios }: { anuncios: Anuncio[] }) {
  const registrarClick = useCallback(async (id: string) => {
    try {
      await fetch('/api/anuncios/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anuncio_id: id }),
      })
    } catch { /* silencioso */ }
  }, [])

  if (!anuncios.length) return null

  return (
    <section className="mt-8 mb-4">
      <h2 className="font-titulos mb-4 text-2xl font-bold text-texto">
        Patrocinado <span className="text-xs font-normal text-texto-secundario">✦</span>
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {anuncios.map((anuncio) => (
          <a
            key={anuncio.id}
            href={anuncio.url_destino}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registrarClick(anuncio.id)}
            className="card-lift group flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl bg-superficie"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              {anuncio.imagen_url ? (
                <img
                  src={anuncio.imagen_url}
                  alt={anuncio.titulo}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-superficie-alt">
                  <span className="text-4xl opacity-20">✦</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center p-4">
              <h3 className="font-titulos line-clamp-2 text-sm font-semibold text-texto">
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
