'use client'

import { useState, useMemo } from 'react'
import type { Actividad } from '@/types'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export interface FiltrosActividades {
  busqueda: string
  categoria: string
  provincia: string
  departamento: string
  dias: string[]
  precioMin: string
  precioMax: string
  horaInicio: string
  horaFin: string
}

function parseHora(h: string): number {
  // Soporta formatos "18:00-19:30" y "18:00"
  const match = h.match(/(\d{1,2}):\d{2}/)
  return match ? parseInt(match[1], 10) : -1
}

export function useActividadesFiltros(actividades: Actividad[]) {
  const [filtros, setFiltros] = useState<FiltrosActividades>({
    busqueda: '',
    categoria: '',
    provincia: '',
    departamento: '',
    dias: [],
    precioMin: '',
    precioMax: '',
    horaInicio: '',
    horaFin: '',
  })

  const actualizar = (campo: keyof FiltrosActividades, valor: any) =>
    setFiltros((f) => ({ ...f, [campo]: valor }))

  const toggleDia = (dia: string) =>
    setFiltros((f) => ({
      ...f,
      dias: f.dias.includes(dia) ? f.dias.filter((d) => d !== dia) : [...f.dias, dia],
    }))

  const limpiarFiltros = () =>
    setFiltros({
      busqueda: '',
      categoria: '',
      provincia: '',
      departamento: '',
      dias: [],
      precioMin: '',
      precioMax: '',
      horaInicio: '',
      horaFin: '',
    })

  const activos = useMemo(() => {
    const c = filtros
    return Object.entries({
      búsqueda: c.busqueda,
      categoría: c.categoria,
      provincia: c.provincia,
      departamento: c.departamento,
      días: c.dias.length > 0,
      'precio min': c.precioMin,
      'precio max': c.precioMax,
      'hora inicio': c.horaInicio,
      'hora fin': c.horaFin,
    }).filter(([_, v]) => v).length
  }, [filtros])

  const filtradas = useMemo(() => {
    const f = filtros
    return actividades.filter((a) => {
      // Búsqueda textual
      if (f.busqueda) {
        const q = f.busqueda.toLowerCase()
        const matchTitulo = a.titulo?.toLowerCase().includes(q)
        const matchDesc = a.descripcion?.toLowerCase().includes(q)
        const matchProv = a.ubicacion?.provincia?.toLowerCase().includes(q)
        const matchDepto = a.ubicacion?.departamento?.toLowerCase().includes(q)
        if (!(matchTitulo || matchDesc || matchProv || matchDepto)) return false
      }

      // Categoría
      if (f.categoria && a.categoria !== f.categoria) return false

      // Provincia
      if (f.provincia && a.ubicacion?.provincia !== f.provincia) return false

      // Departamento
      if (f.departamento && a.ubicacion?.departamento !== f.departamento) return false

      // Días de semana
      if (f.dias.length > 0) {
        const diasAct = a.horarios ? Object.keys(a.horarios) : []
        if (!f.dias.some((d) => diasAct.includes(d))) return false
      }

      // Precio
      if (f.precioMin && (a.precio ?? 0) < Number(f.precioMin)) return false
      if (f.precioMax && (a.precio ?? 0) > Number(f.precioMax)) return false

      // Horario: usamos el campo horarios como fallback
      // Los horarios vienen en formato "HH:MM-HH:MM" en el db.json original
      // pero en la base de datos está en horarios (jsonb) con estructura {dia: {inicio, fin}}
      const horas = a.horarios as Record<string, { inicio: string; fin: string }> | null
      if (f.horaInicio || f.horaFin) {
        const horaAct = horas ? Object.values(horas)[0]?.inicio : null
        if (!horaAct) return false
        const hNum = parseHora(horaAct)
        if (f.horaInicio && hNum < Number(f.horaInicio)) return false
        if (f.horaFin && hNum > Number(f.horaFin)) return false
      }

      return true
    })
  }, [actividades, filtros])

  return {
    filtros,
    actualizar,
    toggleDia,
    limpiarFiltros,
    activos,
    filtradas,
    DIAS,
  }
}