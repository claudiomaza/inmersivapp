import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { crearPreferenciaPago } from '@/lib/mercadopago'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { actividad_id, reserva_id, titulo, monto, usuario_id } = body

    if (userId !== usuario_id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener datos del usuario
    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('nombre, apellido, email')
      .eq('id', userId)
      .single()

    // Crear preferencia en MercadoPago
    const pref = await crearPreferenciaPago({
      titulo,
      monto,
      cantidad: 1,
      reservaId: reserva_id,
      usuarioEmail: perfil?.email || 'usuario@inmersivapp.app',
      usuarioNombre: perfil ? `${perfil.nombre} ${perfil.apellido}` : 'Usuario',
    })

    // Guardar el registro de pago
    await supabaseAdmin.from('pagos').insert({
      reserva_id,
      monto,
      moneda: 'ARS',
      metodo: 'mercadopago',
      estado: 'pendiente',
      mp_preference_id: pref.id,
    })

    return NextResponse.json({
      init_point: pref.init_point,
      preference_id: pref.id,
    })
  } catch (error) {
    console.error('Error al crear pago:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    )
  }
}