import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { obtenerPago } from '@/lib/mercadopago'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // MercadoPago envía el payment_id en el webhook
    const mpPaymentId = body.data?.id
    if (!mpPaymentId) {
      return NextResponse.json({ received: true })
    }

    // Consultar estado del pago en MP
    const pago = await obtenerPago(Number(mpPaymentId))

    const estadoMP = pago.status
    const metadata = pago.metadata || {}
    const reservaId = metadata.reserva_id

    if (!reservaId) {
      return NextResponse.json({ received: true })
    }

    // Mapear estado de MP a nuestro enum
    const estadoPago = estadoMP === 'approved' ? 'aprobado'
      : estadoMP === 'rejected' ? 'rechazado'
      : estadoMP === 'refunded' ? 'reembolsado'
      : 'pendiente'

    const estadoReserva = estadoMP === 'approved' ? 'confirmada'
      : estadoMP === 'rejected' ? 'cancelada'
      : estadoMP === 'refunded' ? 'cancelada'
      : 'pendiente'

    // Actualizar pago
    await supabaseAdmin
      .from('pagos')
      .update({
        estado: estadoPago,
        mp_payment_id: String(mpPaymentId),
      })
      .eq('reserva_id', reservaId)

    // Actualizar estado de la reserva
    await supabaseAdmin
      .from('reservas')
      .update({ estado: estadoReserva })
      .eq('id', reservaId)

    // ─── Si el pago se aprobó ────────────────────────────────
    if (estadoMP === 'approved') {
      // Obtener datos de la reserva (actividad + cupón)
      const { data: reserva } = await supabaseAdmin
        .from('reservas')
        .select('cupon_codigo, actividad_id, actividades!inner(anfitrion_id, precio)')
        .eq('id', reservaId)
        .single()

      if (reserva) {
        const anfitrionId = (reserva.actividades as any).anfitrion_id
        const precio = (reserva.actividades as any).precio

        // 1. Consumir cupón si se usó uno
        if (reserva.cupon_codigo) {
          await supabaseAdmin.rpc('incrementar_usos_cupon', {
            p_codigo: reserva.cupon_codigo,
          })
        }

        // 2. Registrar pago a anfitrión (Opción B)
        const comision = Math.round(precio * 0.1) // 10% comisión plataforma
        await supabaseAdmin.from('pagos_anfitrion').insert({
          reserva_id: reservaId,
          anfitrion_id: anfitrionId,
          monto: precio - comision,
          comision,
          estado: 'pendiente',
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error en webhook MP:', error)
    return NextResponse.json({ received: true })
  }
}