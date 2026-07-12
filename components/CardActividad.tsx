import Link from 'next/link'
import { formatPrecio } from '@/lib/utils'

export default function CardActividad({ actividad }: { actividad: any }) {
  const foto = actividad.fotos?.[0] || 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80'

  return (
    <Link
      href={`/actividades/${actividad.id}`}
      className="group rounded-xl bg-superficie shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[16/9] overflow-hidden rounded-t-xl">
        <img
          src={foto}
          alt={actividad.titulo}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <span className="rounded-full bg-secundario/20 px-3 py-1 text-xs font-medium text-secundario-dark">
          {actividad.categoria}
        </span>
        <h2 className="mt-2 font-titulos text-lg font-bold text-texto group-hover:text-primario">
          {actividad.titulo}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-texto-secundario">
          {actividad.descripcion}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-titulos text-xl font-bold text-primario">
            {formatPrecio(actividad.precio)}
          </span>
          <span className="text-xs text-texto-secundario">
            {actividad.ubicacion?.departamento || actividad.ubicacion?.provincia}
          </span>
        </div>
      </div>
    </Link>
  )
}