import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data: perfiles } = await supabaseAdmin
    .from('perfiles')
    .select('id')
    .contains('roles', ['admin'])
    .limit(1)

  const adminId = perfiles?.[0]?.id || null
  return NextResponse.json({ adminId })
}