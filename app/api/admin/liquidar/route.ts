import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('roles')
    .eq('id', userId)
    .single()

  if (!perfil?.roles?.includes('admin')) {
    return NextResponse.json({ error: 'No tenés permisos de administración' }, { status: 403 })
  }

  // Todos los pagos pendientes a anfitriones, agrupados por anfitrión
  const { data: pendientes } = await supabaseAdmin
    .from('pagos_anfitrion')
    .select('*, perfiles!anfitrion_id(nombre, apellido, email)')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false })

  // Historial de pagos ya liquidados
  const { data: pagados } = await supabaseAdmin
    .from('pagos_anfitrion')
    .select('*, perfiles!anfitrion_id(nombre, apellido, email)')
    .eq('estado', 'pagado')
    .order('pagado_en', { ascending: false })

  // Agrupar pendientes por anfitrión
  const grupos: Record<string, any> = {}
  for (const p of pendientes || []) {
    const id = p.anfitrion_id
    if (!grupos[id]) {
      grupos[id] = {
        anfitrion_id: id,
        anfitrion_nombre: p.perfiles?.nombre || 'Desconocido',
        anfitrion_apellido: p.perfiles?.apellido || '',
        anfitrion_email: p.perfiles?.email || '',
        total: 0,
        comision: 0,
        pagos: [],
      }
    }
    grupos[id].total += p.monto
    grupos[id].comision += p.comision
    grupos[id].pagos.push(p)
  }

  return NextResponse.json({
    pendientes: Object.values(grupos),
    historial: pagados || [],
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('roles')
    .eq('id', userId)
    .single()

  if (!perfil?.roles?.includes('admin')) {
    return NextResponse.json({ error: 'No tenés permisos de administración' }, { status: 403 })
  }

  const body = await req.json()
  const { anfitrion_id, pago_ids } = body

  if (!anfitrion_id || !pago_ids || !Array.isArray(pago_ids) || pago_ids.length === 0) {
    return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('pagos_anfitrion')
    .update({
      estado: 'pagado',
      pagado_en: new Date().toISOString(),
    })
    .eq('anfitrion_id', anfitrion_id)
    .eq('estado', 'pendiente')
    .in('id', pago_ids)

  if (error) {
    return NextResponse.json({ error: 'Error al liquidar' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}