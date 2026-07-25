import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') || 'resumen'

  if (tipo === 'resumen') {
    // Totales generales
    const [actividadesRes, usuariosRes, reservasRes, resenasRes] = await Promise.all([
      supabaseAdmin.from('actividades').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('perfiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('reservas').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('resenas').select('*', { count: 'exact', head: true }),
    ])

    // Recaudación: reservas confirmadas/completadas con precio
    const { data: reservasConPago } = await supabaseAdmin
      .from('reservas')
      .select('actividad_id, actividades!inner(precio, anfitrion_id)')
      .in('estado', ['confirmada', 'completada'])

    const totalBruto = (reservasConPago || []).reduce(
      (sum, r: any) => sum + (r.actividades?.precio || 0), 0
    )

    const comisionPorcentaje = 0.10 // 10% para la plataforma
    const comisionTotal = totalBruto * comisionPorcentaje
    const totalAnfitriones = totalBruto - comisionTotal

    // Ingresos de pagos_anfitrion
    const { data: pagosHechos } = await supabaseAdmin
      .from('pagos_anfitrion')
      .select('monto, comision, estado')

    const pagosPendientes = (pagosHechos || [])
      .filter((p: any) => p.estado === 'pendiente')
      .reduce((sum: number, p: any) => sum + Number(p.monto), 0)

    const comisionesPendientes = (pagosHechos || [])
      .filter((p: any) => p.estado === 'pendiente')
      .reduce((sum: number, p: any) => sum + Number(p.comision), 0)

    return NextResponse.json({
      totalActividades: actividadesRes.count || 0,
      totalUsuarios: usuariosRes.count || 0,
      totalReservas: reservasRes.count || 0,
      totalResenas: resenasRes.count || 0,
      // Recaudación
      totalBruto,
      comisionTotal,
      totalAnfitriones,
      comisionPorcentaje,
      pagosPendientes,
      comisionesPendientes,
      cantidadReservasPagadas: (reservasConPago || []).length,
    })
  }

  if (tipo === 'actividades') {
    const { data } = await supabaseAdmin
      .from('actividades')
      .select('*, perfiles!inner(nombre, email)')
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  if (tipo === 'usuarios') {
    const { data } = await supabaseAdmin
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  if (tipo === 'reservas') {
    const { data } = await supabaseAdmin
      .from('reservas')
      .select('*, actividades(titulo, precio)')
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  if (tipo === 'resenas') {
    const { data } = await supabaseAdmin
      .from('resenas')
      .select('*, actividades!inner(titulo)')
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
}