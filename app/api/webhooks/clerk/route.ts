import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  let evt
  try {
    evt = await verifyWebhook(req)
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Verification failed', { status: 400 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, username } = evt.data
    const email = email_addresses?.[0]?.email_address || ''

    await supabaseAdmin.from('perfiles').insert({
      id,
      email,
      username: username || '',
      nombre: first_name || '',
      apellido: last_name || '',
      intereses: [],
      roles: ['participante'],
    })
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, username } = evt.data
    const email = email_addresses?.[0]?.email_address || ''

    await supabaseAdmin
      .from('perfiles')
      .update({
        email,
        username: username || '',
        nombre: first_name || '',
        apellido: last_name || '',
      })
      .eq('id', id)
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data
    if (id) {
      await supabaseAdmin.from('perfiles').delete().eq('id', id)
    }
  }

  return new Response('Webhook received', { status: 200 })
}