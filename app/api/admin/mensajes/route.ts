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

  // Todos los mensajes donde el admin es emisor o receptor
  const { data: emitidos } = await supabaseAdmin
    .from('mensajes')
    .select('*, perfiles!emisor_id(nombre, apellido), perfiles!receptor_id(nombre, apellido)')
    .eq('emisor_id', userId)
    .order('created_at', { ascending: false })

  const { data: recibidos } = await supabaseAdmin
    .from('mensajes')
    .select('*, perfiles!emisor_id(nombre, apellido), perfiles!receptor_id(nombre, apellido)')
    .eq('receptor_id', userId)
    .order('created_at', { ascending: false })

  const todos = [...(emitidos || []), ...(recibidos || [])]

  // Agrupar por conversación (el otro usuario)
  const grupos: Record<string, any> = {}
  for (const msg of todos) {
    const otroId = msg.emisor_id === userId ? msg.receptor_id : msg.emisor_id
    if (!grupos[otroId] || new Date(msg.created_at) > new Date(grupos[otroId].created_at)) {
      grupos[otroId] = msg
    }
  }

  // No leídos por conversación
  const noLeidosMap: Record<string, number> = {}
  for (const msg of (recibidos || [])) {
    if (!msg.leido) {
      noLeidosMap[msg.emisor_id] = (noLeidosMap[msg.emisor_id] || 0) + 1
    }
  }

  const conversaciones = await Promise.all(
    Object.entries(grupos).map(async ([otroId, msg]) => {
      const otroPerfil = msg.emisor_id === userId
        ? msg.perfiles_receptor_id
        : msg.perfiles_emisor_id
      return {
        otroUsuarioId: otroId,
        otroNombre: otroPerfil?.nombre || 'Usuario',
        otroApellido: otroPerfil?.apellido || '',
        ultimoMensaje: msg.contenido,
        ultimaFecha: msg.created_at,
        noLeidos: noLeidosMap[otroId] || 0,
      }
    })
  )

  // Ordenar por más reciente
  conversaciones.sort((a, b) => new Date(b.ultimaFecha).getTime() - new Date(a.ultimaFecha).getTime())

  return NextResponse.json({ conversaciones })
}