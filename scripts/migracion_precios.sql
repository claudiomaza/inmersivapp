-- =============================================================
-- Migración: Precio por hora + Grupal
-- Inmersivapp — 2026-07-26
-- =============================================================
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================================

-- 1. Agregar columnas
ALTER TABLE actividades
  ADD COLUMN IF NOT EXISTS precio_por_hora NUMERIC,
  ADD COLUMN IF NOT EXISTS es_grupal BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS precio_grupo NUMERIC;

-- 2. Calcular precio_por_hora para cada actividad
--    Basado en precio actual / duración media de sus bloques horarios
UPDATE actividades a
SET precio_por_hora = sub.precio_hora
FROM (
  SELECT
    id,
    CASE
      WHEN horarios IS NOT NULL AND jsonb_array_length(horarios) > 0 THEN
        GREATEST(
          ROUND(
            (precio::numeric / GREATEST(
              (
                SELECT AVG(
                  EXTRACT(EPOCH FROM (
                    (h->>'hora_fin')::time - (h->>'hora')::time
                  )) / 3600
                )::numeric
                FROM jsonb_array_elements(horarios) AS h
                WHERE (h->>'hora_fin') IS NOT NULL
                  AND (h->>'hora') IS NOT NULL
                  AND (h->>'hora_fin')::time > (h->>'hora')::time
              ),
              0.5  -- mínimo 30 min
            ))::numeric,
            0
          ),
          500  -- mínimo $500/hora
        )
      ELSE precio
    END AS precio_hora
  FROM actividades
) sub
WHERE a.id = sub.id;

-- 3. Fallback: los que quedaron NULL → precio actual
UPDATE actividades
SET precio_por_hora = precio
WHERE precio_por_hora IS NULL;

-- 4. Actividades grupales
--    Rafting, Kayak, Cabalgata, Retiro Cacheuta
UPDATE actividades
SET es_grupal = true,
    precio_grupo = ROUND(precio * 1.5)
WHERE id IN (
  'a0000000-0000-0000-0000-000000000013',  -- Rafting
  'a0000000-0000-0000-0000-000000000022',  -- Kayak
  'a0000000-0000-0000-0000-000000000003',  -- Cabalgata
  'a0000000-0000-0000-0000-000000000020'   -- Retiro Cacheuta
);

-- 5. Verificación
SELECT
  id,
  titulo,
  precio AS precio_actual,
  precio_por_hora,
  CASE WHEN es_grupal THEN 'SÍ' ELSE 'NO' END AS es_grupal,
  precio_grupo
FROM actividades
ORDER BY id;