-- Agrega columna participantes (JSONB) a reservas
-- para almacenar los datos de cada persona en reservas grupales
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS participantes JSONB DEFAULT NULL;