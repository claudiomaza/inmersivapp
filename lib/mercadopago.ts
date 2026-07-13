import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export interface CrearPreferenciaParams {
  titulo: string
  monto: number
  cantidad: number
  reservaId: string
  usuarioEmail: string
  usuarioNombre: string
}

export async function crearPreferenciaPago(params: CrearPreferenciaParams) {
  const preference = new Preference(mpClient)
  const result = await preference.create({
    body: {
      items: [
        {
          title: params.titulo,
          quantity: params.cantidad,
          unit_price: params.monto,
          currency_id: 'ARS',
        },
      ],
      payer: {
        email: params.usuarioEmail,
        name: params.usuarioNombre,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/reservas/exito`,
        failure: `${process.env.NEXT_PUBLIC_URL}/reservas/error`,
        pending: `${process.env.NEXT_PUBLIC_URL}/reservas/pendiente`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook/mercadopago`,
      metadata: {
        reserva_id: params.reservaId,
      },
    },
  })
  return result
}

export async function obtenerPago(mpPaymentId: number) {
  const payment = new Payment(mpClient)
  return payment.get({ id: mpPaymentId })
}