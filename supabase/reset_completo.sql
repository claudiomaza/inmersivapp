-- ============================================================
-- INMERSIVAPP — Reset completo + Migración unificada
-- Sello: cm2labs · 2026-07-22
-- ============================================================
-- EJECUTAR DESDE EL SQL EDITOR DE SUPABASE
-- Orden: 1 → 2 → 3 → 4
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- 1. BORRAR TODO (reset completo)
-- ════════════════════════════════════════════════════════════
-- Elimina datos existentes en orden inverso a las FK
-- Usa DO así no falla si alguna tabla no existe todavía

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='pagos_anfitrion') THEN DELETE FROM pagos_anfitrion; END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='pagos') THEN DELETE FROM pagos; END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='resenas') THEN DELETE FROM resenas; END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='mensajes') THEN DELETE FROM mensajes; END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='notificaciones') THEN DELETE FROM notificaciones; END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='reservas') THEN DELETE FROM reservas; END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='anuncios') THEN DELETE FROM anuncios; END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='cupones') THEN DELETE FROM cupones; END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='actividades') THEN DELETE FROM actividades; END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='perfiles') THEN DELETE FROM perfiles; END IF;
END $$;

-- ════════════════════════════════════════════════════════════
-- 2. MIGRACIÓN CLERK (UUID → TEXT + RLS)
-- ════════════════════════════════════════════════════════════

DO $$ DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('perfiles', 'actividades', 'reservas', 'pagos', 'resenas', 'mensajes', 'notificaciones', 'anuncios')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS email TEXT;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS crear_perfil_nuevo();

ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_id_fkey;
ALTER TABLE actividades DROP CONSTRAINT IF EXISTS actividades_anfitrion_id_fkey;
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_usuario_id_fkey;
ALTER TABLE resenas DROP CONSTRAINT IF EXISTS resenas_usuario_id_fkey;
ALTER TABLE mensajes DROP CONSTRAINT IF EXISTS mensajes_emisor_id_fkey;
ALTER TABLE mensajes DROP CONSTRAINT IF EXISTS mensajes_receptor_id_fkey;
ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS notificaciones_usuario_id_fkey;
ALTER TABLE anuncios DROP CONSTRAINT IF EXISTS anuncios_patrocinador_id_fkey;
ALTER TABLE cupones DROP CONSTRAINT IF EXISTS cupones_anfitrion_id_fkey;
ALTER TABLE pagos DROP CONSTRAINT IF EXISTS pagos_usuario_id_fkey;
ALTER TABLE pagos DROP CONSTRAINT IF EXISTS pagos_reserva_id_fkey;
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='pagos_anfitrion') THEN
    ALTER TABLE pagos_anfitrion DROP CONSTRAINT IF EXISTS pagos_anfitrion_reserva_id_fkey;
    ALTER TABLE pagos_anfitrion DROP CONSTRAINT IF EXISTS pagos_anfitrion_anfitrion_id_fkey;
  END IF;
END $$;

ALTER TABLE actividades ALTER COLUMN anfitrion_id TYPE TEXT;
ALTER TABLE reservas ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE resenas ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE mensajes ALTER COLUMN emisor_id TYPE TEXT;
ALTER TABLE mensajes ALTER COLUMN receptor_id TYPE TEXT;
ALTER TABLE notificaciones ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE anuncios ALTER COLUMN patrocinador_id TYPE TEXT;
ALTER TABLE cupones ALTER COLUMN anfitrion_id TYPE TEXT;
ALTER TABLE pagos ALTER COLUMN usuario_id TYPE TEXT;
ALTER TABLE pagos ALTER COLUMN reserva_id TYPE TEXT;
ALTER TABLE reservas ALTER COLUMN id TYPE TEXT;

ALTER TABLE perfiles ALTER COLUMN id TYPE TEXT;

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
ALTER TABLE anuncios ADD CONSTRAINT anuncios_patrocinador_id_fkey
  FOREIGN KEY (patrocinador_id) REFERENCES perfiles(id) ON DELETE CASCADE;
ALTER TABLE cupones ADD CONSTRAINT cupones_anfitrion_id_fkey
  FOREIGN KEY (anfitrion_id) REFERENCES perfiles(id) ON DELETE CASCADE;
ALTER TABLE pagos ADD CONSTRAINT pagos_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES perfiles(id) ON DELETE CASCADE;
ALTER TABLE pagos ADD CONSTRAINT pagos_reserva_id_fkey
  FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE;

