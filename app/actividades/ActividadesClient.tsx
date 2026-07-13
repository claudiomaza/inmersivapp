'use client'

import { useState } from 'react'
import CardActividad from '@/components/CardActividad'
import FiltrosBar from '@/components/FiltrosBar'
import { useActividadesFiltros } from '@/hooks/useActividadesFiltros'
import type { Actividad } from '@/types'

interface Props {
  actividades: Actividad[]
}

export default function ActividadesClient({ actividades }: Props) {
  const {
    filtros, actualizar, toggleDia, limpiarFiltros, activos, filtradas,
  } = useActividadesFiltros(actividades)

  const provincias = [...new Set(actividades.map((a) => a.ubicacion?.provincia).filter(Boolean))] as string[]
  const departamentos = [...new Set(actividades.map((a) => a.ubicacion?.departamento).filter(Boolean))] as string[]

  const [abierto, setAbierto] = useState(false)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulos text-3xl font-bold text-primario">
          Explorar actividades
        </h1>
        <p className="mt-1 text-texto-secundario">
          Encontrá experiencias únicas cerca tuyo
        </p>
      </div>

      <FiltrosBar
        filtros={filtros}
        actualizar={actualizar}
        toggleDia={toggleDia}
        limpiarFiltros={limpiarFiltros}
        activos={activos}
        provincias={provincias}
        departamentos={departamentos}
        abierto={abierto}
        setAbierto={setAbierto}
      />

      <div className="mt-6">
        <p className="mb-4 text-sm text-texto-secundario">
          {filtradas.length} de {actividades.length} actividades
          {activos > 0 && ' filtradas'}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.length === 0 ? (
            <p className="col-span-full py-12 text-center text-texto-secundario">
              No hay actividades que coincidan con los filtros.
            </p>
          ) : (
            filtradas.map((act) => (
              <CardActividad key={act.id} actividad={act} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}