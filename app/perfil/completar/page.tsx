'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Star } from 'lucide-react'

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
  const [rol, setRol] = useState<'participante' | 'anfitrion'>('participante')

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
      .update({
        intereses,
        roles: [rol],
      })
      .eq('id', user.id)

    setCargando(false)

    if (error) {
      toast.error('Error al guardar')
      return
    }

    toast.success('¡Perfil completado!')

    if (rol === 'anfitrion') {
      router.push('/actividades/nueva')
    } else {
      router.push('/actividades')
    }
  }

  if (!isSignedIn) return null

  return (
    <div className="mx-auto max-w-lg">
      <div className="text-center">
        <h1 className="font-titulos text-2xl font-bold text-texto">¡Bienvenido a Inmersivapp!</h1>
        <p className="mt-2 text-texto-secundario">
          Primero, decinos cómo querés participar
        </p>
      </div>

      <form onSubmit={guardar} className="mt-8">
        {/* Selección de rol */}
        <label className="mb-3 block text-sm font-medium text-texto">
          ¿Qué rol querés tener?
        </label>
        <div className="mb-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRol('participante')}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition ${
              rol === 'participante'
                ? 'border-primario bg-primario/5 text-primario'
                : 'border-gray-200 text-texto-secundario hover:border-gray-300'
            }`}
          >
            <User className={`h-8 w-8 ${rol === 'participante' ? 'text-primario' : ''}`} />
            <div>
              <p className="font-semibold text-sm">Participante</p>
              <p className="text-xs mt-0.5 opacity-70">Reservar y vivir experiencias</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRol('anfitrion')}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition ${
              rol === 'anfitrion'
                ? 'border-primario bg-primario/5 text-primario'
                : 'border-gray-200 text-texto-secundario hover:border-gray-300'
            }`}
          >
            <Star className={`h-8 w-8 ${rol === 'anfitrion' ? 'text-primario' : ''}`} />
            <div>
              <p className="font-semibold text-sm">Anfitrión</p>
              <p className="text-xs mt-0.5 opacity-70">Crear y publicar experiencias</p>
            </div>
          </button>
        </div>

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