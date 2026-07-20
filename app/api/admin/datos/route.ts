import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Verificar que sea admin (anfitrión)
  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('roles')
    .eq('id', userId)
    .single()

  if (!perfil?.roles?.includes('anfitrion')) {
    return NextResponse.json({ error: 'No tenés permisos de administración' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') || 'resumen'

  if (tipo === 'resumen') {
    const [actividadesRes, usuariosRes, reservasRes, resenasRes] = await Promise.all([
      supabaseAdmin.from('actividades').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('perfiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('reservas').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('resenas').select('*', { count: 'exact', head: true }),
    ])

    return NextResponse.json({
      totalActividades: actividadesRes.count || 0,
      totalUsuarios: usuariosRes.count || 0,
      totalReservas: reservasRes.count || 0,
      totalResenas: resenasRes.count || 0,
    })
  }

  if (tipo === 'actividades') {
    const { data } = await supabaseAdmin
      .from('actividades')
      .select('*')
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
      .select('*, actividades(*)')
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  if (tipo === 'resenas') {
    const { data } = await supabaseAdmin
      .from('resenas')
      .select('*, actividades(titulo)')
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
}