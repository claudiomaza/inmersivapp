-- Fix RLS policies for Clerk + Supabase integration

-- 1. Drop old policies that use auth.uid()
DROP POLICY IF EXISTS "Perfiles: escritura propia" ON perfiles;
DROP POLICY IF EXISTS "Actividades: anfitrión CRUD" ON actividades;
DROP POLICY IF EXISTS "Comercios: anfitrión CRUD" ON comercios;
DROP POLICY IF EXISTS "Cupones: anfitrión CRUD" ON cupones;
DROP POLICY IF EXISTS "Reservas: lectura propia" ON reservas;
DROP POLICY IF EXISTS "Reservas: inserción" ON reservas;
DROP POLICY IF EXISTS "Reservas: actualización propia" ON reservas;
DROP POLICY IF EXISTS "Mensajes: lectura propia" ON mensajes;
DROP POLICY IF EXISTS "Mensajes: inserción" ON mensajes;
DROP POLICY IF EXISTS "Notificaciones: lectura propia" ON notificaciones;
DROP POLICY IF EXISTS "Pagos: lectura propia" ON pagos;
DROP POLICY IF EXISTS "Pagos_anfitrion: lectura propia" ON pagos_anfitrion;
DROP POLICY IF EXISTS "Reseñas: inserción" ON resenas;
DROP POLICY IF EXISTS "Anuncios: lectura pública" ON anuncios;

-- Enable RLS
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_anfitrion ENABLE ROW LEVEL SECURITY;
ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;

-- Perfiles: lectura pública
CREATE POLICY "Perfiles: lectura pública" ON perfiles
  FOR SELECT USING (true);

-- Perfiles: escritura propia (usando Clerk JWT -> sub)
CREATE POLICY "Perfiles: escritura propia" ON perfiles
  FOR ALL USING (id = auth.jwt() ->> 'sub');

-- Actividades: lectura pública
CREATE POLICY "Actividades: lectura pública" ON actividades
  FOR SELECT USING (true);

-- Actividades: CRUD del anfitrión
CREATE POLICY "Actividades: anfitrión CRUD" ON actividades
  FOR ALL USING (anfitrion_id = auth.jwt() ->> 'sub');

-- Comercios: lectura pública
CREATE POLICY "Comercios: lectura pública" ON comercios
  FOR SELECT USING (true);

-- Comercios: CRUD del anfitrión
CREATE POLICY "Comercios: anfitrión CRUD" ON comercios
  FOR ALL USING (anfitrion_id = auth.jwt() ->> 'sub');

-- Cupones: CRUD del anfitrión dueño del comercio
CREATE POLICY "Cupones: anfitrión CRUD" ON cupones
  FOR ALL USING (
    comercio_id IN (SELECT id FROM comercios WHERE anfitrion_id = auth.jwt() ->> 'sub')
  );

-- Reservas: lectura propia
CREATE POLICY "Reservas: lectura propia" ON reservas
  FOR SELECT USING (usuario_id = auth.jwt() ->> 'sub');

-- Reservas: inserción
CREATE POLICY "Reservas: inserción" ON reservas
  FOR INSERT WITH CHECK (usuario_id = auth.jwt() ->> 'sub');

-- Reservas: actualización propia
CREATE POLICY "Reservas: actualización propia" ON reservas
  FOR UPDATE USING (usuario_id = auth.jwt() ->> 'sub');

-- Mensajes
CREATE POLICY "Mensajes: lectura propia" ON mensajes
  FOR SELECT USING (destinatario_id = auth.jwt() ->> 'sub' OR remitente_id = auth.jwt() ->> 'sub');

CREATE POLICY "Mensajes: inserción" ON mensajes
  FOR INSERT WITH CHECK (remitente_id = auth.jwt() ->> 'sub');

-- Notificaciones: lectura propia
CREATE POLICY "Notificaciones: lectura propia" ON notificaciones
  FOR SELECT USING (usuario_id = auth.jwt() ->> 'sub');

-- Pagos: lectura propia
CREATE POLICY "Pagos: lectura propia" ON pagos
  FOR SELECT USING (usuario_id = auth.jwt() ->> 'sub');

-- Pagos_anfitrion: lectura propia
CREATE POLICY "Pagos_anfitrion: lectura propia" ON pagos_anfitrion
  FOR SELECT USING (anfitrion_id = auth.jwt() ->> 'sub');

-- Reseñas: lectura pública
CREATE POLICY "Reseñas: lectura pública" ON resenas
  FOR SELECT USING (true);

-- Reseñas: inserción propia
CREATE POLICY "Reseñas: inserción" ON resenas
  FOR INSERT WITH CHECK (usuario_id = auth.jwt() ->> 'sub');

-- Anuncios: lectura pública
CREATE POLICY "Anuncios: lectura pública" ON anuncios
  FOR SELECT USING (true);