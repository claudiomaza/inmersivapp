// ─── Tipos compartidos de Inmersivapp ───

export type Rol = 'participante' | 'anfitrion' | 'patrocinador'

export interface Perfil {
  id: string
  username: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  avatar_url?: string
  intereses: string[]
  roles: Rol[]
  created_at: string
}

export type Categoria =
  | 'Arte'
  | 'Tecnología'
  | 'Deportes'
  | 'Cocina'
  | 'Naturaleza'
  | 'Música'
  | 'Fotografía'

export interface Actividad {
  id: string
  titulo: string
  descripcion: string
  precio: number
  categoria: Categoria
  fotos: string[]
  ubicacion: Ubicacion
  anfitrion_id: string
  anfitrion_nombre: string
  horarios: HorarioSemanal
  fechas: string[] // ISO dates
  activa: boolean
  created_at: string
}

export interface Ubicacion {
  provincia: string
  departamento: string
  direccion: string
}

export interface HorarioSemanal {
  [dia: string]: { activo: boolean; inicio: string; fin: string }
}

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada'

export interface Reserva {
  id: string
  usuario_id: string
  actividad_id: string
  fecha: string // ISO
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