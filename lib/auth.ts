// ─── Auth helpers para OTP + Resend ───
// Flujo: Login con OTP por email, registro completo en paso 2

import { supabase } from './supabase'
import type { Perfil } from '@/types'

/**
 * Enviar código OTP al email
 * Si el usuario no existe, crea cuenta automáticamente
 */
export async function enviarOTP(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Lo manejamos nosotros con registro previo
    },
  })
  return { error }
}

/**
 * Verificar OTP y obtener sesión
 */
export async function verificarOTP(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
  return { data, error }
}

/**
 * Registrar usuario nuevo + enviar OTP
 */
export async function registrarUsuario(email: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: crypto.randomUUID(), // Password aleatorio, solo login vía OTP
    options: {
      data: { roles: ['participante'] },
    },
  })
  return { data, error }
}

/**
 * Cargar perfil completo del usuario actual
 */
export async function cargarPerfil(userId: string): Promise<Perfil | null> {
  const { data } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

/**
 * Actualizar perfil del usuario
 */
export async function actualizarPerfil(userId: string, updates: Partial<Perfil>) {
  const { error } = await supabase
    .from('perfiles')
    .update(updates)
    .eq('id', userId)
  return { error }
}