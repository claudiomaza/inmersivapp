import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Endpoint temporal para migración de precios.
// Ejecutar una vez, luego eliminar o asegurar con auth.
export async function POST() {
  try {
    const { data: acts } = await supabaseAdmin
      .from('actividades')
      .select('id, titulo, precio, horarios')

    if (!acts) {
      return NextResponse.json({ error: 'No se encontraron actividades' }, { status: 500 })
    }

    const logs: string[] = []

    // 1. Primero, intentar agregar columnas via RPC
    try {
      await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE actividades ADD COLUMN IF NOT EXISTS precio_por_hora NUMERIC;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS es_grupal BOOLEAN DEFAULT false;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS precio_grupo NUMERIC;`
      })
      logs.push('✅ Columnas agregadas via exec_sql')
    } catch {
      // Fallback: intentar upsert para ver si las columnas existen
      logs.push('⚠️ exec_sql no disponible, intentando actualizar directamente...')
    }

    // 2. Calcular precio_por_hora para cada actividad
    for (const a of acts) {
      let precioHora = a.precio

      if (a.horarios?.length > 0) {
        const duraciones: number[] = []
        for (const h of a.horarios) {
          if (h.hora && h.hora_fin) {
            const [h1, m1] = h.hora.split(':').map(Number)
            const [h2, m2] = h.hora_fin.split(':').map(Number)
            const mins = (h2 * 60 + m2) - (h1 * 60 + m1)
            if (mins > 0) duraciones.push(mins)
          }
        }
        if (duraciones.length > 0) {
          const avgMin = duraciones.reduce((a, b) => a + b, 0) / duraciones.length
          const avgHs = avgMin / 60
          precioHora = Math.max(500, Math.round(a.precio / Math.max(avgHs, 0.5)))
        }
      }

      try {
        await supabaseAdmin
          .from('actividades')
          .update({ precio_por_hora: precioHora })
          .eq('id', a.id)
        logs.push(`✅ ${a.titulo}: $${a.precio} → precio_por_hora = $${precioHora}`)
      } catch (e: any) {
        logs.push(`❌ ${a.titulo}: ${e.message}`)
      }
    }

    // 3. Actividades grupales
    const grupales = [
      { id: 'a0000000-0000-0000-0000-000000000013', mult: 1.5 },
      { id: 'a0000000-0000-0000-0000-000000000022', mult: 1.5 },
      { id: 'a0000000-0000-0000-0000-000000000003', mult: 2 },
      { id: 'a0000000-0000-0000-0000-000000000020', mult: 2 },
    ]

    for (const g of grupales) {
      const { data: act } = await supabaseAdmin
        .from('actividades')
        .select('precio')
        .eq('id', g.id)
        .single()

      if (act) {
        const precioGrupo = Math.round(act.precio * g.mult)
        await supabaseAdmin
          .from('actividades')
          .update({ es_grupal: true, precio_grupo: precioGrupo })
          .eq('id', g.id)
        logs.push(`✅ ${g.id}: grupal, precio_grupo = $${precioGrupo}`)
      }
    }

    // 4. Verificar
    const { data: ver } = await supabaseAdmin
      .from('actividades')
      .select('id, titulo, precio, precio_por_hora, es_grupal, precio_grupo')
      .order('id', { ascending: true })

    return NextResponse.json({ ok: true, logs, resultado: ver })
  } catch (error) {
    console.error('Error en migración:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}