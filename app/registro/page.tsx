'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

type Paso = 'formulario' | 'codigo'

export default function RegistroPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<Paso>('formulario')
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({
    nombre: '', apellido: '', username: '', telefono: '', intereses: [] as string[],
  })
  const [codigo, setCodigo] = useState('')
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

  const enviarCodigoRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.intereses.length === 0) {
      setError('Seleccioná al menos un interés')
      return
    }
    if (!email) {
      setError('Ingresá tu email')
      return
    }
    setCargando(true)
    setError('')

        // Crear usuario en Supabase Auth con metadata completa
    // Nota: intereses se formatea como literal de array PG para compatibilidad con el trigger
    const pgIntereses = form.intereses.length > 0
      ? `{${form.intereses.map(i => `"${i}"`).join(',')}}`
      : '{}'

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password: crypto.randomUUID(),
      options: {
        data: {
          nombre: form.nombre,
          apellido: form.apellido,
          username: form.username,
          telefono: form.telefono,
          intereses: pgIntereses,
          roles: '{participante}',
        },
      },
    })

    if (err) {
      setError(err.message)
      setCargando(false)
      return
    }

    // Enviar OTP para verificacion inmediata
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    if (otpErr) {
      toast.success('Cuenta creada. Revisa tu email para confirmar.')
      router.push('/login')
      return
    }

    toast.success('Codigo enviado a tu email')
    setPaso('codigo')
    setCargando(false)
  }  const verificarYCompletar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (codigo.length < 6) return
    setCargando(true)

    const { data, error: err } = await supabase.auth.verifyOtp({
      email,
      token: codigo,
      type: 'email',
    })

    if (err || !data.session) {
      setError('Código incorrecto o vencido')
      setCargando(false)
      return
    }

    // Actualizar perfil con datos del formulario
    await supabase.from('perfiles').update({
      nombre: form.nombre,
      apellido: form.apellido,
      username: form.username,
      telefono: form.telefono,
      intereses: form.intereses,
      roles: ['participante'],
    }).eq('id', data.session.user.id)

    toast.success('¡Cuenta creada correctamente! 🎉')
    router.push('/actividades')
    router.refresh()
  }

  const reenviar = async () => {
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    toast.success('Código reenviado')
  }

  return (
    <div className="mx-auto mt-12 max-w-lg">
      <h1 className="font-titulos text-3xl font-bold text-primario">
        Crear cuenta
      </h1>
      <p className="mt-2 text-texto-secundario">
        {paso === 'formulario'
          ? 'Completá tus datos para unirte'
          : `Ingresá el código que enviamos a ${email}`}
      </p>

      {paso === 'formulario' ? (
        <form onSubmit={enviarCodigoRegistro} className="mt-8 flex flex-col gap-4">
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
            <input type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre de usuario</label>
            <input type="text" required value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Teléfono (opcional)</label>
            <input type="tel" value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primario focus:ring-2 focus:ring-primario/20" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Intereses</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map((cat) => (
                <button key={cat} type="button" onClick={() => toggleInteres(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    form.intereses.includes(cat)
                      ? 'bg-primario text-white' : 'bg-gray-100 text-texto hover:bg-gray-200'
                  }`}>{cat}</button>
              ))}
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-error">{error}</p>}
          <button type="submit" disabled={cargando}
            className="rounded-lg bg-primario px-4 py-2.5 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50">
            {cargando ? 'Enviando…' : 'Crear cuenta'}
          </button>
          <p className="text-center text-sm text-texto-secundario">
            ¿Ya tenés cuenta?{' '}
            <a href="/login" className="font-medium text-primario hover:underline">Iniciá sesión</a>
          </p>
        </form>
      ) : (
        <form onSubmit={verificarYCompletar} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Código de verificación</label>
            <input type="text" inputMode="numeric" required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-2xl font-mono tracking-[0.5em] focus:border-primario focus:ring-2 focus:ring-primario/20"
              placeholder="000000" maxLength={6} autoFocus />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-error">{error}</p>}
          <button type="submit" disabled={cargando || codigo.length < 6}
            className="rounded-lg bg-primario px-4 py-2.5 font-semibold text-white transition hover:bg-primario-dark disabled:opacity-50">
            {cargando ? 'Verificando…' : 'Completar registro'}
          </button>
          <button type="button" onClick={reenviar}
            className="text-sm text-primario hover:underline">Reenviar código</button>
          <button type="button" onClick={() => setPaso('formulario')}
            className="text-sm text-texto-secundario hover:text-texto">Volver</button>
        </form>
      )}
    </div>
  )
}