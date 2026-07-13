-- ═══════════════════════════════════════════
-- inmersivapp — Migración v2: Features faltantes
-- ═══════════════════════════════════════════
-- CORRER DESDE SUPABASE DASHBOARD → SQL EDITOR
-- ═══════════════════════════════════════════

-- 1. RESERVAS: agregar precio_final con descuento
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS precio_final NUMERIC;

-- 2. MENSAJES: agregar columna actividad_id
ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS actividad_id UUID REFERENCES actividades(id) ON DELETE SET NULL;

-- 2. ANUNCIOS
CREATE TABLE IF NOT EXISTS anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patrocinador_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  imagen_url TEXT,
  url_destino TEXT,
  segmento TEXT[] DEFAULT '{}',
  impresiones INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;

-- 3. CUPONES
CREATE TABLE IF NOT EXISTS cupones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anfitrion_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL UNIQUE,
  descuento_porcentaje INTEGER NOT NULL CHECK (descuento_porcentaje > 0 AND descuento_porcentaje <= 100),
  usos_maximos INTEGER DEFAULT 1,
  usos_actuales INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  vence DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;

-- ═══ RLS POLICIES ═══

-- Anuncios: cualquiera ve activos, admin crud
CREATE POLICY "anuncios_select_public" ON anuncios FOR SELECT
  USING (activo = true);

CREATE POLICY "anuncios_all_anfitrion" ON anuncios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND roles && ARRAY['anfitrion'::rol])
  );

-- Cupones: anfitrión ve/modifica los propios
CREATE POLICY "cupones_select_anfitrion" ON cupones FOR SELECT
  USING (anfitrion_id = auth.uid());

CREATE POLICY "cupones_insert_anfitrion" ON cupones FOR INSERT
  WITH CHECK (anfitrion_id = auth.uid());

CREATE POLICY "cupones_update_anfitrion" ON cupones FOR UPDATE
  USING (anfitrion_id = auth.uid());

-- Validar cupón (público + lectura)
CREATE POLICY "cupones_select_validacion" ON cupones FOR SELECT
  USING (activo = true);

-- Notificaciones: solo el dueño
DROP POLICY IF EXISTS "notificaciones_select_owner" ON notificaciones;
CREATE POLICY "notificaciones_select_owner" ON notificaciones FOR SELECT
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS "notificaciones_update_owner" ON notificaciones;
CREATE POLICY "notificaciones_update_owner" ON notificaciones FOR UPDATE
  USING (usuario_id = auth.uid());

-- Mensajes: emisor o receptor
DROP POLICY IF EXISTS "mensajes_select_participant" ON mensajes;
CREATE POLICY "mensajes_select_participant" ON mensajes FOR SELECT
  USING (emisor_id = auth.uid() OR receptor_id = auth.uid());

DROP POLICY IF EXISTS "mensajes_insert_auth" ON mensajes;
CREATE POLICY "mensajes_insert_auth" ON mensajes FOR INSERT
  WITH CHECK (emisor_id = auth.uid());

-- ═══ TRIGGERS ═══

-- Notificación automática al crear reserva
CREATE OR REPLACE FUNCTION fn_notificar_reserva()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notificaciones (usuario_id, titulo, cuerpo, tipo, referencia_id)
  VALUES (
    NEW.usuario_id,
    'Reserva creada',
    'Tu reserva fue registrada. Código: ' || COALESCE(NEW.codigo_confirmacion, 'pendiente'),
    'reserva',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notificar_reserva ON reservas;
CREATE TRIGGER trg_notificar_reserva
  AFTER INSERT ON reservas
  FOR EACH ROW EXECUTE FUNCTION fn_notificar_reserva();

-- Notificación al confirmar pago
CREATE OR REPLACE FUNCTION fn_notificar_pago()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'aprobado' AND (OLD.estado IS NULL OR OLD.estado = 'pendiente') THEN
    INSERT INTO notificaciones (usuario_id, titulo, cuerpo, tipo, referencia_id)
    SELECT
      r.usuario_id,
      'Pago confirmado',
      'Tu pago fue acreditado. Reserva confirmada.',
      'pago',
      NEW.id
    FROM reservas r WHERE r.id = NEW.reserva_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notificar_pago ON pagos;
CREATE TRIGGER trg_notificar_pago
  AFTER UPDATE ON pagos
  FOR EACH ROW EXECUTE FUNCTION fn_notificar_pago();

-- ═══ FUNCIÓN DE VALIDACIÓN DE CUPÓN ═══

CREATE OR REPLACE FUNCTION validar_cupon(p_codigo TEXT, p_anfitrion_id UUID DEFAULT NULL)
RETURNS TABLE(valido BOOLEAN, descuento INTEGER, mensaje TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_cupon cupones%ROWTYPE;
BEGIN
  SELECT * INTO v_cupon FROM cupones WHERE codigo = p_codigo AND activo = true;

  IF v_cupon.id IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Cupón no encontrado'::TEXT;
    RETURN;
  END IF;

  IF p_anfitrion_id IS NOT NULL AND v_cupon.anfitrion_id != p_anfitrion_id THEN
    RETURN QUERY SELECT false, 0, 'Cupón no válido para esta actividad'::TEXT;
    RETURN;
  END IF;

  IF v_cupon.vence IS NOT NULL AND v_cupon.vence < CURRENT_DATE THEN
    RETURN QUERY SELECT false, 0, 'Cupón vencido'::TEXT;
    RETURN;
  END IF;

  IF v_cupon.usos_actuales >= v_cupon.usos_maximos THEN
    RETURN QUERY SELECT false, 0, 'Cupón agotado'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_cupon.descuento_porcentaje, 'Cupón válido'::TEXT;
END;
$$;