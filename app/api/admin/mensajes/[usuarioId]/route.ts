import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ usuarioId: string }> }
) {
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

  const { usuarioId } = await params

  const { data: mensajes } = await supabaseAdmin
    .from('mensajes')
    .select('*')
    .or(`and(emisor_id.eq.${userId},receptor_id.eq.${usuarioId}),and(emisor_id.eq.${usuarioId},receptor_id.eq.${userId})`)
    .order('created_at', { ascending: true })

  // Marcar como leídos los recibidos
  await supabaseAdmin
    .from('mensajes')
    .update({ leido: true })
    .eq('emisor_id', usuarioId)
    .eq('receptor_id', userId)
    .eq('leido', false)

  return NextResponse.json({ mensajes: mensajes || [] })
}