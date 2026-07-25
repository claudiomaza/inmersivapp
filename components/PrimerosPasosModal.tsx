'use client'

import { useState } from 'react'
import { X, Play } from 'lucide-react'

const VIDEOS = [
  {
    id: 'intro',
    titulo: '¿Qué es Inmersivapp?',
    desc: 'Conocé la plataforma que conecta personas con experiencias auténticas y multisensoriales en tu ciudad. Talleres, naturaleza, gastronomía y más.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'reservar',
    titulo: 'Cómo reservar una experiencia',
    desc: 'Encontrá la actividad que más te guste, seleccioná fecha y reservá al instante. El pago es seguro con MercadoPago.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'anfitrion',
    titulo: 'Convertite en anfitrión',
    desc: 'Creá tu propia experiencia, recibí reservas y empezá a generar ingresos compartiendo lo que sabés hacer.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
]

export default function PrimerosPasosModal() {
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(VIDEOS[0].id)

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="inline-flex h-12 items-center gap-2 rounded-xl border border-primario/20 bg-superficie px-8 font-semibold text-primario transition hover:bg-primario/5 active:scale-[0.98]"
      >
        <Play className="h-4 w-4" />
        Primeros pasos
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            {/* Cerrar — visible en desktop y mobile */}
            <button
              onClick={() => setAbierto(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-gray-600 shadow-sm backdrop-blur transition hover:bg-black/20 hover:text-gray-900 sm:right-5 sm:top-5"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
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