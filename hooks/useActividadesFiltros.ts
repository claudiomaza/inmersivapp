'use client'

import { useState, useMemo } from 'react'
import type { Actividad } from '@/types'

export interface FiltrosActividades {
  busqueda: string
  categoria: string
  lugar: string
  precioMin: string
  precioMax: string
  fecha: string
}

export function useActividadesFiltros(actividades: Actividad[]) {
  const [filtros, setFiltros] = useState<FiltrosActividades>({
    busqueda: '',
    categoria: '',
    lugar: '',
    precioMin: '',
    precioMax: '',
    fecha: '',
  })

  const actualizar = (campo: keyof FiltrosActividades, valor: any) =>
    setFiltros((f) => ({ ...f, [campo]: valor }))

  const limpiarFiltros = () =>
    setFiltros({
      busqueda: '',
      categoria: '',
      lugar: '',
      precioMin: '',
      precioMax: '',
      fecha: '',
    })

  const activos = useMemo(() => {
    const c = filtros
    return Object.entries({
      búsqueda: c.busqueda,
      categoría: c.categoria,
      lugar: c.lugar,
      'precio max': c.precioMax,
    }).filter(([_, v]) => v).length
  }, [filtros])

  const lugares = useMemo(() => {
    return [...new Set(actividades.map((a) => {
      // Extraer ciudad/departamento del campo lugar
      if (!a.lugar) return ''
      const partes = a.lugar.split(',').map((p) => p.trim())
      return partes.length > 1 ? partes[partes.length - 1] : partes[0]
    }).filter(Boolean))].sort()
  }, [actividades])

  const filtradas = useMemo(() => {
    const f = filtros
    return actividades.filter((a) => {
      // Búsqueda textual
      if (f.busqueda) {
        const q = f.busqueda.toLowerCase()
        const matchTitulo = a.titulo?.toLowerCase().includes(q)
        const matchDesc = a.descripcion?.toLowerCase().includes(q)
        const matchLugar = a.lugar?.toLowerCase().includes(q)
        if (!(matchTitulo || matchDesc || matchLugar)) return false
      }

      // Categoría
      if (f.categoria && a.categoria !== f.categoria) return false

      // Lugar (zona/departamento)
      if (f.lugar) {
        const lugarCompleto = a.lugar?.toLowerCase() || ''
        if (!lugarCompleto.includes(f.lugar.toLowerCase())) return false
      }

      // Precio
      if (f.precioMin && (a.precio ?? 0) < Number(f.precioMin)) return false
      if (f.precioMax && (a.precio ?? 0) > Number(f.precioMax)) return false

      // Fecha
      if (f.fecha) {
        const fechaFilter = f.fecha
        const fechaEnArray = a.fechas && Array.isArray(a.fechas) && a.fechas.includes(fechaFilter)
        const fechaLegacy = a.fecha === fechaFilter
        if (!fechaEnArray && !fechaLegacy) return false
      }

      return true
    })
  }, [actividades, filtros])

  return {
    filtros,
    actualizar,
    limpiarFiltros,
    activos,
    filtradas,
    lugares,
  }
}