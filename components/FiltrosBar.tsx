'use client'

import { X, Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FiltrosActividades } from '@/hooks/useActividadesFiltros'

const CATEGORIAS = [
  'Arte', 'Naturaleza', 'Gastronomía', 'Música',
  'Fotografía', 'Yoga', 'Meditación', 'Tecnología',
  'Deportes', 'Manualidades', 'Teatro', 'Educación',
]

interface Props {
  filtros: FiltrosActividades
  actualizar: (campo: keyof FiltrosActividades, valor: any) => void
  limpiarFiltros: () => void
  activos: number
  lugares: string[]
  abierto: boolean
  setAbierto: (v: boolean) => void
}

export default function FiltrosBar({
  filtros,
  actualizar,
  limpiarFiltros,
  activos,
  lugares,
  abierto,
  setAbierto,
}: Props) {
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

            {/* Zona */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Zona / Departamento
              </label>
              <select
                value={filtros.lugar}
                onChange={(e) => actualizar('lugar', e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-fondo px-3.5 py-2.5 text-sm focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
              >
                <option value="">Todas</option>
                {lugares.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Fecha
              </label>
              <input
                type="date"
                value={filtros.fecha}
                onChange={(e) => actualizar('fecha', e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-fondo px-3.5 py-2.5 text-sm focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Precio mínimo
              </label>
              <input
                type="number"
                placeholder="Ej: 1000"
                value={filtros.precioMin || ''}
                onChange={(e) => actualizar('precioMin', e.target.value ? e.target.value : '')}
                className="w-full rounded-xl border border-gray-200/80 bg-fondo px-3.5 py-2.5 text-sm focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-texto-secundario">
                Precio máximo
              </label>
              <input
                type="number"
                placeholder="Ej: 5000"
                value={filtros.precioMax || ''}
                onChange={(e) => actualizar('precioMax', e.target.value ? e.target.value : '')}
                className="w-full rounded-xl border border-gray-200/80 bg-fondo px-3.5 py-2.5 text-sm focus:border-primario/40 focus:outline-none focus:ring-2 focus:ring-primario/10"
              />
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