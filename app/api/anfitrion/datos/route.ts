import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') || 'resumen'

  // Verificar que sea anfitrión
  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('roles')
    .eq('id', userId)
    .single()

  if (!perfil?.roles?.includes('anfitrion')) {
    return NextResponse.json({ error: 'No tenés permisos de anfitrión' }, { status: 403 })
  }

  // Mis actividades
  const { data: misActividades } = await supabaseAdmin
    .from('actividades')
    .select('id')
    .eq('anfitrion_id', userId)

  const ids = misActividades?.map((a) => a.id) || []

  if (tipo === 'resumen') {
    const [actividadesRes, reservasRes, resenasRes] = await Promise.all([
      supabaseAdmin
        .from('actividades')
        .select('*', { count: 'exact', head: true })
        .eq('anfitrion_id', userId),
      ids.length > 0
        ? supabaseAdmin
            .from('reservas')
            .select('*', { count: 'exact', head: true })
            .in('actividad_id', ids)
        : { count: 0 },
      ids.length > 0
        ? supabaseAdmin
            .from('resenas')
            .select('*', { count: 'exact', head: true })
            .in('actividad_id', ids)
        : { count: 0 },
    ])

    // Calcular ingresos estimados
    const { data: reservasConfirmadas } = ids.length > 0
      ? await supabaseAdmin
          .from('reservas')
          .select('actividad_id, actividades!inner(precio)')
          .in('actividad_id', ids)
          .in('estado', ['confirmada', 'completada'])
      : { data: [] }

    const ingresos = (reservasConfirmadas || []).reduce(
      (sum, r: any) => sum + (r.actividades?.precio || 0), 0
    )

    return NextResponse.json({
      totalActividades: actividadesRes.count || 0,
      totalReservas: reservasRes.count || 0,
      totalResenas: resenasRes.count || 0,
      ingresos,
    })
  }

  if (tipo === 'actividades') {
    const { data } = await supabaseAdmin
      .from('actividades')
      .select('*')
      .eq('anfitrion_id', userId)
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  if (tipo === 'reservas') {
    if (ids.length === 0) return NextResponse.json([])
    const { data } = await supabaseAdmin
      .from('reservas')
      .select('*, actividades!inner(titulo, precio, anfitrion_nombre)')
      .in('actividad_id', ids)
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  if (tipo === 'resenas') {
    if (ids.length === 0) return NextResponse.json([])
    const { data } = await supabaseAdmin
      .from('resenas')
      .select('*, actividades!inner(titulo)')
      .in('actividad_id', ids)
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  if (tipo === 'ingresos') {
    const { data: pendientes } = await supabaseAdmin
      .from('pagos_anfitrion')
      .select('*')
      .eq('anfitrion_id', userId)
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })

    const { data: pagados } = await supabaseAdmin
      .from('pagos_anfitrion')
      .select('monto')
      .eq('anfitrion_id', userId)
      .eq('estado', 'pagado')

    const totalPagado = (pagados || []).reduce((sum, p) => sum + p.monto, 0)

    return NextResponse.json({
      pendientes: pendientes || [],
      totalPagado,
    })
  }

  return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
}