CREATE POLICY "Perfiles lectura pública" ON perfiles FOR SELECT USING (true);
CREATE POLICY "Actividades lectura pública" ON actividades FOR SELECT USING (true);
CREATE POLICY "Reseñas lectura pública" ON resenas FOR SELECT USING (true);

ALTER TABLE reservas DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones DISABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════
-- 3. MIGRACIÓN CUPONES + PAGOS ANFITRIÓN
-- ════════════════════════════════════════════════════════════

ALTER TABLE reservas ADD COLUMN IF NOT EXISTS cupon_codigo TEXT;

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

CREATE OR REPLACE FUNCTION incrementar_usos_cupon(p_codigo TEXT)
RETURNS void AS $$
BEGIN
  UPDATE cupones
  SET usos_actuales = usos_actuales + 1
  WHERE codigo = p_codigo
    AND usos_actuales < usos_maximos;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE pagos_anfitrion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pagos anfitrión: lectura propia" ON pagos_anfitrion
  FOR SELECT USING (true);

-- ════════════════════════════════════════════════════════════
-- 4. SEED DATOS
-- ════════════════════════════════════════════════════════════

-- 4a. ANFITRIONES
INSERT INTO perfiles (id, email, username, nombre, apellido, telefono, intereses, roles) VALUES
('anfitrion_01', 'sofia.martinez@email.com', 'sofiarte', 'Sofía', 'Martínez', '+5492615001001', '{Arte,Fotografía,Manualidades}', '{anfitrion}'),
('anfitrion_02', 'pablo.gimenez@email.com', 'pablotrekk', 'Pablo', 'Giménez', '+5492615001002', '{Naturaleza,Deportes}', '{anfitrion}'),
('anfitrion_03', 'lucia.fernandez@email.com', 'lucook', 'Lucía', 'Fernández', '+5492615001003', '{Cocina,Arte}', '{anfitrion}'),
('anfitrion_04', 'martin.lopez@email.com', 'martinmusica', 'Martín', 'López', '+5492615001004', '{Música,Tecnología}', '{anfitrion}'),
('anfitrion_05', 'carolina.diaz@email.com', 'caroyoga', 'Carolina', 'Díaz', '+5492615001005', '{Yoga,Meditación,Naturaleza}', '{anfitrion}'),
('anfitrion_06', 'andres.perez@email.com', 'andresfoto', 'Andrés', 'Pérez', '+5492615001006', '{Fotografía,Arte,Tecnología}', '{anfitrion}'),
('anfitrion_07', 'valentina.rojas@email.com', 'valecocina', 'Valentina', 'Rojas', '+5492615001007', '{Cocina,Teatro}', '{anfitrion}'),
('anfitrion_08', 'gabriel.sosa@email.com', 'gabisender', 'Gabriel', 'Sosa', '+5492615001008', '{Naturaleza,Deportes,Fotografía}', '{anfitrion}');

-- 4b. PARTICIPANTES
INSERT INTO perfiles (id, email, username, nombre, apellido, telefono, intereses, roles) VALUES
('part_01', 'juan.perez@email.com', 'juanp', 'Juan', 'Pérez', '+5492615002001', '{Arte,Música,Cocina}', '{participante}'),
('part_02', 'maria.gonzalez@email.com', 'mariag', 'María', 'González', '+5492615002002', '{Naturaleza,Yoga,Meditación}', '{participante}'),
('part_03', 'carlos.sanchez@email.com', 'carloss', 'Carlos', 'Sánchez', '+5492615002003', '{Tecnología,Deportes}', '{participante}'),
('part_04', 'ana.rodriguez@email.com', 'anarod', 'Ana', 'Rodríguez', '+5492615002004', '{Fotografía,Arte,Manualidades}', '{participante}'),
('part_05', 'lautaro.mendoza@email.com', 'lautarom', 'Lautaro', 'Mendoza', '+5492615002005', '{Cocina,Naturaleza,Teatro}', '{participante}'),
('part_06', 'camila.torres@email.com', 'camitorres', 'Camila', 'Torres', '+5492615002006', '{Yoga,Meditación,Música}', '{participante}'),
('part_07', 'facundo.arias@email.com', 'facundo', 'Facundo', 'Arias', '+5492615002007', '{Deportes,Naturaleza}', '{participante}'),
('part_08', 'florencia.molina@email.com', 'flormolina', 'Florencia', 'Molina', '+5492615002008', '{Arte,Fotografía,Cocina}', '{participante}'),
('part_09', 'nicolas.castillo@email.com', 'nicocast', 'Nicolás', 'Castillo', '+5492615002009', '{Tecnología,Música,Teatro}', '{participante}'),
('part_10', 'agustina.ferreyra@email.com', 'agusfer', 'Agustina', 'Ferreyra', '+5492615002010', '{Naturaleza,Yoga,Manualidades}', '{participante}');

