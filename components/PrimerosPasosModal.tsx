'use client'

import { useState } from 'react'
import { X, Play } from 'lucide-react'

const VIDEOS = [
  {
    id: 'intro',
    titulo: '¿Qué es Inmersivapp?',
    desc: 'Conocé la plataforma que conecta personas con experiencias auténticas y multisensoriales en tu ciudad. Talleres, naturaleza, gastronomía y más.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // placeholder
  },
  {
    id: 'reservar',
    titulo: 'Cómo reservar una experiencia',
    desc: 'Encontrá la actividad que más te guste, seleccioná fecha y reservá al instante. El pago es seguro con MercadoPago.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // placeholder
  },
  {
    id: 'anfitrion',
    titulo: 'Convertite en anfitrión',
    desc: 'Creá tu propia experiencia, recibí reservas y empezá a generar ingresos compartiendo lo que sabés hacer.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // placeholder
  },
]

export default function PrimerosPasosModal() {
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(VIDEOS[0].id)

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-medium text-texto transition hover:bg-gray-50"
      >
        <Play className="h-4 w-4" />
        Primeros pasos
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            {/* Cerrar */}
            <button
              onClick={() => setAbierto(false)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Reproductor */}
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={VIDEOS.find((v) => v.id === activo)?.url}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Lista de videos */}
            <div className="mt-6 space-y-3">
              {VIDEOS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActivo(v.id)}
                  className={`w-full rounded-xl p-4 text-left transition ${
                    activo === v.id
                      ? 'bg-primario/10 ring-2 ring-primario'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-semibold text-texto">{v.titulo}</p>
                  <p className="mt-1 text-sm text-texto-secundario">{v.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}