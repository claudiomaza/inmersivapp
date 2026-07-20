'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

export default function CompletarPerfilPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [intereses, setIntereses] = useState<string[]>([])

  const toggleInteres = (cat: string) => {
    setIntereses((prev) =>
      prev.includes(cat) ? prev.filter((i) => i !== cat) : [...prev, cat]
    )
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setCargando(true)

    const { error } = await supabase
      .from('perfiles')
      .update({ intereses })
      .eq('id', user.id)

    setCargando(false)

    if (error) {
      toast.error('Error al guardar')
      return
    }

    toast.success('¡Perfil completado!')
    router.push('/actividades')
  }

  if (!isSignedIn) return null

  return (
    <div className="mx-auto max-w-lg">
      <div className="text-center">
        <h1 className="font-titulos text-2xl font-bold text-texto">¡Bienvenido a Inmersivapp!</h1>
        <p className="mt-2 text-texto-secundario">
          Contanos qué te interesa para recomendarte experiencias
        </p>
      </div>

      <form onSubmit={guardar} className="mt-8">
        <label className="mb-3 block text-sm font-medium text-texto">
          Seleccioná tus intereses
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleInteres(cat)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                intereses.includes(cat)
                  ? 'bg-primario text-white'
                  : 'bg-gray-100 text-texto-secundario hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={cargando || intereses.length === 0}
          className="mt-8 w-full rounded-xl bg-primario px-4 py-3 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50"
        >
          {cargando ? 'Guardando…' : 'Comenzá a explorar'}
        </button>
      </form>
    </div>
  )
}