-- 4c. ACTIVIDADES
INSERT INTO actividades (id, titulo, descripcion, precio, categoria, fotos, ubicacion, anfitrion_id, anfitrion_nombre, horarios, fechas, activa) VALUES
('act_01', 'Taller de Acuarela Botánica', 'Aprendé técnicas de acuarela pintando flores y plantas nativas de Mendoza. Materiales incluidos. Ideal para principiantes.', 3500, 'Arte', ARRAY['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'], '{"provincia":"Mendoza","departamento":"Capital","direccion":"Av. San Martín 845, Ciudad"}', 'anfitrion_01', 'Sofía Martínez', '{"Lunes":{"activo":true,"inicio":"10:00","fin":"12:00"},"Miercoles":{"activo":true,"inicio":"10:00","fin":"12:00"},"Sabado":{"activo":true,"inicio":"15:00","fin":"17:00"}}', ARRAY['2026-08-03','2026-08-05','2026-08-10','2026-08-12','2026-08-17'], true),
('act_02', 'Trekking al Cerro de la Virgen', 'Caminata guiada por senderos del Cerro de la Virgen con vista panorámica de la ciudad. Incluye mate de bienvenida en la cima.', 2500, 'Naturaleza', ARRAY['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'], '{"provincia":"Mendoza","departamento":"Capital","direccion":"Av. de los Trabajadores s/n, Base del Cerro"}', 'anfitrion_02', 'Pablo Giménez', '{"Martes":{"activo":true,"inicio":"08:00","fin":"11:00"},"Jueves":{"activo":true,"inicio":"08:00","fin":"11:00"},"Sabado":{"activo":true,"inicio":"07:00","fin":"10:00"}}', ARRAY['2026-08-04','2026-08-06','2026-08-08','2026-08-11','2026-08-13'], true),
('act_03', 'Clase de Cocina Regional: Empanadas Mendocinas', 'Aprendé a preparar empanadas mendocinas auténticas con receta familiar. Incluye degustación con vino de la zona.', 5500, 'Cocina', ARRAY['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'], '{"provincia":"Mendoza","departamento":"Godoy Cruz","direccion":"Lavalle 450, Godoy Cruz"}', 'anfitrion_03', 'Lucía Fernández', '{"Miercoles":{"activo":true,"inicio":"18:00","fin":"21:00"},"Viernes":{"activo":true,"inicio":"18:00","fin":"21:00"},"Sabado":{"activo":true,"inicio":"11:00","fin":"14:00"}}', ARRAY['2026-08-05','2026-08-07','2026-08-12','2026-08-14','2026-08-19'], true),
('act_04', 'Noche de Música en Vivo: Jazz Fusión', 'Velada íntima con músicos locales de jazz fusión. Incluye copa de vino y tabla de quesos. Capacidad limitada a 20 personas.', 6500, 'Música', ARRAY['https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800'], '{"provincia":"Mendoza","departamento":"Capital","direccion":"Gutiérrez 320, Ciudad"}', 'anfitrion_04', 'Martín López', '{"Jueves":{"activo":true,"inicio":"20:00","fin":"23:00"},"Sabado":{"activo":true,"inicio":"20:00","fin":"23:00"}}', ARRAY['2026-08-06','2026-08-08','2026-08-13','2026-08-15','2026-08-20'], true),
('act_05', 'Yoga al Amanecer en el Parque', 'Sesión de yoga al aire libre en el Parque General San Martín al amanecer. Todos los niveles bienvenidos. Traer mat.', 2000, 'Yoga', ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'], '{"provincia":"Mendoza","departamento":"Capital","direccion":"Parque Gral. San Martín, Rosedal"}', 'anfitrion_05', 'Carolina Díaz', '{"Lunes":{"activo":true,"inicio":"06:30","fin":"07:30"},"Miercoles":{"activo":true,"inicio":"06:30","fin":"07:30"},"Viernes":{"activo":true,"inicio":"06:30","fin":"07:30"}}', ARRAY['2026-08-03','2026-08-05','2026-08-07','2026-08-10','2026-08-12'], true),
('act_06', 'Safari Fotográfico Urbano', 'Recorrido a pie por el centro de Mendoza capturando arquitectura, murales y vida callejera. Tips de composición y edición.', 4000, 'Fotografía', ARRAY['https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'], '{"provincia":"Mendoza","departamento":"Capital","direccion":"Plaza Independencia, Peatonal Sarmiento"}', 'anfitrion_06', 'Andrés Pérez', '{"Martes":{"activo":true,"inicio":"16:00","fin":"18:30"},"Jueves":{"activo":true,"inicio":"16:00","fin":"18:30"},"Domingo":{"activo":true,"inicio":"10:00","fin":"12:30"}}', ARRAY['2026-08-04','2026-08-06','2026-08-09','2026-08-11','2026-08-13'], true),
('act_07', 'Taller de Cocina Vegana: Pastas Artesanales', 'Aprendé a hacer pastas veganas desde cero: tallarines de espinaca, ravioles de calabaza y salsa de hongos.', 4800, 'Cocina', ARRAY['https://images.unsplash.com/photo-1572441710405-0d2b25b4e7e0?w=800'], '{"provincia":"Mendoza","departamento":"Chacras de Coria","direccion":"Ruta 82 km 15, Chacras de Coria"}', 'anfitrion_07', 'Valentina Rojas', '{"Martes":{"activo":true,"inicio":"18:00","fin":"21:00"},"Jueves":{"activo":true,"inicio":"18:00","fin":"21:00"}}', ARRAY['2026-08-04','2026-08-06','2026-08-11','2026-08-13','2026-08-18'], true),
('act_08', 'Cabalgata por el Pie de la Cordillera', 'Cabalgata guiada de 3 horas por los paisajes de Luján de Cuyo con vista a la Cordillera de los Andes. Caballos dóciles.', 8000, 'Naturaleza', ARRAY['https://images.unsplash.com/photo-1599059817565-430a5a1e2b0c?w=800'], '{"provincia":"Mendoza","departamento":"Luján de Cuyo","direccion":"RP 99 km 18, Luján de Cuyo"}', 'anfitrion_08', 'Gabriel Sosa', '{"Miercoles":{"activo":true,"inicio":"09:00","fin":"12:00"},"Sabado":{"activo":true,"inicio":"09:00","fin":"12:00"},"Domingo":{"activo":true,"inicio":"09:00","fin":"12:00"}}', ARRAY['2026-08-05','2026-08-08','2026-08-09','2026-08-12','2026-08-15'], true),
('act_09', 'Club de Lectura: Literatura Argentina Contemporánea', 'Encuentro semanal para debatir obras de autores argentinos actuales. Incluye café y facturas. El libro del mes se sortea.', 1500, 'Arte', ARRAY['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800'], '{"provincia":"Mendoza","departamento":"Capital","direccion":"9 de Julio 1023, Ciudad"}', 'anfitrion_01', 'Sofía Martínez', '{"Jueves":{"activo":true,"inicio":"18:00","fin":"20:00"}}', ARRAY['2026-08-06','2026-08-13','2026-08-20','2026-08-27'], true),
('act_10', 'Taller de Cerámica: Tu Primer Macetero', 'Modelado en arcilla para crear tu propio macetero. Incluye horneada, esmaltado y plantas para llevar.', 4500, 'Arte', ARRAY['https://images.unsplash.com/photo-1565193566173-7a0ee3dbea78?w=800'], '{"provincia":"Mendoza","departamento":"Maipú","direccion":"Ozamis 780, Maipú"}', 'anfitrion_01', 'Sofía Martínez', '{"Sabado":{"activo":true,"inicio":"10:00","fin":"12:30"},"Domingo":{"activo":true,"inicio":"10:00","fin":"12:30"}}', ARRAY['2026-08-08','2026-08-09','2026-08-15','2026-08-16','2026-08-22'], true),
('act_11', 'Bicicleteada por los Viñedos', 'Recorrido en bici por bodegas de Maipú con degustación incluida. 25 km de paseo, ritmo tranquilo. Bicicleta incluida.', 7000, 'Deportes', ARRAY['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'], '{"provincia":"Mendoza","departamento":"Maipú","direccion":"Ruta 60 km 5, Maipú — Bodega La Rural"}', 'anfitrion_02', 'Pablo Giménez', '{"Sabado":{"activo":true,"inicio":"08:00","fin":"12:00"},"Domingo":{"activo":true,"inicio":"08:00","fin":"12:00"}}', ARRAY['2026-08-08','2026-08-09','2026-08-15','2026-08-16','2026-08-22'], true),
('act_12', 'Meditación Guiada en Bodega', 'Sesión de meditación y mindfulness entre viñedos al atardecer, seguida de una copa de vino premium.', 3500, 'Meditación', ARRAY['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'], '{"provincia":"Mendoza","departamento":"Luján de Cuyo","direccion":"RP 82 km 12, Bodega Catena Zapata"}', 'anfitrion_05', 'Carolina Díaz', '{"Viernes":{"activo":true,"inicio":"17:00","fin":"18:30"},"Sabado":{"activo":true,"inicio":"17:00","fin":"18:30"}}', ARRAY['2026-08-07','2026-08-08','2026-08-14','2026-08-15','2026-08-21'], true),
('act_13', 'Taller de Edición de Fotos con Celular', 'Aprendé a editar tus fotos como un profesional usando solo apps de celular. Composición, color y retoque avanzado.', 3000, 'Tecnología', ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'], '{"provincia":"Mendoza","departamento":"Capital","direccion":"Colón 250, Ciudad, Espacio Cultural"}', 'anfitrion_06', 'Andrés Pérez', '{"Lunes":{"activo":true,"inicio":"18:00","fin":"20:00"},"Miercoles":{"activo":true,"inicio":"18:00","fin":"20:00"}}', ARRAY['2026-08-03','2026-08-05','2026-08-10','2026-08-12','2026-08-17'], true),
('act_14', 'Improvisación Teatral: Soltá tu Creatividad', 'Taller de teatro de improvisación para principiantes. Juegos escénicos, personajes y mucha diversión. Sin experiencia previa.', 3500, 'Teatro', ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'], '{"provincia":"Mendoza","departamento":"Capital","direccion":"Mitre 450, Sala La Nave"}', 'anfitrion_07', 'Valentina Rojas', '{"Martes":{"activo":true,"inicio":"19:00","fin":"21:00"},"Jueves":{"activo":true,"inicio":"19:00","fin":"21:00"}}', ARRAY['2026-08-04','2026-08-06','2026-08-11','2026-08-13','2026-08-18'], true),
('act_15', 'Avistaje de Aves en el Dique Cipolletti', 'Caminata guiada por el dique para observar aves nativas y migratorias. Binoculares y guía impresa incluidos.', 2800, 'Naturaleza', ARRAY['https://images.unsplash.com/photo-1470071459604-7b8ec44ffd0d?w=800'], '{"provincia":"Mendoza","departamento":"Godoy Cruz","direccion":"Dique Cipolletti, Acceso Sur"}', 'anfitrion_08', 'Gabriel Sosa', '{"Martes":{"activo":true,"inicio":"07:00","fin":"10:00"},"Jueves":{"activo":true,"inicio":"07:00","fin":"10:00"},"Domingo":{"activo":true,"inicio":"07:00","fin":"10:00"}}', ARRAY['2026-08-04','2026-08-06','2026-08-09','2026-08-11','2026-08-13'], true);

-- 4d. RESERVAS
INSERT INTO reservas (id, usuario_id, actividad_id, fecha, estado, codigo_confirmacion) VALUES
('res_01', 'part_01', 'act_01', '2026-08-03', 'confirmada', 'INM-A1B2C3'),
('res_02', 'part_02', 'act_05', '2026-08-03', 'confirmada', 'INM-D4E5F6'),
('res_03', 'part_03', 'act_03', '2026-08-05', 'pendiente', 'INM-G7H8I9'),
('res_04', 'part_04', 'act_06', '2026-08-04', 'confirmada', 'INM-J0K1L2'),
('res_05', 'part_05', 'act_08', '2026-08-05', 'completada', 'INM-M3N4O5'),
('res_06', 'part_06', 'act_12', '2026-08-07', 'confirmada', 'INM-P6Q7R8'),
('res_07', 'part_07', 'act_11', '2026-08-08', 'pendiente', 'INM-S9T0U1'),
('res_08', 'part_08', 'act_10', '2026-08-08', 'confirmada', 'INM-V2W3X4'),
('res_09', 'part_09', 'act_04', '2026-08-06', 'completada', 'INM-Y5Z6A7'),
('res_10', 'part_10', 'act_02', '2026-08-04', 'cancelada', 'INM-B8C9D0'),
('res_11', 'part_01', 'act_15', '2026-08-04', 'confirmada', 'INM-E1F2G3'),
('res_12', 'part_03', 'act_13', '2026-08-03', 'completada', 'INM-H4I5J6'),
('res_13', 'part_05', 'act_14', '2026-08-04', 'pendiente', 'INM-K7L8M9'),
('res_14', 'part_08', 'act_09', '2026-08-06', 'confirmada', 'INM-N0O1P2'),
('res_15', 'part_02', 'act_07', '2026-08-04', 'completada', 'INM-Q3R4S5');

-- 4e. RESEÑAS
INSERT INTO resenas (id, usuario_id, actividad_id, puntuacion, comentario) VALUES
('resena_01', 'part_05', 'act_08', 5, 'Una experiencia increíble. Gabriel es un guía excelente, los caballos son dóciles y el paisaje es de otro mundo.'),
('resena_02', 'part_09', 'act_04', 5, 'La noche de jazz fue espectacular. Músicos de primer nivel, el vino excelente, el ambiente íntimo. Voy a repetir.'),
('resena_03', 'part_03', 'act_13', 4, 'Muy buen taller, aprendí un montón de trucos que no conocía. Solo le faltó un poco más de práctica guiada.'),
('resena_04', 'part_02', 'act_07', 5, 'Las pastas veganas son una locura. Valentina explica todo con mucha paciencia y los sabores son increíbles.'),
('resena_05', 'part_04', 'act_06', 4, 'Andrés sabe muchísimo de fotografía y la caminata por el centro fue muy entretenida. Descubrí rincones que no conocía.'),
('resena_06', 'part_06', 'act_12', 5, 'Meditar entre los viñedos al atardecer es algo que todos deberían experimentar. Carolina tiene una energía hermosa.'),
('resena_07', 'part_01', 'act_01', 5, 'Sofía es una artista talentosa y muy paciente. Salí con una acuarela que ya tengo enmarcada en mi living.'),
('resena_08', 'part_08', 'act_10', 5, 'El taller de cerámica superó mis expectativas. Terminé con un macetero hermoso y muchas ganas de seguir aprendiendo.'),
('resena_09', 'part_01', 'act_15', 4, 'Muy lindo paseo. Gabriel conoce todas las especies de la zona. Eso sí, hay que madrugar pero vale la pena.'),
('resena_10', 'part_10', 'act_02', 3, 'El trekking estaba bueno pero se canceló por lluvia y no avisaron a tiempo. La gestión de reprogramación fue complicada.');

-- 4f. ANUNCIOS
INSERT INTO anuncios (id, patrocinador_id, titulo, imagen_url, url_destino, segmento, impresiones, clicks, activo) VALUES
('anun_01', 'anfitrion_02', 'Traé tu grupo y llevate 20% off en cabalgatas', 'https://images.unsplash.com/photo-1559181567-3190bea4f0c9?w=800', '/actividades/act_08', ARRAY['Naturaleza','Deportes'], 1240, 89, true),
('anun_02', 'anfitrion_03', 'Cocina regional: 2da persona gratis', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', '/actividades/act_03', ARRAY['Cocina'], 980, 67, true),
('anun_03', 'anfitrion_04', 'Noche de Jazz + Vino: cupos limitados', 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800', '/actividades/act_04', ARRAY['Música'], 2100, 145, true);

-- 4g. CUPONES
INSERT INTO cupones (id, anfitrion_id, codigo, descuento_porcentaje, usos_maximos, usos_actuales, activo, vence) VALUES
('cupon_01', 'anfitrion_01', 'ACUARELA10', 10, 20, 3, true, '2026-09-30'),
('cupon_02', 'anfitrion_03', 'EMPANADA20', 20, 15, 1, true, '2026-09-15'),
('cupon_03', 'anfitrion_05', 'AMANECER15', 15, 10, 0, true, '2026-10-01'),
('cupon_04', 'anfitrion_08', 'CABALGATA25', 25, 5, 2, true, '2026-08-31');