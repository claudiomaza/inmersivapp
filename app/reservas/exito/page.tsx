'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

function ExitoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [codigo, setCodigo] = useState('')

  useEffect(() => {
    const prefId = searchParams.get('preference_id')
    if (prefId) {
      supabase.from('pagos').select('reserva_id').eq('mp_preference_id', prefId).single()
        .then(async ({ data }) => {
          if (data?.reserva_id) {
            const { data: reserva } = await supabase
              .from('reservas')
              .select('codigo_confirmacion')
              .eq('id', data.reserva_id)
              .single()
            setCodigo(reserva?.codigo_confirmacion || '')
          }
        })
    } else {
      toast.error('No se recibieron datos del pago')
    }
  }, [searchParams])

  return (
    <div className="mt-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-exito" />
      <h1 className="mt-4 font-titulos text-3xl font-bold text-texto">!Pago exitoso! 🎉</h1>
      <p className="mt-2 text-texto-secundario">Tu reserva esta confirmada.</p>
      {codigo && (
        <p className="mt-4 text-sm text-texto-secundario">
          Codigo de confirmacion: <span className="font-mono text-lg font-bold text-primario">{codigo}</span>
        </p>
      )}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/reservas" className="rounded-xl bg-primario px-6 py-2.5 font-semibold text-white">
          Ver mis reservas
        </Link>
        <Link href="/actividades" className="rounded-xl border-2 border-primario px-6 py-2.5 font-semibold text-primario">
          Explorar mas
        </Link>
      </div>
    </div>
  )
}

export default function ExitoPage() {
  return (
    <Suspense fallback={<div className="mt-16 text-center"><p className="text-texto-secundario">Cargando...</p></div>}>
      <ExitoContent />
    </Suspense>
  )
}
