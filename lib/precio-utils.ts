'use client'

/**
 * Utilidades de precio dinámico para Inmersivapp
 * 
 * Lógica de cálculo:
 * 1. Si el bloque tiene "precio_grupo" y es grupal → precio fijo grupal (no × personas)
 * 2. Si el bloque tiene "precio" propio → precio especial por persona para ese bloque
 * 3. Si la actividad tiene "precio_por_hora" → precio_por_hora × duración del bloque
 * 4. Sino → actividad.precio (legacy)
 */

export interface BloqueHorario {
  hora: string
  hora_fin?: string
  dia_semana?: number
  fecha?: string
  duracion_turno?: number
  /** Precio especial por persona para este bloque (sobreescribe precio_por_hora) */
  precio?: number
  /** Si este bloque es grupal (precio fijo por grupo) */
  es_grupal?: boolean
  /** Precio fijo del grupo para este bloque */
  precio_grupo?: number
}

export interface ActividadPrecio {
  precio: number
  /** Precio base por hora por persona a nivel actividad */
  precio_por_hora?: number | null
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
 * Devuelve el precio POR PERSONA (o por grupo si es grupal)
 */
export function calcularPrecioUnitario(
  actividad: ActividadPrecio,
  bloque?: BloqueHorario | null
): number {
  // 1. Precio grupal del bloque (precio fijo por grupo, no por persona)
  if (bloque?.es_grupal && bloque?.precio_grupo) {
    return bloque.precio_grupo
  }

  // 2. Precio especial del bloque por persona
  if (bloque?.precio) {
    return bloque.precio
  }

  // 3. Precio por hora de la actividad
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

  // Si el bloque es grupal, precio fijo (no se multiplica por personas)
  if (bloque?.es_grupal) {
    return unitario
  }

  return unitario * cantidad
}

/**
 * Texto descriptivo del tipo de precio
 */
export function descripcionPrecio(actividad: ActividadPrecio): string {
  if (actividad.precio_por_hora) {
    return `$${actividad.precio_por_hora.toLocaleString('es-AR')}/hora por persona`
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

  if (bloque.es_grupal) {
    return `$${unitario.toLocaleString('es-AR')} por grupo`
  }

  if (bloque.precio) {
    return `$${unitario.toLocaleString('es-AR')} por persona (precio especial)`
  }

  if (actividad.precio_por_hora) {
    const hs = duracionEnHoras(bloque)
    return `$${unitario.toLocaleString('es-AR')} por persona (${hs}h × $${actividad.precio_por_hora.toLocaleString('es-AR')}/h)`
  }

  return `$${unitario.toLocaleString('es-AR')} por persona`
}