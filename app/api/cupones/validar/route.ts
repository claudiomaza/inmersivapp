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
      .select('*, comercios!inner(nombre, rubro)')
      .eq('codigo', codigo.toUpperCase())
      .eq('activo', true)
      .single()

    if (error || !cupon) {
      return NextResponse.json({ valido: false, descuento: 0, mensaje: 'Cupón no encontrado' })
    }

    // Verificar límite de usos
    if (cupon.usos_actuales >= cupon.usos_maximos) {
      return NextResponse.json({ valido: false, descuento: 0, mensaje: 'Cupón agotado' })
    }

    // Calcular descuento
    let descuentoMostrar = 0
    let mensaje = ''

    if (cupon.descuento_tipo === 'porcentaje') {
      descuentoMostrar = cupon.descuento_valor
      mensaje = `¡Cupón válido! ${cupon.descuento_valor}% OFF en ${cupon.comercios?.nombre || 'el comercio'}`
    } else {
      descuentoMostrar = cupon.descuento_valor
      mensaje = `¡Cupón válido! $${cupon.descuento_valor} de descuento en ${cupon.comercios?.nombre || 'el comercio'}`
    }

    // Agregar condiciones si existen
    if (cupon.condiciones) {
      mensaje += `. ${cupon.condiciones}`
    }

    return NextResponse.json({
      valido: true,
      descuento: descuentoMostrar,
      tipo: cupon.descuento_tipo,
      mensaje,
    })
  } catch {
    return NextResponse.json({ valido: false, descuento: 0, mensaje: 'Error al validar' })
  }
}