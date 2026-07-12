-- ============================================================
-- INMERSIVAPP — Esquema completo para Supabase
-- Sello: cm2labs · 2026-07-12
-- Corregido: cast de intereses en trigger (-> en vez de ->>)
-- ============================================================

-- 1. ENUMS
CREATE TYPE rol AS ENUM ('participante', 'anfitrion', 'patrocinador');
CREATE TYPE estado_reserva AS ENUM ('pendiente','confirmada','cancelada','completada');
CREATE TYPE estado_pago AS ENUM ('pendiente','aprobado','rechazado','reembolsado');

-- 2. PERFILES (sync con Auth.users)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  avatar_url TEXT,
  intereses TEXT[] DEFAULT '{}',
  roles rol[] DEFAULT '{participante}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: crear perfil al registrarse
CREATE OR REPLACE FUNCTION crear_perfil_nuevo()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, username, nombre, apellido, telefono, intereses)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'apellido',
    NEW.raw_user_meta_data->>'telefono',
    COALESCE((NEW.raw_user_meta_data->'intereses')::text[], '{}')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION crear_perfil_nuevo();

-- 3. ACTIVIDADES
CREATE TABLE actividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  categoria TEXT NOT NULL,
  fotos TEXT[] DEFAULT '{}',
  ubicacion JSONB NOT NULL DEFAULT '{}',
  anfitrion_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  anfitrion_nombre TEXT,
  horarios JSONB DEFAULT '{}',
  fechas DATE[] DEFAULT '{}',
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_actividades_categoria ON actividades(categoria);
CREATE INDEX idx_actividades_anfitrion ON actividades(anfitrion_id);
CREATE INDEX idx_actividades_activas ON actividades(activa) WHERE activa = true;

-- 4. RESERVAS
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado estado_reserva DEFAULT 'pendiente',
  codigo_confirmacion TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_actividad ON reservas(actividad_id);

-- 5. PAGOS
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  monto NUMERIC(10,2) NOT NULL,
  moneda TEXT DEFAULT 'ARS',
  metodo TEXT DEFAULT 'mercadopago',
  estado estado_pago DEFAULT 'pendiente',
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_pagos_reserva ON pagos(reserva_id);

-- 6. RESEÑAS
CREATE TABLE resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(actividad_id, usuario_id)
);

CREATE INDEX idx_resenas_actividad ON resenas(actividad_id);

-- 7. MENSAJES (chat entre usuarios)
CREATE TABLE mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emisor_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  receptor_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mensajes_participantes ON mensajes(emisor_id, receptor_id);
CREATE INDEX idx_mensajes_leido ON mensajes(receptor_id, leido) WHERE leido = false;

-- 8. NOTIFICACIONES
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  cuerpo TEXT,
  leido BOOLEAN DEFAULT false,
  tipo TEXT DEFAULT 'general',
  referencia_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leido);

-- 9. ROW LEVEL SECURITY
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Perfiles: lectura pública, escritura del propio usuario
CREATE POLICY "Perfiles lectura pública" ON perfiles FOR SELECT USING (true);
CREATE POLICY "Perfiles actualización propia" ON perfiles FOR UPDATE USING (auth.uid() = id);

-- Actividades: lectura pública, escritura del anfitrión
CREATE POLICY "Actividades lectura pública" ON actividades FOR SELECT USING (true);
CREATE POLICY "Actividades escritura anfitrión" ON actividades FOR ALL USING (auth.uid() = anfitrion_id);

-- Reservas: usuario ve las suyas, anfitrión ve las de su actividad
CREATE POLICY "Reservas lectura usuario" ON reservas FOR SELECT USING (
  auth.uid() = usuario_id OR
  auth.uid() IN (SELECT anfitrion_id FROM actividades WHERE id = reservas.actividad_id)
);
CREATE POLICY "Reservas inserción usuario" ON reservas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Reservas cancelación usuario" ON reservas FOR UPDATE USING (auth.uid() = usuario_id);

-- Pagos: solo lectura del dueño de la reserva
CREATE POLICY "Pagos lectura propietario" ON pagos FOR SELECT USING (
  auth.uid() IN (SELECT usuario_id FROM reservas WHERE id = pagos.reserva_id)
);

-- Reseñas: lectura pública, escritura del autor (una por actividad)
CREATE POLICY "Reseñas lectura pública" ON resenas FOR SELECT USING (true);
CREATE POLICY "Reseñas inserción usuario" ON resenas FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Mensajes: solo ven los suyos
CREATE POLICY "Mensajes lectura" ON mensajes FOR SELECT USING (
  auth.uid() = emisor_id OR auth.uid() = receptor_id
);
CREATE POLICY "Mensajes inserción" ON mensajes FOR INSERT WITH CHECK (auth.uid() = emisor_id);

-- Notificaciones: solo ve las suyas
CREATE POLICY "Notificaciones lectura" ON notificaciones FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Notificaciones inserción sistema" ON notificaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Notificaciones marcado leído" ON notificaciones FOR UPDATE USING (auth.uid() = usuario_id);