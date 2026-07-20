import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { codigo, actividad_id } = body

    if (!codigo) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
    }

    const { data: cupon, error } = await supabaseAdmin
      .from('cupones')
      .select('*')
      .eq('codigo', codigo.toUpperCase())
      .eq('activo', true)
      .single()

    if (error || !cupon) {
      return NextResponse.json({ valido: false, descuento: 0, mensaje: 'Cupón no encontrado' })
    }

    if (cupon.vence && new Date(cupon.vence) < new Date()) {
      return NextResponse.json({ valido: false, descuento: 0, mensaje: 'Cupón vencido' })
    }

    if (cupon.usos_actuales >= cupon.usos_maximos) {
      return NextResponse.json({ valido: false, descuento: 0, mensaje: 'Cupón agotado' })
    }

    return NextResponse.json({
      valido: true,
      descuento: cupon.descuento_porcentaje,
      mensaje: `¡Cupón válido! ${cupon.descuento_porcentaje}% OFF`,
    })
  } catch {
    return NextResponse.json({ valido: false, descuento: 0, mensaje: 'Error al validar' })
  }
}