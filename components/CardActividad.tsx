import Link from 'next/link'
import { formatPrecio } from '@/lib/utils'

export default function CardActividad({ actividad }: { actividad: any }) {
  const foto = actividad.fotos?.[0]

  return (
    <Link
      href={`/actividades/${actividad.id}`}
      className="card-lift group relative flex flex-col overflow-hidden rounded-2xl bg-superficie"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {foto ? (
          <img
            src={foto}
            alt={actividad.titulo}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-superficie-alt">
            <span className="text-5xl opacity-30">✦</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {/* Category pill */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-primario-dark backdrop-blur-sm">
          {actividad.categoria}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h2 className="font-titulos text-lg font-semibold text-texto">
          {actividad.titulo}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-texto-secundario">
          {actividad.descripcion}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-titulos text-xl font-bold text-primario">
            {formatPrecio(actividad.precio)}
          </span>
          <span className="text-xs text-texto-secundario/70">
            {actividad.ubicacion?.departamento || actividad.ubicacion?.provincia}
          </span>
        </div>
      </div>
    </Link>
  )
}
