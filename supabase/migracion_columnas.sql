-- ============================================================
-- INMERSIVAPP — Migración: columnas faltantes en DB
-- EJECUTAR EN EL SQL EDITOR DE SUPABASE
-- ============================================================
-- Sincroniza el schema con lo que espera el frontend
-- Agrega columnas faltantes a perfiles y reservas
-- ============================================================

-- perfiles: agregar apellido, username, intereses
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS apellido TEXT;
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS intereses TEXT[] DEFAULT '{}';

-- reservas: agregar fecha y codigo_confirmacion
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS fecha DATE;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS codigo_confirmacion TEXT;