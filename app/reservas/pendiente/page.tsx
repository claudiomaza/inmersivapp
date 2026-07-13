'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'

export default function PendientePage() {
  return (
    <div className="mt-16 text-center">
      <Clock className="mx-auto h-16 w-16 text-yellow-500" />
      <h1 className="mt-4 font-titulos text-3xl font-bold text-texto">Pago pendiente</h1>
      <p className="mt-2 text-texto-secundario">
        Estamos esperando la confirmación del pago. Te notificaremos cuando se acredite.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/reservas" className="rounded-xl bg-primario px-6 py-2.5 font-semibold text-white">
          Ver mis reservas
        </Link>
        <Link href="/actividades" className="rounded-xl border-2 border-primario px-6 py-2.5 font-semibold text-primario">
          Explorar actividades
        </Link>
      </div>
    </div>
  )
}