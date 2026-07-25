-- ============================================================
-- INMERSIVAPP — Reset completo + Migración Clerk
-- Sello: cm2labs · 2026-07-25
-- ============================================================
-- EJECUTAR DESDE EL SQL EDITOR DE SUPABASE UNA SOLA VEZ
-- Orden: DROP → CREATE → RLS → SEED
-- ============================================================
-- INCLUYE: 32 actividades, 12 perfiles, 8 comercios, 16 cupones,
--           5 reservas, 79 reseñas
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- 1. DROP TODO (orden inverso a FKs)
-- ════════════════════════════════════════════════════════════

DO $$ DECLARE
  pol RECORD;
  tbl TEXT;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;

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

CREATE TABLE resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emisor_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  receptor_id TEXT NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

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
-- 3. RLS + POLICIES (Clerk-compatible: auth.jwt() ->> 'sub')
-- ════════════════════════════════════════════════════════════

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE comercios ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles: lectura pública" ON perfiles FOR SELECT USING (true);
CREATE POLICY "Actividades: lectura pública" ON actividades FOR SELECT USING (true);
CREATE POLICY "Comercios: lectura pública" ON comercios FOR SELECT USING (true);
CREATE POLICY "Reseñas: lectura pública" ON resenas FOR SELECT USING (true);

CREATE POLICY "Perfiles: escritura propia" ON perfiles
  FOR ALL USING (id = auth.jwt() ->> 'sub');

CREATE POLICY "Actividades: anfitrión CRUD" ON actividades
  FOR ALL USING (anfitrion_id = auth.jwt() ->> 'sub');

CREATE POLICY "Comercios: anfitrión CRUD" ON comercios
  FOR ALL USING (anfitrion_id = auth.jwt() ->> 'sub');

CREATE POLICY "Cupones: anfitrión CRUD" ON cupones
  FOR ALL USING (
    comercio_id IN (SELECT id FROM comercios WHERE anfitrion_id = auth.jwt() ->> 'sub')
  );

ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_anfitrion ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reservas: propia" ON reservas
  FOR SELECT USING (usuario_id = auth.jwt() ->> 'sub');
