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

  return NextResponse.json({
    roles: (perfil?.roles || []) as string[],
  })
}

export const dynamic = 'force-dynamic'
