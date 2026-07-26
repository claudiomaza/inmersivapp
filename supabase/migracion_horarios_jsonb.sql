-- ============================================================
-- Migración: horarios JSONB + duración de turnos
-- ============================================================
-- Agrega columna horarios (JSONB) a actividades y migra datos
-- existentes desde fechas[], dias_semana[], hora, hora_fin.
-- También agrega hora_inicio a reservas para trackear slots.
-- ============================================================

-- 1. Agregar columna horarios
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS horarios JSONB DEFAULT '[]'::jsonb;

-- 2. Migrar datos existentes a horarios
DO $$
DECLARE
  rec RECORD;
  bloque_fechas JSONB := '[]'::jsonb;
  bloque_dias JSONB := '[]'::jsonb;
  bloque_hora TEXT;
  bloque_hora_fin TEXT;
BEGIN
  FOR rec IN SELECT id, fechas, dias_semana, hora, hora_fin, fecha FROM actividades LOOP
    bloque_hora := COALESCE(rec.hora::text, '10:00');
    bloque_hora_fin := COALESCE(rec.hora_fin::text, '12:00');

    -- Bloque por fechas puntuales
    IF rec.fechas IS NOT NULL AND array_length(rec.fechas, 1) > 0 THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'fecha', f,
          'hora', bloque_hora,
          'hora_fin', bloque_hora_fin
        )
      ) INTO bloque_fechas
      FROM unnest(rec.fechas) AS f;
    ELSIF rec.fecha IS NOT NULL THEN
      bloque_fechas := jsonb_build_array(
        jsonb_build_object(
          'fecha', rec.fecha,
          'hora', bloque_hora,
          'hora_fin', bloque_hora_fin
        )
      );
    END IF;

    -- Bloque por días de la semana
    IF rec.dias_semana IS NOT NULL AND array_length(rec.dias_semana, 1) > 0 THEN
      SELECT jsonb_agg(
        jsonb_build_object(
          'dia_semana', d,
          'hora', bloque_hora,
          'hora_fin', bloque_hora_fin
        )
      ) INTO bloque_dias
      FROM unnest(rec.dias_semana) AS d;
    END IF;

    -- Combinar y guardar
    UPDATE actividades
    SET horarios = bloque_fechas || bloque_dias
    WHERE id = rec.id;
  END LOOP;
END $$;

-- 3. Agregar hora_inicio a reservas para saber qué slot reservaron
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS hora_inicio TEXT;

-- 4. Los campos viejos se mantienen por compatibilidad.
--    En una migración futura se pueden dropear:
-- ALTER TABLE actividades DROP COLUMN IF EXISTS fechas;
-- ALTER TABLE actividades DROP COLUMN IF EXISTS dias_semana;
-- ALTER TABLE actividades DROP COLUMN IF EXISTS hora;
-- ALTER TABLE actividades DROP COLUMN IF EXISTS hora_fin;
-- ALTER TABLE actividades DROP COLUMN IF EXISTS fecha;