CREATE POLICY "Reservas: anfitrión" ON reservas
  FOR SELECT USING (actividad_id IN (
    SELECT id FROM actividades WHERE anfitrion_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Pagos: propio" ON pagos
  FOR ALL USING (usuario_id = auth.jwt() ->> 'sub');

CREATE POLICY "Pagos anfitrión: propio" ON pagos_anfitrion
  FOR SELECT USING (anfitrion_id = auth.jwt() ->> 'sub');

CREATE POLICY "Mensajes: propio" ON mensajes
  FOR ALL USING (emisor_id = auth.jwt() ->> 'sub' OR receptor_id = auth.jwt() ->> 'sub');

CREATE POLICY "Notificaciones: propio" ON notificaciones
  FOR ALL USING (usuario_id = auth.jwt() ->> 'sub');

CREATE POLICY "Cupones: lectura pública" ON cupones
  FOR SELECT USING (true);

-- ════════════════════════════════════════════════════════════
-- 4. SEED DATOS
-- ════════════════════════════════════════════════════════════

BEGIN;

INSERT INTO perfiles (id, email, nombre, apellido, username, telefono, avatar_url, intereses, rol, roles) VALUES
  ('user_3H0xBWNBlh1Nwas6ul1dqxdcNbg', 'sadmin@inmersivapp.com', 'Super', 'Admin', 'sadmin', NULL, NULL, '{Administración,Gestión}', 'admin', '{admin,anfitrion}'),
  ('user_anfitrion_1', 'maria@inmersivapp.com', 'María', 'García', 'maria_garcia', NULL, NULL, '{Arte,Cocina,Inmersión}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_2', 'carlos@inmersivapp.com', 'Carlos', 'López', 'carlos_lopez', NULL, NULL, '{Naturaleza,Aventura,Deportes}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_3', 'lucia.fernandez@inmersivapp.com', 'Lucía', 'Fernández', 'lucia_fdez', '+5492615001003', NULL, '{Gastronomía,Cultura}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_4', 'andres.perez@inmersivapp.com', 'Andrés', 'Pérez', 'andres_perez', '+5492615001004', NULL, '{Fotografía,Tecnología}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_5', 'carolina.diaz@inmersivapp.com', 'Carolina', 'Díaz', 'caro_diaz', '+5492615001005', NULL, '{Bienestar,Inmersión}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_6', 'martin.sosa@inmersivapp.com', 'Martín', 'Sosa', 'martin_sosa', '+5492615001006', NULL, '{Música,Arte}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_7', 'valentina.ruiz@inmersivapp.com', 'Valentina', 'Ruiz', 'valen_ruiz', '+5492615001007', NULL, '{Arte,Manualidades,Cultura}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_8', 'fernando.torres@inmersivapp.com', 'Fernando', 'Torres', 'fer_torres', '+5492615001008', NULL, '{Tecnología,Innovación}', 'anfitrion', '{anfitrion}'),
  ('user_participante_1', 'laura@inmersivapp.com', 'Laura', 'Martínez', 'lau_martinez', NULL, NULL, '{Arte,Naturaleza}', 'participante', '{participante}'),
  ('user_participante_2', 'pedro@inmersivapp.com', 'Pedro', 'Ramírez', 'pedro_ramirez', NULL, NULL, '{Aventura,Deportes}', 'participante', '{participante}'),
  ('user_participante_3', 'sofia@inmersivapp.com', 'Sofía', 'Morales', 'sofia_morales', NULL, NULL, '{Cultura,Gastronomía}', 'participante', '{participante}'),
  ('user_participante_4', 'juan@inmersivapp.com', 'Juan', 'Álvarez', 'juan_alvarez', NULL, NULL, '{Tecnología,Música}', 'participante', '{participante}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO actividades (id, anfitrion_id, titulo, descripcion, categoria, fecha, hora, lugar, precio, capacidad_max, imagen_url) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 'Taller de Cerámica', 'La cerámica artesanal es una de las expresiones más antiguas de la cultura mendocina, y en este taller vas a conectar con esa tradición de una manera completamente práctica.Modelado, torno y esmaltado en una experiencia de 3 horas. Incluye todos los materiales, cocción de tu pieza y un vino de la región para cerrar la jornada. Te llevás tu creación lista en 15 días.', 'Arte', '2026-08-15', '10:00', 'Chacras de Coria', 2500, 12, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'),
  ('a0000000-0000-0000-0000-000000000002', 'user_anfitrion_1', 'Clase de Cocina Vegana', 'La cocina basada en plantas dejó de ser una tendencia para convertirse en un estilo de vida. En esta clase vas a descubrir que lo vegano puede ser tan sabroso como cualquier plato tradicional.Platos saludables sin ingredientes de origen animal, del huerto a la mesa. Cocinamos desde cero: entrada, plato principal y postre, con ingredientes de la huerta orgánica de la casa. Incluye recetario digital.', 'Cocina', '2026-08-20', '11:00', 'Ciudad de Mendoza', 3500, 10, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'),
  ('a0000000-0000-0000-0000-000000000003', 'user_anfitrion_2', 'Excursión a Sierra Chica', 'Sierra Chica es uno de los secretos mejor guardados de Mendoza. A solo 30 minutos de la ciudad, un paisaje de montaña con formaciones rocosas milenarias y una vista panorámica del valle que te deja sin aliento.Caminata guiada por senderos de montaña con guía especializado en flora y fauna local. 4 horas de trekking moderado. Incluye snorkel, equipo de hidratación y vianda saludable.', 'Naturaleza', '2026-08-17', '09:00', 'Sierra Chica, Luján de Cuyo', 3500, 15, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800'),
  ('a0000000-0000-0000-0000-000000000004', 'user_anfitrion_6', 'Círculo de Tambores en el Centro', 'La percusión en círculo es una de las experiencias musicales más primitivas y poderosas. No hace falta saber música, solo dejarse llevar por el ritmo colectivo.Tambores africanos, percusión corporal y ritmos latinos en una jam session abierta a todo nivel. Instrumentos incluidos. 2 horas de música en vivo en Plaza España. Cierre con improvisación grupal.', 'Música', '2026-08-24', '18:00', 'Plaza España, Ciudad', 3500, 20, 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800'),
  ('a0000000-0000-0000-0000-000000000005', 'user_anfitrion_3', 'Cata de Vinos a Ciegas', 'El vino es la identidad de Mendoza. En esta cata a ciegas vas a descubrir que el paladar sabe más de lo que te imaginás. Sin etiquetas, sin prejuicios, solo el vino y vos.Cata a ciegas de 6 etiquetas mendocinas premium. Incluye tabla de quesos y charcuterie, ficha de cata personalizada y sommelier guía. La ganadora se revela al final.', 'Gastronomía', '2026-08-22', '19:00', 'Chacras de Coria', 5000, 12, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'),
  ('a0000000-0000-0000-0000-000000000006', 'user_anfitrion_7', 'Tejedora por un Día', 'El tejido andino es una tradición milenaria que las comunidades originarias de Mendoza mantienen viva. Cada diseño cuenta una historia, cada color tiene un significado.Aprendé telar mapuche y tejido andino con artesanas de la comunidad Huarpe de Lavalle. Te llevás tu tejido puesto. Incluye materiales, mateada durante la actividad y certificado de participación.', 'Cultura', '2026-08-26', '10:00', 'Lavalle', 6000, 8, 'https://images.unsplash.com/photo-1715374033196-0ff662284a7e?w=800'),
  ('a0000000-0000-0000-0000-000000000007', 'user_anfitrion_8', 'Escape Room Digital: El Misterio del Código Perdido', 'La tecnología y el misterio se combinan en un escape room que usa realidad aumentada para transformar el centro de Mendoza en un tablero de juego gigante.Escape room con realidad aumentada en el centro de Mendoza. Descifrá códigos, encontrá pistas virtuales y resolvé el misterio en 60 minutos. Incluye dispositivo móvil con RA, asistencia remota y cerveza artesanal de regalo al resolverlo.', 'Tecnología', '2026-08-30', '15:00', 'Centro de Mendoza', 5000, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'),
  ('a0000000-0000-0000-0000-000000000008', 'user_anfitrion_4', 'Fotografía Nocturna Urbana', 'La ciudad de Mendoza de noche tiene otra personalidad. Las luces, las sombras, los colores artificiales crean un escenario único para la fotografía.Paseo fotográfico nocturno por el centro histórico. Aprendé técnicas de larga exposición, ISO y composición nocturna. Trípode incluido. Al final, compartimos las mejores fotos con vino caliente.', 'Fotografía', '2026-08-29', '20:00', 'Centro Histórico, Ciudad', 4500, 8, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'),
  ('a0000000-0000-0000-0000-000000000009', 'user_anfitrion_5', 'El Cuerpo Habla: Teatro Sensorial en el Rosedal', 'Comunicarse sin palabras es un desafío que despierta sentidos que creíamos olvidados. En el Rosedal del Parque General San Martín, el cuerpo se convierte en el único vehículo de expresión.Teatro ciego: comunicate sin palabras a través del movimiento, el tacto y el sonido en el Rosedal del Parque General San Martín. 2 horas de exploración sensorial guiada. Incluye cierre con meditación grupal.', 'Bienestar', '2026-08-28', '15:00', 'Parque Gral. San Martín', 2500, 10, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
  ('a0000000-0000-0000-0000-000000000010', 'user_anfitrion_5', 'Baño de Sonido al Pie del Dique', 'Los cuencos tibetanos y los gongs tienen frecuencias que resuenan con el cuerpo de una manera que las palabras no pueden explicar. Al pie del Dique Cipolletti, con la Cordillera iluminándose con el atardecer, la experiencia es simplemente mágica.Cuencos tibetanos, gongs y didgeridoo al atardecer. Meditación guiada con vista al dique Cipolletti. 90 minutos de inmersión sonora. Incluye mantita, almohadón y té de hierbas al cierre.', 'Bienestar', '2026-08-31', '17:00', 'Dique Cipolletti, Luján de Cuyo', 5000, 15, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'),
  ('a0000000-0000-0000-0000-000000000011', 'user_anfitrion_1', 'Pintura con Vino en Bodega', '¿Qué pasa cuando combinás arte, vino y un atardecer entre viñedos? Una experiencia única que despierta la creatividad de una manera distinta.Sesión de pintura guiada por un artista local en una bodega de Luján de Cuyo. Incluye lienzo, pinceles, pintura, una copa de vino tinto para inspirarte, y otra para brindar al final. Te llevás tu obra enmarcada.', 'Arte', '2026-09-05', '17:00', 'Luján de Cuyo', 5500, 10, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'),
  ('a0000000-0000-0000-0000-000000000012', 'user_anfitrion_3', 'Clase de Cocina de Montaña', 'La cocina de montaña tiene sus propios trucos. Cocinar en altura, con ingredientes locales y al aire libre, transforma cualquier plato en una experiencia.Cocina al aire libre en Potrerillos. Aprendé a cocinar con ingredientes de la zona, técnicas de cocción en altura y armado de menú de montaña. Incluye ingredientes, utensilios y el almuerzo.', 'Gastronomía', '2026-09-06', '11:00', 'Potrerillos', 4500, 10, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'),
  ('a0000000-0000-0000-0000-000000000013', 'user_anfitrion_2', 'Rafting en el Río Mendoza', 'El río Mendoza baja con fuerza en primavera y ofrece rápidos de clase III que combinan adrenalina con paisajes increíbles. No hace falta experiencia, solo ganas de remar.Rafting por el Río Mendoza (clase III). Equipo completo, instructores certificados y seguro incluido. 2 horas en el agua. Opcional: asado al finalizar.', 'Aventura', '2026-09-12', '10:00', 'Potrerillos', 8000, 8, 'https://images.unsplash.com/photo-1461783470466-185038239ee6?w=800'),
  ('a0000000-0000-0000-0000-000000000014', 'user_anfitrion_3', 'Taller de Cerveza Artesanal', 'La cerveza artesanal mendocina está viviendo su mejor momento. En este taller vas a aprender todo el proceso, desde la molienda hasta el embotellado.Elaborá tu propia cerveza artesanal desde cero en una microcervecería de Godoy Cruz. Molienda, cocción, fermentación y embotellado. Incluye degustación de 4 estilos y te llevás 6 botellas de tu creación.', 'Gastronomía', '2026-09-12', '15:00', 'Godoy Cruz', 6000, 10, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800'),
  ('a0000000-0000-0000-0000-000000000015', 'user_anfitrion_4', 'Astroturismo en el Valle de Uco', 'El Valle de Uco tiene algunos de los cielos más oscuros de Argentina, ideales para la observación astronómica. A 1200 metros de altura, las estrellas se ven como nunca.Observación astronómica con telescopio profesional en el Valle de Uco. Identificación de constelaciones, planetas y objetos de cielo profundo. Incluye chocolate caliente, frazadas y guía astrónomo.', 'Naturaleza', '2026-09-19', '21:00', 'Valle de Uco, Tunuyán', 6000, 10, 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800'),
  ('a0000000-0000-0000-0000-000000000016', 'user_anfitrion_2', 'Cabalgata al Atardecer', 'Recorrer los viñedos a caballo al atardecer es una de las experiencias más auténticas que ofrece Mendoza. El ritmo del caballo, el paisaje y la luz dorada crean un momento mágico.Cabalgata guiada por viñedos de Maipú al atardecer. 2 horas de recorrido. Incluye caballo manso, equipo de equitación, guía baqueano y vino de honor al regreso.', 'Naturaleza', '2026-09-20', '17:00', 'Maipú', 7000, 8, 'https://images.unsplash.com/photo-1600672220770-3ece499a3852?w=800'),
  ('a0000000-0000-0000-0000-000000000017', 'user_anfitrion_6', 'Jam Session de Jazz en el Speakeasy', 'El jazz en vivo tiene un aura especial, más aún en un bar escondido con estética de los años 20. Un speakeasy en el centro de Mendoza abre sus puertas para una noche de improvisación musical.Noche de jazz improvisado en un bar clandestino. Músicos invitados, barra de cocktails de autor y ambiente íntimo. Podés llevar tu instrumento y sumarte o simplemente disfrutar.', 'Música', '2026-09-21', '21:00', 'Ciudad de Mendoza', 4000, 20, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800'),
  ('a0000000-0000-0000-0000-000000000018', 'user_anfitrion_4', 'Taller de Macrofotografía en el Jardín Botánico', 'El mundo diminuto que habita el Jardín Botánico de Mendoza está lleno de detalles que el ojo humano no alcanza a ver. La macrofotografía revela un universo paralelo.Macrofotografía de insectos y flores en el Jardín Botánico. Lentes macro incluidos. 3 horas de práctica guiada por un fotógrafo profesional. Incluye coffee break.', 'Fotografía', '2026-09-26', '09:00', 'Jardín Botánico, Ciudad', 5000, 6, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'),
  ('a0000000-0000-0000-0000-000000000019', 'user_anfitrion_4', 'El Estudio Viviente', 'La fotografía de estudio es un arte en sí misma: luz, composición, dirección. Este taller combina la teoría con la práctica en vivo, con modelos y un loft preparado para crear.Sesión de fotos con modelos en vivo en un loft-industrial. Aprendé iluminación, composición y dirección de arte. Incluye coffee break y las mejores fotos editadas para tu portfolio.', 'Arte', '2026-09-25', '16:00', 'Godoy Cruz', 6000, 8, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'),
  ('a0000000-0000-0000-0000-000000000020', 'user_anfitrion_5', 'Retiro de Reconexión en Cacheuta', 'Cacheuta es un oasis de tranquilidad a media hora de la ciudad. El sonido del río y el aire puro de la montaña crean el ambiente ideal para una jornada de reconexión profunda.Día completo de reconexión: yoga, meditación guiada, baño de sonido, comida consciente y senderismo. Incluye almuerzo orgánico, traslado desde Ciudad y cuaderno de bitácora personal.', 'Bienestar', '2026-09-28', '08:00', 'Cacheuta, Luján de Cuyo', 35000, 8, 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800'),
  ('a0000000-0000-0000-0000-000000000021', 'user_anfitrion_6', 'Cantata al Atardecer en los Viñedos', 'Cantar al aire libre entre viñedos, cuando el sol tiñe la Cordillera de naranja y rojo, es una experiencia que conecta con lo más profundo. No importa si cantás bien o mal: importa que te sumes.Coro abierto + orquesta de cámara al aire libre entre viñedos de Maipú. No hace falta saber cantar, solo tener ganas. Incluye partitura, vino de honor al finalizar y atardecer sobre la Cordillera.', 'Música', '2026-10-03', '18:00', 'Maipú', 7500, 30, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800'),
  ('a0000000-0000-0000-0000-000000000022', 'user_anfitrion_2', 'Travesía en Kayak por el Dique', 'Navegar las aguas tranquilas del dique con la Cordillera de fondo es una experiencia que combina deporte, naturaleza y paz interior.Kayak por el Dique Cipolletti. 3 horas de navegación con guía. Equipo completo incluido. Ideal para principiantes. Incluye fotografías del paseo.', 'Aventura', '2026-10-05', '10:00', 'Dique Cipolletti, Luján de Cuyo', 5000, 10, 'https://images.unsplash.com/photo-1461783470466-185038239ee6?w=800'),
  ('a0000000-0000-0000-0000-000000000023', 'user_anfitrion_3', 'Picnic Gourmet entre Viñedos', 'Un picnic entre viñedos con productos mendocinos de primera calidad, acompañado de un atardecer inolvidable. La combinación perfecta de gastronomía y paisaje.Picnic con canasta gourmet en la finca. Productos regionales, vino de la bodega, manteles a la sombra de los viñedos. Incluye tabla de fiambres, quesos, frutas, pan artesanal y postre.', 'Gastronomía', '2026-10-11', '18:00', 'Luján de Cuyo', 6000, 10, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'),
  ('a0000000-0000-0000-0000-000000000024', 'user_anfitrion_2', 'Búsqueda del Tesoro por Mendoza', 'Una gymkana digital por las calles del centro de Mendoza que combina historia, cultura y trabajo en equipo. Como un escape room, pero al aire libre.Gymkana cultural por el centro histórico. Resolvé acertijos, encontrá monumentos, descubrí historias ocultas. 2 horas, equipos de 2-4 personas. Premio para el equipo ganador.', 'Aventura', '2026-10-10', '15:00', 'Centro Histórico, Ciudad', 3000, 20, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800'),
  ('a0000000-0000-0000-0000-000000000025', 'user_anfitrion_7', 'Pintura al Óleo en el Cerro de la Gloria', 'El Cerro de la Gloria no solo tiene una vista panorámica de la ciudad, sino que su luz particular ha inspirado a pintores mendocinos durante décadas. Es el lugar perfecto para aprender pintura al aire libre.Taller de pintura al óleo al aire libre con vista a la ciudad. Caballetes, pinceles y óleos incluidos. 3 horas de clase guiada por un artista plástico local. Te llevás tu obra enmarcada.', 'Arte', '2026-10-10', '15:00', 'Cerro de la Gloria, Ciudad', 4500, 10, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'),
  ('a0000000-0000-0000-0000-000000000026', 'user_anfitrion_8', 'Hackatón Creativa: Idea tu App en 4 Horas', 'Mendoza tiene un ecosistema tecnológico en pleno crecimiento. Esta hackatón te desafía a pasar de una idea a un prototipo funcional en solo 4 horas, trabajando en equipo.Hackatón de desarrollo de apps. Equipos de 3-4 personas, mentores técnicos, pizza y bebida incluida. Al final cada equipo presenta su prototipo y el ganador recibe una mentoría personalizada.', 'Tecnología', '2026-10-17', '09:00', 'Godoy Cruz', 3000, 24, 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800'),
  ('a0000000-0000-0000-0000-000000000027', 'user_anfitrion_8', 'Cicloturismo por los Caminos del Vino', 'Recorrer los viñedos en bicicleta es la forma mas linda de conocer la region vitivinicola de Mendoza. El viento, el sol y el paisaje se viven de una manera distinta sobre dos ruedas. Recorrido en bicicleta por bodegas de Maipu. 25 km de senderos entre viñedos, paradas en 3 bodegas con degustacion. Incluye bicicleta, casco, hidratacion y almuerzo en la ultima bodega.', 'Naturaleza', '2026-10-24', '08:00', 'Maipu', 9000, 15, 'https://images.unsplash.com/photo-1600672220770-3ece499a3852?w=800'),
  ('a0000000-0000-0000-0000-000000000028', 'user_anfitrion_3', 'Pastas Caseras con la Nonna', 'Nada como una mesa bien puesta con pasta hecha a mano para sentirte en casa. Te enseñamos los secretos que pasan de generación en generación en las familias mendocinas.Aprendé a hacer pasta fresca desde cero: amasado, estirado, cortado y salsas tradicionales. Al final, te sentás a comer lo que hiciste maridado con un vino Malbec de la casa.', 'Gastronomía', '2026-10-18', '11:00', 'Godoy Cruz', 4000, 8, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'),
  ('a0000000-0000-0000-0000-000000000029', 'user_anfitrion_5', 'Realidad Virtual en las Bodegas', 'Las bodegas de Mendoza cuentan historias centenarias, pero ¿y si pudieras verlas desde adentro sin moverte del lugar? La realidad virtual te transporta a viñedos históricos, procesos de fermentación y catas a 360 grados.Experiencia de realidad virtual 360° en la Bodega Catena Zapata. Recorré los viñedos históricos, el proceso de fermentación y una cata virtual desde adentro de la barrica. 45 minutos. Incluye copa de vino real al finalizar.', 'Inmersión', '2026-10-11', '16:00', 'Bodega Catena Zapata, Luján de Cuyo', 8500, 6, 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=800'),
  ('a0000000-0000-0000-0000-000000000030', 'user_anfitrion_7', 'Taller de Manualidades: Joyeria en Plata', 'Crea tu propia joya en plata con tecnicas ancestrales de orfebreria. Desde el diseno hasta el pulido final, todo el proceso en tus manos. Incluye materiales, herramientas y un certificado de tu pieza unica.', 'Manualidades', '2026-10-08', '15:00', 'Godoy Cruz', 5500, 8, 'https://images.unsplash.com/photo-1715374033196-0ff662284a7e?w=800'),
  ('a0000000-0000-0000-0000-000000000031', 'user_anfitrion_7', 'Yoga para Principiantes en el Parque', 'Yoga suave al aire libre en el Parque Central. Ideal para quienes nunca hicieron yoga o quieren retomar la practica. Posturas basicas, respiracion consciente y relajacion guiada con el sonido de los pajaros.', 'Yoga', '2026-10-15', '09:00', 'Parque Central, Ciudad', 2000, 15, 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800'),
  ('a0000000-0000-0000-0000-000000000032', 'user_anfitrion_5', 'Meditacion Guiada en el Dique', 'Una jornada de meditacion guiada al borde del dique, combinando tecnicas de mindfulness, respiracion y visualizacion. El sonido del agua y la brisa de la montana acompanan la practica.', 'Meditación', '2026-10-22', '10:00', 'Dique Cipolletti, Luján de Cuyo', 3000, 20, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'),
  ('a0000000-0000-0000-0000-000000000033', 'user_anfitrion_1', 'Teatro de Improvisacion en el Solar', 'El teatro de improvisacion no tiene guion, solo reglas y mucha creatividad. En esta experiencia vas a descubrir que todos podemos actuar cuando soltamos el miedo al ridiculo.', 'Teatro', '2026-10-30', '19:00', 'Solar de la Plaza, Ciudad', 4000, 12, 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800'),
  ('a0000000-0000-0000-0000-000000000034', 'user_anfitrion_4', 'Educacion Financiera para Creativos', 'Taller practico de finanzas personales pensado para artistas, emprendedores y trabajadores independientes. Presupuesto, ahorro, inversion simple y herramientas digitales para ordenar tus cuentas.', 'Educación', '2026-11-05', '10:00', 'Ciudad de Mendoza', 3500, 20, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800')
ON CONFLICT (id) DO NOTHING;

INSERT INTO comercios (id, anfitrion_id, nombre, rubro, direccion, contacto, beneficio_desc) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 'Mercado Orgánico', 'Alimentos', 'Chacras de Coria', '2615001001', 'Comprando $2000 en productos, llevate un cupón de descuento'),
  ('c0000000-0000-0000-0000-000000000002', 'user_anfitrion_1', 'Librería El Péndulo', 'Cultura', 'Ciudad de Mendoza', '2615001002', 'Comprando 3 libros, 50% off en actividades'),
  ('c0000000-0000-0000-0000-000000000003', 'user_anfitrion_2', 'Deportes Patagonia', 'Indumentaria', 'Ciudad de Mendoza', '2615001003', 'Comprando una mochila, $500 de descuento en excursiones'),
  ('c0000000-0000-0000-0000-000000000004', 'user_anfitrion_3', 'Vinoteca El Lagar', 'Bebidas', 'Godoy Cruz', '2615001004', 'Comprando 2 botellas, cupón para actividad de cata'),
  ('c0000000-0000-0000-0000-000000000005', 'user_anfitrion_4', 'FotoMendoza', 'Electrónica', 'Ciudad de Mendoza', '2615001005', '20% off en revelado digital con compra de equipo'),
  ('c0000000-0000-0000-0000-000000000006', 'user_anfitrion_5', 'Om Shanti', 'Bienestar', 'Chacras de Coria', '2615001006', 'Comprando 3 clases de yoga, un baño de sonido gratis'),
  ('c0000000-0000-0000-0000-000000000007', 'user_anfitrion_6', 'Casa de la Música', 'Instrumentos', 'Ciudad de Mendoza', '2615001007', '15% off en instrumentos de percusión con el código'),
  ('c0000000-0000-0000-0000-000000000008', 'user_anfitrion_8', 'ByteStore', 'Tecnología', 'Ciudad de Mendoza', '2615001008', '10% off en accesorios gaming con cupón')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cupones (codigo, comercio_id, descuento_tipo, descuento_valor, condiciones, usos_maximos, usos_actuales, activo) VALUES
  ('Maria1', 'c0000000-0000-0000-0000-000000000001', 'porcentaje', 15, 'Cupón exclusivo para actividades de Maria', 50, 0, TRUE),
  ('Maria2', 'c0000000-0000-0000-0000-000000000002', 'fijo', 500, 'Cupón exclusivo para actividades de Maria', 50, 0, TRUE),
  ('Carlos1', 'c0000000-0000-0000-0000-000000000003', 'porcentaje', 15, 'Cupón exclusivo para actividades de Carlos', 50, 0, TRUE),
  ('Carlos2', 'c0000000-0000-0000-0000-000000000003', 'fijo', 500, 'Cupón exclusivo para actividades de Carlos', 50, 0, TRUE),
  ('Lucia1', 'c0000000-0000-0000-0000-000000000004', 'porcentaje', 15, 'Cupón exclusivo para actividades de Lucia', 50, 0, TRUE),
  ('Lucia2', 'c0000000-0000-0000-0000-000000000004', 'fijo', 500, 'Cupón exclusivo para actividades de Lucia', 50, 0, TRUE),
  ('Andres1', 'c0000000-0000-0000-0000-000000000005', 'porcentaje', 15, 'Cupón exclusivo para actividades de Andres', 50, 0, TRUE),
  ('Andres2', 'c0000000-0000-0000-0000-000000000005', 'fijo', 500, 'Cupón exclusivo para actividades de Andres', 50, 0, TRUE),
  ('Carolina1', 'c0000000-0000-0000-0000-000000000006', 'porcentaje', 15, 'Cupón exclusivo para actividades de Carolina', 50, 0, TRUE),
  ('Carolina2', 'c0000000-0000-0000-0000-000000000006', 'fijo', 500, 'Cupón exclusivo para actividades de Carolina', 50, 0, TRUE),
  ('Martin1', 'c0000000-0000-0000-0000-000000000007', 'porcentaje', 15, 'Cupón exclusivo para actividades de Martin', 50, 0, TRUE),
  ('Martin2', 'c0000000-0000-0000-0000-000000000007', 'fijo', 500, 'Cupón exclusivo para actividades de Martin', 50, 0, TRUE),
  ('Valentina1', 'c0000000-0000-0000-0000-000000000001', 'porcentaje', 15, 'Cupón exclusivo para actividades de Valentina', 50, 0, TRUE),
  ('Valentina2', 'c0000000-0000-0000-0000-000000000001', 'fijo', 500, 'Cupón exclusivo para actividades de Valentina', 50, 0, TRUE),
  ('Fernando1', 'c0000000-0000-0000-0000-000000000008', 'porcentaje', 15, 'Cupón exclusivo para actividades de Fernando', 50, 0, TRUE),
  ('Fernando2', 'c0000000-0000-0000-0000-000000000008', 'fijo', 500, 'Cupón exclusivo para actividades de Fernando', 50, 0, TRUE)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO reservas (id, usuario_id, actividad_id, fecha, cupon_codigo, cantidad, estado, codigo_confirmacion) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_participante_1', 'a0000000-0000-0000-0000-000000000001', '2026-08-15', 'Maria1', 2, 'confirmada', 'CONF-A001'),
  ('00000000-0000-0000-0000-000000000002', 'user_participante_2', 'a0000000-0000-0000-0000-000000000003', '2026-08-17', NULL, 1, 'pendiente', NULL),
  ('00000000-0000-0000-0000-000000000003', 'user_participante_1', 'a0000000-0000-0000-0000-000000000011', '2026-08-29', 'Maria2', 3, 'confirmada', 'CONF-A011'),
  ('00000000-0000-0000-0000-000000000004', 'user_participante_3', 'a0000000-0000-0000-0000-000000000005', '2026-08-23', NULL, 2, 'confirmada', 'CONF-A005'),
  ('00000000-0000-0000-0000-000000000005', 'user_participante_4', 'a0000000-0000-0000-0000-000000000009', '2026-08-28', 'Carolina1', 1, 'pendiente', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pagos (usuario_id, reserva_id, monto, metodo_pago, estado) VALUES
  ('user_participante_1', '00000000-0000-0000-0000-000000000001', 5000, 'mercadopago', 'aprobado'),
  ('user_participante_1', '00000000-0000-0000-0000-000000000003', 15000, 'mercadopago', 'aprobado'),
  ('user_participante_3', '00000000-0000-0000-0000-000000000004', 10000, 'mercadopago', 'aprobado');

INSERT INTO pagos_anfitrion (reserva_id, anfitrion_id, monto, comision, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 4500, 500, 'pendiente'),
  ('00000000-0000-0000-0000-000000000003', 'user_anfitrion_1', 13500, 1500, 'pendiente'),
  ('00000000-0000-0000-0000-000000000004', 'user_anfitrion_3', 9000, 1000, 'pendiente');

INSERT INTO resenas (id, usuario_id, actividad_id, puntuacion, comentario) VALUES
  ('a0000001-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000001', 5, 'Aprendí muchísimo y pasé un rato hermoso. Gracias!'),
  ('a0000002-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000001', 4, 'Muy lindo lugar y buena organización. Repetiría'),
  ('a0000003-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000002', 5, 'Superó todas mis expectativas. Volvería sin dudarlo'),
  ('a0000004-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000002', 4, 'El anfitrión fue excelente, muy atento y profesional'),
  ('a0000005-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000028', 4, 'Muy buena organización desde el principio hasta el final'),
  ('a0000006-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000028', 4, 'Muy buena organización desde el principio hasta el final'),
  ('a0000007-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000011', 4, 'La actividad es tal cual la describen. Muy recomendable'),
  ('a0000008-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000011', 5, 'El anfitrión tiene una energía increíble. Hizo la experiencia'),
  ('a0000009-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000011', 5, 'Muy lindo lugar y buena organización. Repetiría'),
  ('a0000010-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000003', 4, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('a0000011-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000003', 4, 'Me fui con ganas de más. Ojalá haya pronto otra fecha'),
  ('a0000012-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000013', 4, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('a0000013-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000013', 4, 'Muy buena organización desde el principio hasta el final'),
  ('a0000014-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000013', 5, 'La comunicación previa fue clara y todo salió según lo planeado'),
  ('a0000015-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000022', 4, 'Aprendí muchísimo y pasé un rato hermoso. Gracias!'),
  ('a0000016-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000022', 5, 'El anfitrión fue excelente, muy atento y profesional'),
  ('a0000017-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000022', 4, 'Una experiencia transformadora. Me llevé mucho más de lo que esperaba'),
  ('a0000018-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000015', 4, 'Me fui con ganas de más. Ojalá haya pronto otra fecha'),
  ('a0000019-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000015', 5, 'Me encantó la dinámica, el grupo y el entorno. 10/10'),
  ('a0000020-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000015', 5, 'El anfitrión fue excelente, muy atento y profesional'),
  ('a0000021-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000023', 5, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('a0000022-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000023', 5, 'Muy buena organización desde el principio hasta el final'),
  ('a0000023-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000005', 4, 'Superó todas mis expectativas. Volvería sin dudarlo'),
  ('a0000024-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000005', 5, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('a0000025-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000024', 4, 'Un plan diferente para hacer en Mendoza. Me encantó'),
  ('a0000026-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000024', 5, 'Actividad familiar, divertida y educativa a la vez'),
  ('a0000027-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000024', 4, 'Excelente relación calidad-precio. Super recomendable'),
  ('a0000028-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000016', 5, 'Nunca había hecho algo así. Me abrió la cabeza'),
  ('a0000029-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000016', 5, 'Nunca había hecho algo así. Me abrió la cabeza'),
  ('a0000030-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000017', 5, 'El anfitrión fue excelente, muy atento y profesional'),
  ('a0000031-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000017', 4, 'Una experiencia transformadora. Me llevé mucho más de lo que esperaba'),
  ('a0000032-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000017', 4, 'La actividad es tal cual la describen. Muy recomendable'),
  ('a0000033-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000008', 5, 'El paisaje es espectacular. Las fotos no le hacen justicia'),
  ('a0000034-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000008', 5, 'Muy buena organización desde el principio hasta el final'),
  ('a0000035-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000008', 4, 'Una experiencia transformadora. Me llevé mucho más de lo que esperaba'),
  ('a0000036-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000018', 5, 'La actividad es tal cual la describen. Muy recomendable'),
  ('a0000037-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000018', 5, 'Increíble experiencia, muy recomendable'),
  ('a0000038-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000018', 5, 'El paisaje es espectacular. Las fotos no le hacen justicia'),
  ('a0000039-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000019', 5, 'El paisaje es espectacular. Las fotos no le hacen justicia'),
  ('a0000040-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000019', 4, 'Muy lindo lugar y buena organización. Repetiría'),
  ('a0000041-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000009', 5, 'Un plan diferente para hacer en Mendoza. Me encantó'),
  ('a0000042-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000009', 4, 'Una experiencia transformadora. Me llevé mucho más de lo que esperaba'),
  ('a0000043-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000009', 5, 'Una experiencia única en Mendoza. No se la pierdan'),
  ('a0000044-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000010', 4, 'El anfitrión fue excelente, muy atento y profesional'),
  ('a0000045-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000010', 5, 'El anfitrión fue excelente, muy atento y profesional'),
  ('a0000046-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000020', 5, 'Muy buena organización desde el principio hasta el final'),
  ('a0000047-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000020', 4, 'Excelente relación calidad-precio. Super recomendable'),
  ('a0000048-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000029', 5, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('a0000049-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000029', 5, 'Actividad familiar, divertida y educativa a la vez'),
  ('a0000050-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000029', 5, 'Una experiencia transformadora. Me llevé mucho más de lo que esperaba'),
  ('a0000051-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000004', 5, 'Increíble experiencia, muy recomendable'),
  ('a0000052-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000004', 4, 'Nunca había hecho algo así. Me abrió la cabeza'),
  ('a0000053-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000021', 4, 'Aprendí muchísimo y pasé un rato hermoso. Gracias!'),
  ('a0000054-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000021', 4, 'Superó todas mis expectativas. Volvería sin dudarlo'),
  ('a0000055-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000006', 5, 'Un plan diferente para hacer en Mendoza. Me encantó'),
  ('a0000056-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000006', 4, 'Muy buena organización desde el principio hasta el final'),
  ('a0000057-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000006', 4, 'Nunca había hecho algo así. Me abrió la cabeza'),
  ('a0000058-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000025', 4, 'Una experiencia transformadora. Me llevé mucho más de lo que esperaba'),
  ('a0000059-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000025', 4, 'Ideal para hacer en grupo. Nos reímos mucho'),
  ('a0000060-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000025', 5, 'Ideal para hacer en grupo. Nos reímos mucho'),
  ('a0000061-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000007', 4, 'Superó todas mis expectativas. Volvería sin dudarlo'),
  ('a0000062-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000007', 5, 'El anfitrión tiene una energía increíble. Hizo la experiencia'),
  ('a0000063-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000007', 4, 'Aprendí muchísimo y pasé un rato hermoso. Gracias!'),
  ('a0000064-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000026', 5, 'Muy lindo lugar y buena organización. Repetiría'),
  ('a0000065-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000026', 5, 'La actividad es tal cual la describen. Muy recomendable'),
  ('a0000066-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000027', 5, 'Muy buena organización desde el principio hasta el final'),
  ('a0000067-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000027', 4, 'Superó todas mis expectativas. Volvería sin dudarlo'),
  ('a0000068-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000027', 4, 'El anfitrión fue excelente, muy atento y profesional'),
  ('a0000069-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000030', 5, 'Un plan diferente para hacer en Mendoza. Me encantó'),
  ('a0000070-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000030', 4, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('a0000071-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000031', 4, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('a0000072-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000031', 5, 'Actividad familiar, divertida y educativa a la vez'),
  ('a0000073-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000032', 4, 'Me encantó la dinámica, el grupo y el entorno. 10/10'),
  ('a0000074-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000032', 5, 'Me encantó la dinámica, el grupo y el entorno. 10/10'),
  ('a0000075-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000032', 4, 'Nunca había hecho algo así. Me abrió la cabeza'),
  ('a0000076-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000033', 4, 'Nunca había hecho algo así. Me abrió la cabeza'),
  ('a0000077-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000033', 5, 'El paisaje es espectacular. Las fotos no le hacen justicia'),
  ('a0000078-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000034', 4, 'La actividad es tal cual la describen. Muy recomendable'),
  ('a0000079-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000034', 4, 'La comunicación previa fue clara y todo salió según lo planeado')
ON CONFLICT (id) DO NOTHING;

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

COMMIT;