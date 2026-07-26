'use client'

/**
 * Utilidades de precio dinámico para Inmersivapp
 * 
 * Lógica de cálculo:
 * 1. Si el bloque horario tiene "precio" propio → usa ese
 * 2. Si es_grupal y tiene precio_grupo → usa ese (precio fijo grupal)
 * 3. Si tiene precio_por_hora → precio_por_hora × duración_en_hs
 * 4. Sino → actividad.precio (legacy)
 */

export interface BloqueHorario {
  hora: string
  hora_fin?: string
  dia_semana?: number
  fecha?: string
  duracion_turno?: number
  precio?: number
}

export interface ActividadPrecio {
  precio: number
  precio_por_hora?: number | null
  es_grupal?: boolean
  precio_grupo?: number | null
  horarios?: BloqueHorario[]
}

/**
 * Calcula la duración en horas de un bloque horario
 */
export function duracionEnHoras(bloque: BloqueHorario): number {
  if (bloque.duracion_turno) {
    return bloque.duracion_turno / 60
  }

  if (bloque.hora && bloque.hora_fin) {
    const [h1, m1] = bloque.hora.split(':').map(Number)
    const [h2, m2] = bloque.hora_fin.split(':').map(Number)
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1)
    return Math.max(mins, 30) / 60 // mínimo 30 min
  }

  return 1 // default 1 hora
}

/**
 * Calcula el precio unitario de una actividad para un bloque horario específico
 */
export function calcularPrecioUnitario(
  actividad: ActividadPrecio,
  bloque?: BloqueHorario | null
): number {
  // 1. Precio específico del bloque horario
  if (bloque?.precio) {
    return bloque.precio
  }

  // 2. Precio grupal fijo
  if (actividad.es_grupal && actividad.precio_grupo) {
    return actividad.precio_grupo
  }

  // 3. Precio por hora
  if (actividad.precio_por_hora) {
    const hs = bloque ? duracionEnHoras(bloque) : 1
    return Math.round(actividad.precio_por_hora * hs)
  }

  // 4. Legacy: precio fijo de la actividad
  return actividad.precio
}

/**
 * Calcula el precio total de una reserva
 */
export function calcularPrecioTotal(
  actividad: ActividadPrecio,
  cantidad: number,
  bloque?: BloqueHorario | null
): number {
  const unitario = calcularPrecioUnitario(actividad, bloque)

  // Si es grupal, el precio es fijo (no se multiplica por personas)
  if (actividad.es_grupal) {
    return unitario
  }

  return unitario * cantidad
}

/**
 * Texto descriptivo del tipo de precio
 */
export function descripcionPrecio(actividad: ActividadPrecio): string {
  if (actividad.es_grupal) {
    return 'por grupo'
  }
  if (actividad.precio_por_hora) {
    return `$${actividad.precio_por_hora.toLocaleString('es-AR')}/hora`
  }
  return 'por persona'
}

/**
 * Texto descriptivo del precio de un bloque
 */
export function descripcionPrecioBloque(
  actividad: ActividadPrecio,
  bloque: BloqueHorario
): string {
  const unitario = calcularPrecioUnitario(actividad, bloque)

  if (bloque.precio) {
    return `$${unitario.toLocaleString('es-AR')} por persona`
  }

  if (actividad.es_grupal) {
    return `$${unitario.toLocaleString('es-AR')} por grupo`
  }

  if (actividad.precio_por_hora) {
    const hs = duracionEnHoras(bloque)
    return `$${unitario.toLocaleString('es-AR')} por persona (${hs}h × $${actividad.precio_por_hora.toLocaleString('es-AR')}/h)`
  }

  return `$${unitario.toLocaleString('es-AR')} por persona`
}