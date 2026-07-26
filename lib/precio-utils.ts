'use client'

/**
 * Utilidades de precio dinámico para Inmersivapp
 * 
 * Lógica de cálculo:
 * 1. Si el bloque es grupal con precio_grupo → precio fijo grupal (no × personas)
 * 2. Si el bloque tiene precio_por_hora propio → precio_por_hora × duración del bloque
 * 3. Si la actividad tiene precio_por_hora → precio_por_hora × duración del bloque
 * 4. Sino → actividad.precio (legacy)
 */

export interface BloqueHorario {
  hora: string
  hora_fin?: string
  dia_semana?: number
  fecha?: string
  duracion_turno?: number
  /** Precio por hora especial para este bloque (sobreescribe el de la actividad) */
  precio_por_hora?: number
  /** Si este bloque es grupal (precio fijo por grupo) */
  es_grupal?: boolean
  /** Precio fijo del grupo para este bloque */
  precio_grupo?: number
  /** Cuántas personas entran en el precio grupal */
  personas_grupo?: number
}

export interface ActividadPrecio {
  /** Precio base (legacy, sin precio por hora) */
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
 * Calcula el precio unitario: lo que paga UNA persona (o el grupo si es grupal)
 */
export function calcularPrecioUnitario(
  actividad: ActividadPrecio,
  bloque?: BloqueHorario | null
): number {
  const hs = bloque ? duracionEnHoras(bloque) : 1

  // 1. Precio grupal del bloque (precio fijo, no depende de personas ni horas)
  if (bloque?.es_grupal && bloque?.precio_grupo) {
    return bloque.precio_grupo
  }

  // 2. Precio por hora especial del bloque (sobreescribe el de la actividad)
  if (bloque?.precio_por_hora) {
    return Math.round(bloque.precio_por_hora * hs)
  }

  // 3. Precio por hora de la actividad
  if (actividad.precio_por_hora) {
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
 * Texto descriptivo del tipo de precio base
 */
export function descripcionPrecio(actividad: ActividadPrecio): string {
  if (actividad.precio_por_hora) {
    return `$${actividad.precio_por_hora.toLocaleString('es-AR')}/hora por persona`
  }
  return 'por persona'
}

/**
 * Texto descriptivo del precio de un bloque específico
 */
export function descripcionPrecioBloque(
  actividad: ActividadPrecio,
  bloque: BloqueHorario
): string {
  const unitario = calcularPrecioUnitario(actividad, bloque)
  const hs = duracionEnHoras(bloque)

  if (bloque.es_grupal) {
    const personas = bloque.personas_grupo ? ` (hasta ${bloque.personas_grupo} pers.)` : ''
    return `$${unitario.toLocaleString('es-AR')} por grupo${personas}`
  }

  if (bloque.precio_por_hora) {
    return `$${unitario.toLocaleString('es-AR')} por persona (${hs}h × $${bloque.precio_por_hora.toLocaleString('es-AR')}/h, precio especial)`
  }

  if (actividad.precio_por_hora) {
    return `$${unitario.toLocaleString('es-AR')} por persona (${hs}h × $${actividad.precio_por_hora.toLocaleString('es-AR')}/h)`
  }

  return `$${unitario.toLocaleString('es-AR')} por persona`
}