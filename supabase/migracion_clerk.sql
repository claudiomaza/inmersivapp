-- ============================================================
-- INMERSIVAPP — Migración de Supabase Auth a Clerk
-- Sello: cm2labs · 2026-07-20
-- ============================================================
-- Ejecutar en orden en el SQL Editor de Supabase
-- ============================================================

-- 1. PRIMERO: Eliminar TODAS las políticas de RLS que referencien tablas
--    que vamos a modificar (necesario para poder cambiar tipos de columna)

-- Perfiles
DROP POLICY IF EXISTS "Perfiles lectura pública" ON perfiles;
DROP POLICY IF EXISTS "Perfiles actualización propia" ON perfiles;

-- Actividades
DROP POLICY IF EXISTS "Actividades lectura pública" ON actividades;
DROP POLICY IF EXISTS "Actividades escritura anfitrión" ON actividades;

-- Reservas
DROP POLICY IF EXISTS "Reservas lectura usuario" ON reservas;
DROP POLICY IF EXISTS "Reservas inserción usuario" ON reservas;
DROP POLICY IF EXISTS "Reservas cancelación usuario" ON reservas;

-- Pagos
DROP POLICY IF EXISTS "Pagos lectura propietario" ON pagos;

-- Reseñas
DROP POLICY IF EXISTS "Reseñas lectura pública" ON resenas;
DROP POLICY IF EXISTS "Reseñas inserción usuario" ON resenas;

-- Mensajes
DROP POLICY IF EXISTS "Mensajes lectura" ON mensajes;
DROP POLICY IF EXISTS "Mensajes inserción" ON mensajes;

-- Notificaciones
DROP POLICY IF EXISTS "Notificaciones lectura" ON notificaciones;
DROP POLICY IF EXISTS "Notificaciones inserción sistema" ON notificaciones;
DROP POLICY IF EXISTS "Notificaciones marcado leído" ON notificaciones;

-- 2. Agregar columna email a perfiles
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Eliminar trigger de auth.users (ya no existe con Clerk)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS crear_perfil_nuevo();

-- 4. Eliminar FK de perfiles a auth.users
ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_id_fkey;

-- 5. Cambiar perfiles.id de UUID a TEXT
--    Los UUIDs existentes se convierten automáticamente a TEXT
ALTER TABLE perfiles ALTER COLUMN id TYPE TEXT;

-- 6. Eliminar FK constraints existentes en otras tablas
ALTER TABLE actividades DROP CONSTRAINT IF EXISTS actividades_anfitrion_id_fkey;
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_usuario_id_fkey;
ALTER TABLE resenas DROP CONSTRAINT IF EXISTS resenas_usuario_id_fkey;
ALTER TABLE mensajes DROP CONSTRAINT IF EXISTS mensajes_emisor_id_fkey;
ALTER TABLE mensajes DROP CONSTRAINT IF EXISTS mensajes_receptor_id_fkey;
ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS notificaciones_usuario_id_fkey;

-- 7. Cambiar columnas FK a TEXT
ALTER TABLE actividades ALTER COLUMN anfitrion_id TYPE TEXT;
ALTER TABLE reservas ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE resenas ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE mensajes ALTER COLUMN emisor_id TYPE TEXT;
ALTER TABLE mensajes ALTER COLUMN receptor_id TYPE TEXT;
ALTER TABLE notificaciones ALTER COLUMN usuario_id TYPE TEXT;

-- 8. Recrear FK constraints
ALTER TABLE actividades ADD CONSTRAINT actividades_anfitrion_id_fkey
  FOREIGN KEY (anfitrion_id) REFERENCES perfiles(id) ON DELETE CASCADE;
ALTER TABLE reservas ADD CONSTRAINT reservas_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES perfiles(id) ON DELETE CASCADE;
ALTER TABLE resenas ADD CONSTRAINT resenas_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES perfiles(id) ON DELETE CASCADE;
ALTER TABLE mensajes ADD CONSTRAINT mensajes_emisor_id_fkey
  FOREIGN KEY (emisor_id) REFERENCES perfiles(id) ON DELETE CASCADE;
ALTER TABLE mensajes ADD CONSTRAINT mensajes_receptor_id_fkey
  FOREIGN KEY (receptor_id) REFERENCES perfiles(id) ON DELETE CASCADE;
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES perfiles(id) ON DELETE CASCADE;

-- 9. Recrear políticas de lectura pública (sin depender de auth.uid())
CREATE POLICY "Perfiles lectura pública" ON perfiles FOR SELECT USING (true);
CREATE POLICY "Actividades lectura pública" ON actividades FOR SELECT USING (true);
CREATE POLICY "Reseñas lectura pública" ON resenas FOR SELECT USING (true);

-- 10. Deshabilitar RLS para tablas donde todo el acceso es vía API routes
ALTER TABLE reservas DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones DISABLE ROW LEVEL SECURITY;