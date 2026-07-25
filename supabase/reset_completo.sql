-- ============================================================
-- INMERSIVAPP — Reset completo + Migración Clerk
-- Sello: cm2labs · 2026-07-25
-- ============================================================
-- EJECUTAR DESDE EL SQL EDITOR DE SUPABASE UNA SOLA VEZ
-- Orden: DROP → CREATE → RLS → SEED
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- 1. DROP TODO (orden inverso a FKs)
-- ════════════════════════════════════════════════════════════

DO $$ DECLARE
  pol RECORD;
  tbl TEXT;
BEGIN
  -- Drop todas las policies
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;

  -- Drop tablas en orden inverso
  FOR tbl IN SELECT unnest(ARRAY[
    'pagos_anfitrion', 'pagos', 'resenas', 'mensajes', 'notificaciones',
    'reservas', 'cupones', 'comercios', 'actividades', 'perfiles'
  ])
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename=tbl) THEN
      EXECUTE format('DROP TABLE %I CASCADE', tbl);
    END IF;
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS crear_perfil_nuevo();
DROP FUNCTION IF EXISTS incrementar_usos_cupon();

-- ════════════════════════════════════════════════════════════
-- 2. CREATE TABLAS
-- ════════════════════════════════════════════════════════════

-- 2a. PERFILES (Clerk — id TEXT)
CREATE TABLE perfiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  nombre TEXT NOT NULL,
  apellido TEXT,
  username TEXT,
  telefono TEXT,
  avatar_url TEXT,
  intereses TEXT[] DEFAULT '{}',
  rol TEXT NOT NULL DEFAULT 'participante' CHECK (rol IN ('participante', 'anfitrion', 'admin')),
  roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2b. ACTIVIDADES
CREATE TABLE actividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anfitrion_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  fecha DATE,
  hora TIME,
  lugar TEXT,
  precio DECIMAL NOT NULL DEFAULT 0,
  capacidad_max INT,
  imagen_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2c. COMERCIOS (sponsors que los anfitriones gestionan)
CREATE TABLE comercios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anfitrion_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rubro TEXT,
  direccion TEXT,
  contacto TEXT,
  beneficio_desc TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2d. CUPONES (vinculados a un comercio)
CREATE TABLE cupones (
  codigo TEXT PRIMARY KEY,
  comercio_id UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
  descuento_tipo TEXT NOT NULL DEFAULT 'porcentaje' CHECK (descuento_tipo IN ('porcentaje', 'fijo')),
  descuento_valor DECIMAL NOT NULL,
  condiciones TEXT,
  usos_maximos INT NOT NULL DEFAULT 100,
  usos_actuales INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2e. RESERVAS
CREATE TABLE reservas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  usuario_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  fecha DATE,
  cupon_codigo TEXT REFERENCES cupones(codigo) ON DELETE SET NULL,
  cantidad INT NOT NULL DEFAULT 1,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  codigo_confirmacion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2f. PAGOS (pago del participante)
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  reserva_id TEXT NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  monto DECIMAL NOT NULL,
  metodo_pago TEXT,
  mp_payment_id TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2g. PAGOS_ANFITRION (comisiones que cobra el anfitrión)
CREATE TABLE pagos_anfitrion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id TEXT NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  anfitrion_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  monto DECIMAL NOT NULL,
  comision DECIMAL DEFAULT 0,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado')),
  pagado_en TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2h. RESEÑAS
CREATE TABLE resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2i. MENSAJES
CREATE TABLE mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emisor_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  receptor_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2j. NOTIFICACIONES
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════
-- 3. RLS + POLICIES
-- ════════════════════════════════════════════════════════════

-- Tablas de lectura pública
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles: lectura pública" ON perfiles FOR SELECT USING (true);
CREATE POLICY "Actividades: lectura pública" ON actividades FOR SELECT USING (true);
CREATE POLICY "Comercios: lectura pública" ON comercios FOR SELECT USING (true);
CREATE POLICY "Reseñas: lectura pública" ON resenas FOR SELECT USING (true);

-- Perfiles: solo el dueño puede modificar
CREATE POLICY "Perfiles: escritura propia" ON perfiles
  FOR ALL USING (id = auth.uid()::TEXT);

-- Actividades: el anfitrión puede CRUD
CREATE POLICY "Actividades: anfitrión CRUD" ON actividades
  FOR ALL USING (anfitrion_id = auth.uid()::TEXT);

-- Comercios: el anfitrión puede CRUD
CREATE POLICY "Comercios: anfitrión CRUD" ON comercios
  FOR ALL USING (anfitrion_id = auth.uid()::TEXT);

-- Cupones: el anfitrión dueño del comercio puede CRUD
CREATE POLICY "Cupones: anfitrión CRUD" ON cupones
  FOR ALL USING (
    comercio_id IN (SELECT id FROM comercios WHERE anfitrion_id = auth.uid()::TEXT)
  );

-- Reservas, pagos, mensajes, notificaciones
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_anfitrion ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;

-- Reservas: el participante ve las suyas, el anfitrión ve las de su actividad
CREATE POLICY "Reservas: propia" ON reservas
  FOR SELECT USING (usuario_id = auth.uid()::TEXT);
CREATE POLICY "Reservas: anfitrión" ON reservas
  FOR SELECT USING (actividad_id IN (
    SELECT id FROM actividades WHERE anfitrion_id = auth.uid()::TEXT
  ));

-- Pagos: el participante ve los suyos
CREATE POLICY "Pagos: propio" ON pagos
  FOR ALL USING (usuario_id = auth.uid()::TEXT);

-- Pagos anfitrión: el anfitrión ve los suyos
CREATE POLICY "Pagos anfitrión: propio" ON pagos_anfitrion
  FOR SELECT USING (anfitrion_id = auth.uid()::TEXT);

-- Mensajes: solo ve los que le corresponden
CREATE POLICY "Mensajes: propio" ON mensajes
  FOR ALL USING (emisor_id = auth.uid()::TEXT OR receptor_id = auth.uid()::TEXT);

-- Notificaciones: propias
CREATE POLICY "Notificaciones: propio" ON notificaciones
  FOR ALL USING (usuario_id = auth.uid()::TEXT);

-- Cupones: lectura pública para que todos vean descuentos
CREATE POLICY "Cupones: lectura pública" ON cupones
  FOR SELECT USING (true);

-- ════════════════════════════════════════════════════════════
-- 4. SEED DATOS
-- ════════════════════════════════════════════════════════════

-- 4a. PERFILES
INSERT INTO perfiles (id, email, nombre, rol) VALUES
  ('user_anfitrion_1', 'maria@inmersivapp.com', 'María García', 'anfitrion'),
  ('user_anfitrion_2', 'carlos@inmersivapp.com', 'Carlos López', 'anfitrion'),
  ('user_participante_1', 'laura@inmersivapp.com', 'Laura Martínez', 'participante'),
  ('user_participante_2', 'pedro@inmersivapp.com', 'Pedro Ramírez', 'participante');

-- 4b. ACTIVIDADES
INSERT INTO actividades (id, anfitrion_id, titulo, descripcion, categoria, precio, capacidad_max) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 'Taller de Cerámica', 'Aprendé a hacer tu propia vajilla con técnicas artesanales', 'Arte', 2500, 15),
  ('a0000000-0000-0000-0000-000000000002', 'user_anfitrion_1', 'Clase de Cocina Vegana', 'Platos saludables sin ingredientes de origen animal', 'Gastronomía', 3500, 10),
  ('a0000000-0000-0000-0000-000000000003', 'user_anfitrion_2', 'Excursión a Sierra Chica', 'Caminata guiada por senderos naturales con vista panorámica', 'Naturaleza', 1500, 20);

