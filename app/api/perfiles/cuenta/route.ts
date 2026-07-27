import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Delete from Supabase
  const { error: dbError } = await supabaseAdmin
    .from('perfiles')
    .delete()
    .eq('id', userId)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Delete from Clerk
  try {
    const client = await clerkClient()
    await client.users.deleteUser(userId)
  } catch (e) {
    console.error('Error deleting Clerk user:', e)
  }

  return NextResponse.json({ message: 'Cuenta eliminada' })
}

export const dynamic = 'force-dynamic'
