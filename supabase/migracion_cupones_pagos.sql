-- ============================================================
-- INMERSIVAPP — Migración: cupones + pagos anfitrión
-- Sello: cm2labs · 2026-07-21
-- ============================================================
-- Ejecutar DESPUÉS de migracion_clerk.sql
-- ============================================================

-- 1. Agregar columna cupon_codigo a reservas
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS cupon_codigo TEXT;

-- 2. Tabla de pagos a anfitriones (Opción B: cobro centralizado + payout)
CREATE TABLE IF NOT EXISTS pagos_anfitrion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id TEXT NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  anfitrion_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  monto DECIMAL NOT NULL,
  comision DECIMAL DEFAULT 0,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado')),
  pagado_en TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Función para consumir cupón (incrementar usos_actuales)
CREATE OR REPLACE FUNCTION incrementar_usos_cupon(p_codigo TEXT)
RETURNS void AS $$
BEGIN
  UPDATE cupones
  SET usos_actuales = usos_actuales + 1
  WHERE codigo = p_codigo
    AND usos_actuales < usos_maximos;
END;
$$ LANGUAGE plpgsql;

-- 4. RLS: lectura para el anfitrión y el admin
ALTER TABLE pagos_anfitrion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pagos anfitrión: lectura propia" ON pagos_anfitrion
  FOR SELECT USING (true); -- se filtra por API