-- 4c. COMERCIOS
INSERT INTO comercios (id, anfitrion_id, nombre, rubro, beneficio_desc) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 'Mercado Orgánico', 'Alimentos',
   'Comprando $2000 en productos, llevate un cupón de descuento para el taller de cocina'),
  ('c0000000-0000-0000-0000-000000000002', 'user_anfitrion_1', 'Librería El Péndulo', 'Cultura',
   'Comprando 3 libros, llevate 50% off en actividades culturales'),
  ('c0000000-0000-0000-0000-000000000003', 'user_anfitrion_2', 'Deportes Patagonia', 'Indumentaria',
   'Comprando una mochila, llevate $500 de descuento en excursiones');

-- 4d. CUPONES
INSERT INTO cupones (codigo, comercio_id, descuento_tipo, descuento_valor, condiciones, usos_maximos) VALUES
  ('COCINA10', 'c0000000-0000-0000-0000-000000000001', 'porcentaje', 10, 'Válido para la clase de cocina vegana', 50),
  ('CULTURA50', 'c0000000-0000-0000-0000-000000000002', 'porcentaje', 50, 'Válido en actividades culturales', 30),
  ('SIERRA500', 'c0000000-0000-0000-0000-000000000003', 'fijo', 500, 'Válido para excursiones a Sierra Chica', 40);

-- 4e. RESERVAS
INSERT INTO reservas (id, usuario_id, actividad_id, cantidad, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_participante_1', 'a0000000-0000-0000-0000-000000000001', 2, 'confirmada'),
  ('00000000-0000-0000-0000-000000000002', 'user_participante_2', 'a0000000-0000-0000-0000-000000000003', 1, 'pendiente');

-- 4f. PAGOS
INSERT INTO pagos (usuario_id, reserva_id, monto, metodo_pago, estado) VALUES
  ('user_participante_1', '00000000-0000-0000-0000-000000000001', 5000, 'mercadopago', 'aprobado');

-- 4g. PAGOS_ANFITRION
INSERT INTO pagos_anfitrion (reserva_id, anfitrion_id, monto, comision, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 4500, 500, 'pendiente');

-- 4h. RESEÑAS
INSERT INTO resenas (usuario_id, actividad_id, puntuacion, comentario) VALUES
  ('user_participante_1', 'a0000000-0000-0000-0000-000000000001', 5, 'Increíble experiencia, muy recomendable');

-- ════════════════════════════════════════════════════════════
-- 5. FUNCIONES ÚTILES
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION incrementar_usos_cupon(p_codigo TEXT)
RETURNS void AS $$
BEGIN
  UPDATE cupones
  SET usos_actuales = usos_actuales + 1
  WHERE codigo = p_codigo
    AND usos_actuales < usos_maximos;
END;
$$ LANGUAGE plpgsql;