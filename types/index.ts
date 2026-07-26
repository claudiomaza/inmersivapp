// ─── Tipos compartidos de Inmersivapp ───

export type Rol = 'participante' | 'anfitrion' | 'admin' | 'patrocinador'

export interface Perfil {
  id: string
  username: string
  nombre: string
  apellido: string
  telefono: string
  avatar_url?: string
  intereses: string[]
  roles: Rol[]
  created_at: string
}

export type Categoria =
  | 'Arte'
  | 'Aventura'
  | 'Bienestar'
  | 'Cocina'
  | 'Cultura'
  | 'Deportes'
  | 'Educación'
  | 'Fotografía'
  | 'Gastronomía'
  | 'Inmersión'
  | 'Manualidades'
  | 'Meditación'
  | 'Música'
  | 'Naturaleza'
  | 'Teatro'
  | 'Tecnología'
  | 'Yoga'

export interface BloqueHorario {
  /** Fecha puntual: YYYY-MM-DD */
  fecha?: string
  /** Inicio de rango de fechas: YYYY-MM-DD */
  fecha_desde?: string
  /** Fin de rango de fechas: YYYY-MM-DD */
  fecha_hasta?: string
  /** Día de la semana (1=lunes…7=domingo) */
  dia_semana?: number
  /** Inicio de rango de días (1=lunes…7=domingo) */
  dia_desde?: number
  /** Fin de rango de días (1=lunes…7=domingo) */
  dia_hasta?: number
  /** Hora de inicio HH:MM */
  hora: string
  /** Hora de fin HH:MM */
  hora_fin: string
  /** Duración del turno en minutos (opcional). Si no se setea, el bloque completo es un turno */
  duracion_turno?: number
}

export interface Actividad {
  id: string
  titulo: string
  descripcion: string
  precio: number
  categoria: Categoria
  anfitrion_id: string
  fecha?: string
  hora?: string
  lugar?: string
  capacidad_max?: number
  imagen_url?: string
  activa?: boolean
  fotos?: string[]
  ubicacion?: Ubicacion
  horarios?: BloqueHorario[]
  fechas?: string[]
  created_at: string
  perfiles?: {
    nombre: string
    apellido?: string
    avatar_url?: string
  }
}

export interface Ubicacion {
  provincia: string
  departamento: string
  direccion: string
}

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada'

export interface Reserva {
  id: string
  usuario_id: string
  actividad_id: string
  fecha: string // ISO
  hora_inicio?: string
  estado: EstadoReserva
  codigo_confirmacion?: string
  created_at: string
}

export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado'

export interface Pago {
  id: string
  reserva_id: string
  monto: number
  moneda: string
  metodo: string
  estado: EstadoPago
  mp_preference_id?: string
  mp_payment_id?: string
  created_at: string
}

export interface Resena {
  id: string
  usuario_id: string
  actividad_id: string
  puntuacion: number // 1-5
  comentario: string
  created_at: string
}

export interface Cupon {
  id: string
  anfitrion_id: string
  codigo: string
  descuento_porcentaje: number
  usos_maximos: number
  usos_actuales: number
  activo: boolean
  vence: string
}

export interface Anuncio {
  id: string
  patrocinador_id: string
  titulo: string
  imagen_url: string
  url_destino: string
  segmento?: Categoria[]
  impresiones: number
  clicks: number
  activo: boolean
  created_at: string
}

export interface Notificacion {
  id: string
  usuario_id: string
  titulo: string
  mensaje?: string
  leido: boolean
  tipo?: string
  referencia_id?: string
  created_at: string
}

export interface Mensaje {
  id: string
  emisor_id: string
  receptor_id: string
  actividad_id?: string
  contenido: string
  leido: boolean
  created_at: string
}