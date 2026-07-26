import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { codigo, comercio_id, descuento_tipo, descuento_valor, condiciones, usos_maximos } = body

    if (!codigo || !comercio_id || !descuento_tipo || !descuento_valor) {
      return NextResponse.json({ error: 'Faltan campos requeridos: codigo, comercio_id, descuento_tipo, descuento_valor' }, { status: 400 })
    }

    if (!['porcentaje', 'fijo'].includes(descuento_tipo)) {
      return NextResponse.json({ error: 'descuento_tipo debe ser "porcentaje" o "fijo"' }, { status: 400 })
    }

    const valor = Number(descuento_valor)
    if (descuento_tipo === 'porcentaje' && (valor <= 0 || valor > 100)) {
      return NextResponse.json({ error: 'El porcentaje debe estar entre 1 y 100' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('cupones')
      .insert({
        codigo: codigo.toUpperCase().replace(/\s/g, ''),
        comercio_id,
        descuento_tipo,
        descuento_valor: valor,
        condiciones: condiciones || null,
        usos_maximos: usos_maximos ? Number(usos_maximos) : 100,
        usos_actuales: 0,
        activo: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ya existe un cupón con ese código' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Error al crear el cupón' }, { status: 500 })
    }

    return NextResponse.json({ exito: true, cupon: data })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
