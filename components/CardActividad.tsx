import Link from 'next/link'

function precioDesde(actividad: any): string | null {
  const horarios = actividad.horarios || []
  if (!horarios.length) return null

  let min = Infinity
  let minGrupal = Infinity
  let todasGrupales = true

  for (const h of horarios) {
    if (h.precio && h.precio > 0) {
      min = Math.min(min, h.precio)
      todasGrupales = false
    }
    if (h.precio_grupo && h.precio_grupo > 0) {
      minGrupal = Math.min(minGrupal, h.precio_grupo)
    }
  }

  const precioIndividual = min === Infinity ? null : min
  const precioGrupal = minGrupal === Infinity ? null : minGrupal

  // Si hay ambos, mostrar el más barato
  if (precioIndividual && precioGrupal) {
    const menor = Math.min(precioIndividual, precioGrupal)
    return `Desde $${menor.toLocaleString('es-AR')}`
  }
  if (precioIndividual) {
    return `Desde $${precioIndividual.toLocaleString('es-AR')}`
  }
  if (precioGrupal) {
    return `Desde $${precioGrupal.toLocaleString('es-AR')}`
  }

  // Fallback a precio_por_hora
  if (actividad.precio_por_hora) {
    return `$${actividad.precio_por_hora.toLocaleString('es-AR')}/h`
  }

  // Fallback a precio_grupo directo de actividad
  if (actividad.precio_grupo) {
    return `Desde $${actividad.precio_grupo.toLocaleString('es-AR')} (grupo)`
  }

  // Fallback a precio legacy
  if (actividad.precio && actividad.precio > 0) {
    return `Desde $${actividad.precio.toLocaleString('es-AR')}`
  }

  return null
}

export default function CardActividad({ actividad }: { actividad: any }) {
  const precioTexto = precioDesde(actividad)

  return (
    <Link
      href={`/actividades/${actividad.id}`}
      className="card-lift group relative flex flex-col overflow-hidden rounded-2xl bg-superficie"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {actividad.imagen_url ? (
          <img
            src={actividad.imagen_url}
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
          {precioTexto ? (
            <span className="font-titulos text-xl font-bold text-primario">
              {precioTexto}
            </span>
          ) : (
            <span className="text-sm text-texto-secundario/70">
              Sin precio
            </span>
          )}
          <span className="text-xs text-texto-secundario/70">
            {actividad.lugar?.split(',')[0] || ''}
          </span>
          {actividad.perfiles && (
            <span className="ml-2 text-xs text-primario/70">
              {actividad.perfiles.nombre}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}