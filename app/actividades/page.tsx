import { createClient } from '@/lib/supabase-server'
import ActividadesClient from './ActividadesClient'

export const dynamic = 'force-dynamic'

export default async function ActividadesPage() {
  const supabase = await createClient()

  const { data: actividades } = await supabase
    .from('actividades')
    .select('*')
    .eq('activa', true)
    .order('created_at', { ascending: false })

  return <ActividadesClient actividades={actividades || []} />
}