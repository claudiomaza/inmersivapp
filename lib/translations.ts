// Traducciones de la app - es-AR
const es: Record<string, string> = {
  // Navbar
  'nav.explorar': 'Explorar',
  'nav.primeros_pasos': 'Primeros pasos',
  'nav.panel_participante': 'Panel Participante',
  'nav.panel_anfitrion': 'Panel Anfitrión',
  'nav.panel_admin': 'Panel Admin',
  'nav.mis_reservas': 'Mis reservas',
  'nav.mensajes': 'Mensajes',
  'nav.notificaciones': 'Notificaciones',
  'nav.perfil': 'Perfil',
  'nav.ingresar': 'Ingresar',
  'nav.cerrar_sesion': 'Cerrar sesión',
  'nav.modo_oscuro': 'Modo oscuro',
  'nav.modo_claro': 'Modo claro',
  'nav.cambiar_idioma': 'Cambiar idioma',
  // Participante
  'panel.titulo': 'Panel Participante',
  'panel.iniciar_sesion': 'Necesitás iniciar sesión para ver tu panel.',
  // Anfitrión
  'anfitrion.titulo': 'Panel de Anfitrión',
  'anfitrion.cargando': 'Cargando panel…',
  // Admin
  'admin.titulo': 'Panel de Administración',
  // Actividades
  'actividad.reservar': 'Reservar',
  'actividad.procesando': 'Procesando…',
  'actividad.seleccionar_fecha': 'Seleccioná una fecha',
  'actividad.seleccionar_personas': 'Seleccioná al menos 1 persona',
  'actividad.horarios_disponibles': 'Horarios disponibles',
  'actividad.capacidad_max': 'Capacidad máxima',
  'actividad.grupos_max': 'Hasta {n} grupos',
  'actividad.personas_max': 'Capacidad máxima: {n} personas',
  'actividad.tenes_cupon': '¿Tenés un cupón?',
  'actividad.datas_participantes': 'Datos de los participantes',
  'actividad.persona': 'Persona {n}',
  'actividad.completar_datos': 'Completá nombre y DNI de todos los participantes',
  // Reservas
  'reserva.no_cobro': 'No se te cobrará hasta confirmar la actividad',
  // Cupón
  'cupon.codigo': 'Código',
  'cupon.aplicar': 'Aplicar',
  'cupon.verificando': 'Verificando…',
  'cupon.off_aplicado': '% OFF aplicado',
  'cupon.no_valido': 'Cupón no válido',
}

// Traducciones - en-US
const en: Record<string, string> = {
  'nav.explorar': 'Explore',
  'nav.primeros_pasos': 'Getting started',
  'nav.panel_participante': 'Participant Panel',
  'nav.panel_anfitrion': 'Host Panel',
  'nav.panel_admin': 'Admin Panel',
  'nav.mis_reservas': 'My bookings',
  'nav.mensajes': 'Messages',
  'nav.notificaciones': 'Notifications',
  'nav.perfil': 'Profile',
  'nav.ingresar': 'Sign in',
  'nav.cerrar_sesion': 'Sign out',
  'nav.modo_oscuro': 'Dark mode',
  'nav.modo_claro': 'Light mode',
  'nav.cambiar_idioma': 'Change language',
  'panel.titulo': 'Participant Panel',
  'panel.iniciar_sesion': 'You need to sign in to see your panel.',
  'anfitrion.titulo': 'Host Panel',
  'anfitrion.cargando': 'Loading panel…',
  'admin.titulo': 'Admin Panel',
  'actividad.reservar': 'Book',
  'actividad.procesando': 'Processing…',
  'actividad.seleccionar_fecha': 'Select a date',
  'actividad.seleccionar_personas': 'Select at least 1 person',
  'actividad.horarios_disponibles': 'Available times',
  'actividad.capacidad_max': 'Max capacity',
  'actividad.grupos_max': 'Up to {n} groups',
  'actividad.personas_max': 'Max capacity: {n} people',
  'actividad.tenes_cupon': 'Have a coupon?',
  'actividad.datas_participantes': 'Participant details',
  'actividad.persona': 'Person {n}',
  'actividad.completar_datos': 'Fill in name and ID for all participants',
  'reserva.no_cobro': "You won't be charged until the activity is confirmed",
  'cupon.codigo': 'Code',
  'cupon.aplicar': 'Apply',
  'cupon.verificando': 'Checking…',
  'cupon.off_aplicado': '% OFF applied',
  'cupon.no_valido': 'Invalid coupon',
}

export type LocaleDict = typeof es

export function getTranslations(locale: string): Record<string, string> {
  return locale === 'en-US' ? en : es
}

export function t(key: string, locale: string, params?: Record<string, string | number>): string {
  const dict = getTranslations(locale)
  let text = dict[key] || key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}