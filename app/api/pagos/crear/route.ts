import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { crearPreferenciaPago } from '@/lib/mercadopago'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { actividad_id, reserva_id, titulo, monto, usuario_id } = body

    // Verificar sesión
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== usuario_id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Crear preferencia en MercadoPago
    const pref = await crearPreferenciaPago({
      titulo,
      monto,
      cantidad: 1,
      reservaId: reserva_id,
      usuarioEmail: user.email!,
      usuarioNombre: user.user_metadata?.nombre || 'Usuario',
    })

    // Guardar el registro de pago
    await supabase.from('pagos').insert({
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