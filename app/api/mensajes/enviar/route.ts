import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { receptor_id, actividad_id, contenido } = await req.json()

    if (!receptor_id || !contenido?.trim()) {
      return NextResponse.json(
        { error: 'receptor_id y contenido son requeridos' },
        { status: 400 }
      )
    }

    // Insertar mensaje
    const { data: mensaje, error: errMsg } = await supabaseAdmin
      .from('mensajes')
      .insert({
        emisor_id: userId,
        receptor_id,
        actividad_id: actividad_id || null,
        contenido: contenido.trim(),
        leido: false,
      })
      .select()
      .single()

    if (errMsg) {
      return NextResponse.json({ error: errMsg.message }, { status: 500 })
    }

    // Obtener nombre del emisor para la notificación
    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('nombre, apellido')
      .eq('id', userId)
      .single()

    const nombreEmisor = perfil
      ? `${perfil.nombre} ${perfil.apellido}`
      : 'Alguien'

    // Crear notificación para el receptor
    const { error: errNotif } = await supabaseAdmin
      .from('notificaciones')
      .insert({
        usuario_id: receptor_id,
        titulo: `Nuevo mensaje de ${nombreEmisor}`,
        cuerpo: contenido.trim().slice(0, 120),
        tipo: 'mensaje',
        referencia_id: mensaje.id,
        leido: false,
      })

    if (errNotif) {
      console.error('Error al crear notificación:', errNotif)
    }

    return NextResponse.json({ success: true, mensaje })
  } catch (error) {
    console.error('Error en mensajes/enviar:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}