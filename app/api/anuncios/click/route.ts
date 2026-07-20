import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { anuncio_id } = await req.json()

    if (!anuncio_id) {
      return NextResponse.json(
        { error: 'anuncio_id es requerido' },
        { status: 400 }
      )
    }

    // Leer clicks actual e incrementar
    const { data: anuncio } = await supabaseAdmin
      .from('anuncios')
      .select('clicks')
      .eq('id', anuncio_id)
      .single()

    if (anuncio) {
      const { error } = await supabaseAdmin
        .from('anuncios')
        .update({ clicks: (anuncio.clicks || 0) + 1 })
        .eq('id', anuncio_id)

      if (error) {
        console.error('Error al incrementar click:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en anuncios/click:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}