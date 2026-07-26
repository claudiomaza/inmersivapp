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
  diaSemana: string
  duracionMin: string
  duracionMax: string
}

const DIAS_MAP: Record<string, number> = {
  lunes: 1, martes: 2, miércoles: 3, miercoles: 3,
  jueves: 4, viernes: 5, sábado: 6, sabado: 6, domingo: 7,
}

export function useActividadesFiltros(actividades: Actividad[]) {
  const [filtros, setFiltros] = useState<FiltrosActividades>({
    busqueda: '',
    categoria: '',
    lugar: '',
    precioMin: '',
    precioMax: '',
    fecha: '',
    diaSemana: '',
    duracionMin: '',
    duracionMax: '',
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
      diaSemana: '',
      duracionMin: '',
      duracionMax: '',
    })

  const activos = useMemo(() => {
    const c = filtros
    return Object.entries({
      búsqueda: c.busqueda,
      categoría: c.categoria,
      lugar: c.lugar,
      'precio max': c.precioMax,
      fecha: c.fecha,
      'día semana': c.diaSemana,
    }).filter(([_, v]) => v).length
  }, [filtros])

  const lugares = useMemo(() => {
    return [...new Set(actividades.map((a) => {
      if (!a.lugar) return ''
      const partes = a.lugar.split(',').map((p) => p.trim())
      return partes.length > 1 ? partes[partes.length - 1] : partes[0]
    }).filter(Boolean))].sort()
  }, [actividades])

  /** Calcula la duración en minutos de una actividad basada en sus horarios */
  const duracionActividad = (a: Actividad): number | null => {
    if (!a.horarios || !Array.isArray(a.horarios) || a.horarios.length === 0) return null
    // Tomar el primer bloque para calcular duración representativa
    const b = a.horarios[0]
    if (b.duracion_turno) return b.duracion_turno
    if (b.hora && b.hora_fin) {
      const [h1, m1] = b.hora.split(':').map(Number)
      const [h2, m2] = b.hora_fin.split(':').map(Number)
      return (h2 * 60 + m2) - (h1 * 60 + m1)
    }
    return null
  }

  /** Determina si una actividad se realiza en un día de la semana específico */
  const tieneDiaSemana = (a: Actividad, diaNum: number): boolean => {
    if (!a.horarios || !Array.isArray(a.horarios)) return false
    return a.horarios.some((b) => {
      if (b.dia_semana === diaNum) return true
      if (b.dia_desde && b.dia_hasta) return diaNum >= b.dia_desde && diaNum <= b.dia_hasta
      if (b.dia_desde && !b.dia_hasta) return b.dia_desde <= diaNum
      if (!b.dia_desde && b.dia_hasta) return diaNum <= b.dia_hasta
      return false
    })
  }

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

      // Lugar
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
        const horarios = a.horarios
        let matchFecha = false
        if (horarios && Array.isArray(horarios)) {
          for (const b of horarios) {
            if (b.fecha === fechaFilter) { matchFecha = true; break }
            if (b.fecha_desde && b.fecha_hasta) {
              if (fechaFilter >= b.fecha_desde && fechaFilter <= b.fecha_hasta) { matchFecha = true; break }
            }
            // Para días de la semana, verificar si la fecha cae en ese día
            if (b.dia_semana) {
              const d = new Date(fechaFilter + 'T12:00:00')
              const diaSem = d.getDay() === 0 ? 7 : d.getDay()
              if (diaSem === b.dia_semana) { matchFecha = true; break }
            }
            // Rango de días
            if (b.dia_desde || b.dia_hasta) {
              const d = new Date(fechaFilter + 'T12:00:00')
              const diaSem = d.getDay() === 0 ? 7 : d.getDay()
              const desde = b.dia_desde || 1
              const hasta = b.dia_hasta || 7
              if (diaSem >= desde && diaSem <= hasta) { matchFecha = true; break }
            }
          }
        }
        // Legacy
        if (!matchFecha) {
          const fechaLegacy = a.fecha === fechaFilter
          const fechaEnArray = a.fechas && Array.isArray(a.fechas) && a.fechas.includes(fechaFilter)
          matchFecha = fechaLegacy || fechaEnArray
        }
        if (!matchFecha) return false
      }

      // Día de la semana
      if (f.diaSemana) {
        const diaNum = DIAS_MAP[f.diaSemana.toLowerCase()]
        if (diaNum && !tieneDiaSemana(a, diaNum)) return false
      }

      // Duración
      const dur = duracionActividad(a)
      if (dur !== null) {
        if (f.duracionMin && dur < Number(f.duracionMin)) return false
        if (f.duracionMax && dur > Number(f.duracionMax)) return false
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