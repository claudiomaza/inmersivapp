import { supabaseAdmin } from '@/lib/supabase-admin'
import ActividadesClient from './ActividadesClient'

export const dynamic = 'force-dynamic'

export default async function ActividadesPage() {
  const { data: actividades } = await supabaseAdmin
    .from('actividades')
    .select('*')
    .eq('activa', true)
    .order('created_at', { ascending: false })

  return <ActividadesClient actividades={actividades || []} />
}