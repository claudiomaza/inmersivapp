'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, ArrowLeft } from 'lucide-react'

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

export default function PrimerosPasosPage() {
  const [activo, setActivo] = useState(VIDEOS[0].id)

  return (
    <div className="mx-auto max-w-4xl">
      {/* Volver */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-texto-secundario transition hover:text-texto"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <h1 className="font-titulos text-3xl font-bold text-texto">Primeros pasos</h1>
      <p className="mt-2 text-texto-secundario">
        Todo lo que necesitás saber para empezar a usar Inmersivapp.
      </p>

      {/* Reproductor */}
      <div className="mt-8 aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
        <iframe
          src={VIDEOS.find((v) => v.id === activo)?.url}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Lista de videos */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {VIDEOS.map((v) => (
          <button
            key={v.id}
            onClick={() => setActivo(v.id)}
            className={`rounded-xl p-5 text-left transition ${
              activo === v.id
                ? 'bg-primario/10 ring-2 ring-primario shadow-md'
                : 'bg-superficie hover:bg-superficie-alt shadow-sm'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primario/10">
              <Play className="h-5 w-5 text-primario" />
            </div>
            <h3 className="mt-3 font-semibold text-texto">{v.titulo}</h3>
            <p className="mt-1 text-sm leading-relaxed text-texto-secundario">{v.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}