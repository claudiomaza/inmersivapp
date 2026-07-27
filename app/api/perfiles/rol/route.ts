import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { rol } = await req.json()
  if (!rol) return NextResponse.json({ error: 'Rol requerido' }, { status: 400 })

  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('roles')
    .eq('id', userId)
    .single()

  const roles = perfil?.roles || []
  if (roles.includes(rol)) {
    return NextResponse.json({ message: 'Ya tenés este rol' })
  }

  const { error } = await supabaseAdmin
    .from('perfiles')
    .update({ roles: [...roles, rol] })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Rol agregado' })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { rol } = await req.json()
  if (!rol) return NextResponse.json({ error: 'Rol requerido' }, { status: 400 })

  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('roles')
    .eq('id', userId)
    .single()

  const roles = (perfil?.roles || []).filter((r: string) => r !== rol)

  const { error } = await supabaseAdmin
    .from('perfiles')
    .update({ roles })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Rol eliminado' })
}

export const dynamic = 'force-dynamic'
