import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const { data: actividad, error } = await supabaseAdmin
      .from('actividades')
      .select('*, perfiles!anfitrion_id(nombre, apellido, id)')
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    return NextResponse.json({ actividad })
  }

  const { data: actividades, error } = await supabaseAdmin
    .from('actividades')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Error al obtener actividades' }, { status: 500 })
  return NextResponse.json({ actividades })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('roles')
    .eq('id', userId)
    .single()

  if (!perfil?.roles?.includes('anfitrion')) {
    return NextResponse.json({ error: 'No tenés permisos de anfitrión' }, { status: 403 })
  }

  const body = await req.json()
  const { titulo, descripcion, categoria, horarios, lugar, precio, capacidad_max, imagen_url, precio_por_hora, es_grupal, precio_grupo } = body

  if (!titulo || !categoria || precio === undefined) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const fechaPrincipal = horarios && horarios.length > 0 ? horarios[0].fecha || null : null

  const { data, error } = await supabaseAdmin
    .from('actividades')
    .insert({
      anfitrion_id: userId,
      titulo,
      descripcion: descripcion || 'Sin descripción',
      categoria,
      horarios: horarios || [],
      fecha: fechaPrincipal,
      lugar: lugar || 'A confirmar',
      precio: Number(precio),
      capacidad_max: capacidad_max || 20,
      imagen_url: imagen_url || null,
      precio_por_hora: precio_por_hora !== undefined ? Number(precio_por_hora) : null,
      es_grupal: es_grupal || false,
      precio_grupo: precio_grupo !== undefined ? Number(precio_grupo) : null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Error al crear actividad: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ actividad: data })
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { id, titulo, descripcion, categoria, horarios, lugar, precio, capacidad_max, imagen_url, precio_por_hora, es_grupal, precio_grupo } = body

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  const { data: existente } = await supabaseAdmin
    .from('actividades')
    .select('anfitrion_id')
    .eq('id', id)
    .single()

  if (!existente || existente.anfitrion_id !== userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const updates: Record<string, any> = {}
  if (titulo !== undefined) updates.titulo = titulo
  if (descripcion !== undefined) updates.descripcion = descripcion
  if (categoria !== undefined) updates.categoria = categoria
  if (horarios !== undefined) updates.horarios = horarios
  if (lugar !== undefined) updates.lugar = lugar
  if (precio !== undefined) updates.precio = Number(precio)
  if (capacidad_max !== undefined) updates.capacidad_max = capacidad_max
  if (imagen_url !== undefined) updates.imagen_url = imagen_url
  if (precio_por_hora !== undefined) updates.precio_por_hora = Number(precio_por_hora)
  if (es_grupal !== undefined) updates.es_grupal = es_grupal
  if (precio_grupo !== undefined) updates.precio_grupo = Number(precio_grupo)

  const { error } = await supabaseAdmin
    .from('actividades')
    .update(updates)
    .eq('id', id)
    .eq('anfitrion_id', userId)

  if (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}