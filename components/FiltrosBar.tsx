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
    <div className="rounded-xl bg-superficie shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texto-secundario" />
          <input
            type="text"
            placeholder="Buscar actividades..."
            value={filtros.busqueda}
            onChange={(e) => actualizar('busqueda', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-fondo py-2.5 pl-10 pr-4 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20"
          />
        </div>
        <button
          onClick={() => setAbierto(!abierto)}
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition',
            abierto || activos > 0
              ? 'border-primario bg-primario/10 text-primario'
              : 'border-gray-200 text-texto-secundario hover:border-gray-300'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activos > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primario text-xs font-bold text-white">
              {activos}
            </span>
          )}
        </button>
      </div>

      {abierto && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-texto-secundario">Categoria</label>
              <select value={filtros.categoria} onChange={(e) => actualizar('categoria', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-fondo px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20">
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-texto-secundario">Provincia</label>
              <select value={filtros.provincia} onChange={(e) => actualizar('provincia', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-fondo px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20">
                <option value="">Todas</option>
                {provincias.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-texto-secundario">Departamento</label>
              <select value={filtros.departamento} onChange={(e) => actualizar('departamento', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-fondo px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20">
                <option value="">Todos</option>
                {departamentos.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-texto-secundario">Precio minimo</label>
              <input type="number" min="0" placeholder="$0" value={filtros.precioMin}
                onChange={(e) => actualizar('precioMin', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-fondo px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-texto-secundario">Precio maximo</label>
              <input type="number" min="0" placeholder="$999999" value={filtros.precioMax}
                onChange={(e) => actualizar('precioMax', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-fondo px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-texto-secundario">Desde hora</label>
              <select value={filtros.horaInicio} onChange={(e) => actualizar('horaInicio', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-fondo px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20">
                <option value="">Cualquier hora</option>
                {HORAS.map((h) => (<option key={h} value={h}>{h}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-texto-secundario">Hasta hora</label>
              <select value={filtros.horaFin} onChange={(e) => actualizar('horaFin', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-fondo px-3 py-2 text-sm focus:border-primario focus:ring-2 focus:ring-primario/20">
                <option value="">Cualquier hora</option>
                {HORAS.map((h) => (<option key={h} value={h}>{h}</option>))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-texto-secundario">Dias de la semana</label>
            <div className="flex flex-wrap gap-2">
              {dias.map((dia) => (
                <button key={dia} onClick={() => toggleDia(dia)}
                  className={cn('rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                    filtros.dias.includes(dia)
                      ? 'bg-primario text-white shadow-sm'
                      : 'bg-gray-100 text-texto hover:bg-gray-200'
                  )}>{dia}</button>
              ))}
            </div>
          </div>

          {activos > 0 && (
            <button onClick={limpiarFiltros}
              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-error hover:underline">
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
