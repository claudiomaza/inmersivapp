'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía',
]

export default function RegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '',
    telefono: '', username: '', intereses: [] as string[],
  })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const toggleInteres = (cat: string) => {
    setForm((f) => ({
      ...f,
      intereses: f.intereses.includes(cat)
        ? f.intereses.filter((i) => i !== cat)
        : [...f.intereses, cat],
    }))
  }

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.intereses.length === 0) {
      setError('Seleccioná al menos un interés')
      return
    }
    setCargando(true)
    setError('')

    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre: form.nombre,
          apellido: form.apellido,
          username: form.username,
          telefono: form.telefono,
          intereses: form.intereses,
          roles: ['participante'],
        },
      },
    })

    if (err) {
      setError(err.message)
      setCargando(false)
      return
    }

    if (data.user) {
      // Crear perfil en la tabla usuarios
      await supabase.from('usuarios').insert({
        id: data.user.id,
        username: form.username,
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        intereses: form.intereses,
        roles: ['participante'],
      })
    }

    router.push('/login?registro=exitoso')
  }

  return (
    <div className="mx-auto mt-12 max-w-lg">
      <h1 className="font-titulos text-3xl font-bold text-primario">
        Crear cuenta
      </h1>
      <p className="mt-2 text-texto-secundario">
        Paso {step} de 2 — Unite a Inmersivapp
      </p>

      <form onSubmit={registrar} className="mt-8 flex flex-col gap-4">
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre</label>
                <input type="text" required value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Apellido</label>
                <input type="text" required value={form.apellido}
                  onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Contraseña</label>
              <input type="password" required minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20" />
            </div>
            <button type="button" onClick={() => setStep(2)}
              className="rounded-lg bg-primario px-4 py-2.5 font-semibold text-white transition hover:bg-primario-dark">
              Siguiente
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre de usuario</label>
              <input type="text" required value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Teléfono</label>
              <input type="tel" value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Intereses (seleccioná al menos uno)
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleInteres(cat)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      form.intereses.includes(cat)
                        ? 'bg-primario text-white'
                        : 'bg-gray-100 text-texto hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-error">{error}</p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="rounded-lg border-2 border-gray-300 px-4 py-2.5 font-semibold text-texto transition hover:bg-gray-50">
                Volver
              </button>
              <button type="submit" disabled={cargando}
                className="flex-1 rounded-lg bg-primario px-4 py-2.5 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50">
                {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}