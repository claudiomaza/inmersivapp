// ─── Tipos compartidos de Inmersivapp ───

export type Rol = 'participante' | 'anfitrion' | 'admin'

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
  fechas: string[]
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
  fecha: string
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
  puntuacion: number
  comentario: string
  created_at: string
}

export interface Comercio {
  id: string
  anfitrion_id: string
  nombre: string
  rubro: string
  direccion: string
  contacto: string
  beneficio_desc: string
  created_at: string
}

export interface Cupon {
  codigo: string
  comercio_id: string
  descuento_tipo: 'porcentaje' | 'fijo'
  descuento_valor: number
  condiciones: string
  usos_maximos: number
  usos_actuales: number
  activo: boolean
  created_at: string
}

export interface Notificacion {
  id: string
  usuario_id: string
  titulo: string
  cuerpo?: string
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
