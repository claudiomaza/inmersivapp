'use client'

import { X, Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FiltrosActividades } from '@/hooks/useActividadesFiltros'

const CATEGORIAS = [
  'Arte', 'Tecnología', 'Deportes', 'Cocina',
  'Naturaleza', 'Música', 'Fotografía', 'Manualidades',
  'Yoga', 'Meditación', 'Teatro', 'Educación',
]

const DIAS_DEFAULT = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const HORAS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

interface Props {
  filtros: FiltrosActividades
  actualizar: (campo: keyof FiltrosActividades, valor: any) => void
  toggleDia: (dia: string) => void
  limpiarFiltros: () => void
  activos: number
  provincias: string[]
  departamentos: string[]
  abierto: boolean
  setAbierto: (v: boolean) => void
}

export default function FiltrosBar({
  filtros,
  actualizar,
  toggleDia,
  limpiarFiltros,
  activos,
  provincias,
  departamentos,
  abierto,
  setAbierto,
}: Props) {
  const dias = DIAS_DEFAULT

  return (
    <div>
      {/* Search + toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-secundario" />
          <input
            type="text"
            placeholder="Buscar actividades..."
            value={filtros.busqueda}
            onChange={(e) => actualizar('busqueda', e.target.value)}
            className="w-full rounded-xl border border-gray-200/80 bg-superficie py-3 pl-10 pr-4 text-sm placeholder:text-texto-secundario/60 focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
          />
        </div>
        <button
          onClick={() => setAbierto(!abierto)}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition',
            abierto || activos > 0
              ? 'border-primario/30 bg-primario/5 text-primario'
              : 'border-gray-200/80 bg-superficie text-texto-secundario hover:border-gray-300'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activos > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primario px-1.5 text-[10px] font-bold text-white">
              {activos}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {abierto && (
        <div className="mt-4 rounded-2xl border border-gray-200/60 bg-superficie p-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Categoría */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Categoría
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => actualizar('categoria', e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-fondo px-3.5 py-2.5 text-sm focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
              >
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Provincia */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Provincia
              </label>
              <select
                value={filtros.provincia}
                onChange={(e) => actualizar('provincia', e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-fondo px-3.5 py-2.5 text-sm focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
              >
                <option value="">Todas</option>
                {provincias.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Departamento */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Departamento
              </label>
              <select
                value={filtros.departamento}
                onChange={(e) => actualizar('departamento', e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-fondo px-3.5 py-2.5 text-sm focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
              >
                <option value="">Todos</option>
                {departamentos.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Precio máximo
              </label>
              <input
                type="number"
                placeholder="Ej: 5000"
                value={filtros.precioMax || ''}
                onChange={(e) => actualizar('precioMax', e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-xl border border-gray-200/80 bg-fondo px-3.5 py-2.5 text-sm focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
              />
            </div>
          </div>

          {/* Horarios */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Desde hora
              </label>
              <select
                value={filtros.horaInicio}
                onChange={(e) => actualizar('horaInicio', e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-fondo px-3.5 py-2.5 text-sm focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
              >
                <option value="">Cualquier hora</option>
                {HORAS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Hasta hora
              </label>
              <select
                value={filtros.horaFin}
                onChange={(e) => actualizar('horaFin', e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-fondo px-3.5 py-2.5 text-sm focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
              >
                <option value="">Cualquier hora</option>
                {HORAS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Días */}
          <div className="mt-5">
            <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
              Días de la semana
            </label>
            <div className="flex flex-wrap gap-2">
              {dias.map((dia) => (
                <button
                  key={dia}
                  onClick={() => toggleDia(dia)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                    filtros.dias.includes(dia)
                      ? 'bg-primario text-white shadow-sm'
                      : 'bg-gray-100 text-texto-secundario hover:bg-gray-200'
                  )}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>

          {activos > 0 && (
            <button
              onClick={limpiarFiltros}
              className="mt-5 flex items-center gap-1.5 text-sm font-medium text-error/80 transition hover:text-error"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
