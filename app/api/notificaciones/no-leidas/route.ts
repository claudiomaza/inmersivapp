import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ count: 0 })
  }

  const { count } = await supabaseAdmin
    .from('notificaciones')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', userId)
    .eq('leido', false)

  return NextResponse.json({ count: count ?? 0 })
}

export const dynamic = 'force-dynamic'
