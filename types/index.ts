// ─── Tipos compartidos de Inmersivapp (v2 — schema nuevo) ───

export type Rol = 'participante' | 'anfitrion' | 'admin'

export interface Perfil {
  id: string
  email: string
  nombre: string
  telefono: string
  avatar_url?: string
  rol: Rol
  created_at: string
}

export type Categoria =
  | 'Arte'
  | 'Naturaleza'
  | 'Gastronomía'
  | 'Música'
  | 'Fotografía'
  | 'Yoga'
  | 'Meditación'
  | 'Tecnología'
  | 'Deportes'
  | 'Manualidades'
  | 'Teatro'
  | 'Educación'

export interface Actividad {
  id: string
  anfitrion_id: string
  titulo: string
  descripcion: string
  categoria: Categoria
  fecha: string
  hora: string
  lugar: string
  precio: number
  capacidad_max: number
  imagen_url: string
  created_at: string
}

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada'

export interface Reserva {
  id: string
  usuario_id: string
  actividad_id: string
  cantidad: number
  estado: EstadoReserva
  created_at: string
}

export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado'

export interface Pago {
  id: string
  usuario_id: string
  reserva_id: string
  monto: number
  metodo_pago: string
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
  tipo: string
  titulo: string
  mensaje?: string
  leido: boolean
  created_at: string
}

export interface Mensaje {
  id: string
  emisor_id: string
  receptor_id: string
  contenido: string
  leido: boolean
  created_at: string
}