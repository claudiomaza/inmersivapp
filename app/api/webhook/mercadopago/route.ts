import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { obtenerPago } from '@/lib/mercadopago'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createClient()

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
      : 'pendiente'

    // Actualizar pago
    await supabase
      .from('pagos')
      .update({
        estado: estadoPago,
        mp_payment_id: String(mpPaymentId),
      })
      .eq('reserva_id', reservaId)

    // Actualizar estado de la reserva
    await supabase
      .from('reservas')
      .update({ estado: estadoReserva })
      .eq('id', reservaId)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error en webhook MP:', error)
    return NextResponse.json({ received: true })
  }
}