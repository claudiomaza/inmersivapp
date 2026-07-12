'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PerfilPage() {
  const router = useRouter()
  const [sesion, setSesion] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSesion(data.session)
      if (data.session) {
        const { data: perfilData } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single()
        setPerfil(perfilData)
      }
      setCargando(false)
    })
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (cargando) return <p className="mt-8 text-center text-texto-secundario">Cargando…</p>

  if (!sesion) {
    return (
      <div className="mt-16 text-center">
        <h1 className="font-titulos text-2xl font-bold text-primario">Perfil</h1>
        <p className="mt-2 text-texto-secundario">Iniciá sesión para ver tu perfil.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-8 max-w-lg">
      <h1 className="font-titulos text-3xl font-bold text-primario">Mi perfil</h1>
      <div className="mt-6 rounded-xl bg-superficie p-6 shadow-sm">
        <div className="space-y-3">
          <p><span className="font-medium text-texto-secundario">Nombre:</span> {perfil?.nombre} {perfil?.apellido}</p>
          <p><span className="font-medium text-texto-secundario">Email:</span> {sesion.user.email}</p>
          <p><span className="font-medium text-texto-secundario">Teléfono:</span> {perfil?.telefono || '—'}</p>
          <p><span className="font-medium text-texto-secundario">Intereses:</span> {perfil?.intereses?.join(', ') || '—'}</p>
          <p><span className="font-medium text-texto-secundario">Roles:</span> {perfil?.roles?.join(', ') || 'participante'}</p>
        </div>
      </div>
      <button
        onClick={cerrarSesion}
        className="mt-6 w-full rounded-lg bg-error px-4 py-2.5 font-semibold text-white transition hover:bg-red-700"
      >
        Cerrar sesión
      </button>
    </div>
  )
}