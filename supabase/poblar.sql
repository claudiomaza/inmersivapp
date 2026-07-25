-- ============================================================
-- INMERSIVAPP — Poblar base de datos (Mendoza real)
-- Sello: cm2labs · 2026-07-25
-- Concepto: experiencias inmersivas — aprendizaje transformacional,
-- conexión social, turismo cultural. Flow, embodied cognition,
-- storytelling interactivo.
-- USAR ON CONFLICT para ser IDEMPOTENTE
-- ============================================================
-- EJECUTAR DESPUÉS de reset_completo.sql (esquema)
-- ============================================================

BEGIN;

-- ════════════════════════════════════════════════════════════
-- 1. PERFILES — 8 anfitriones + 4 participantes
-- ════════════════════════════════════════════════════════════

INSERT INTO perfiles (id, email, nombre, telefono, avatar_url, rol) VALUES

  -- Anfitriones
  ('user_anfitrion_1', 'sofia.martinez@inmersivapp.com', 'Sofía Martínez', '+5492615001001', null, 'anfitrion'),
  ('user_anfitrion_2', 'pablo.gimenez@inmersivapp.com', 'Pablo Giménez', '+5492615001002', null, 'anfitrion'),
  ('user_anfitrion_3', 'lucia.fernandez@inmersivapp.com', 'Lucía Fernández', '+5492615001003', null, 'anfitrion'),
  ('user_anfitrion_4', 'andres.perez@inmersivapp.com', 'Andrés Pérez', '+5492615001004', null, 'anfitrion'),
  ('user_anfitrion_5', 'carolina.diaz@inmersivapp.com', 'Carolina Díaz', '+5492615001005', null, 'anfitrion'),
  ('user_anfitrion_6', 'martin.lopez@inmersivapp.com', 'Martín López', '+5492615001006', null, 'anfitrion'),
  ('user_anfitrion_7', 'valentina.rojas@inmersivapp.com', 'Valentina Rojas', '+5492615001007', null, 'anfitrion'),
  ('user_anfitrion_8', 'fernando.quiroga@inmersivapp.com', 'Fernando Quiroga', '+5492615001008', null, 'anfitrion'),

  -- Participantes
  ('user_participante_1', 'laura.martinez@email.com', 'Laura Martínez', '+5492615002001', null, 'participante'),
  ('user_participante_2', 'pedro.ramirez@email.com', 'Pedro Ramírez', '+5492615002002', null, 'participante'),
  ('user_participante_3', 'florencia.molina@email.com', 'Florencia Molina', '+5492615002003', null, 'participante'),
  ('user_participante_4', 'nicolas.contreras@email.com', 'Nicolás Contreras', '+5492615002004', null, 'participante')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 2. ACTIVIDADES — 20 experiencias inmersivas mendocinas
--    Cada una involucra al participante ACTIVAMENTE en la
--    dinámica: no hay espectadores, todos son protagonistas.
-- ════════════════════════════════════════════════════════════

INSERT INTO actividades (id, anfitrion_id, titulo, descripcion, categoria, precio, fecha, hora, lugar, capacidad_max, imagen_url) VALUES

  -- 🎭 Sofía Martínez — Teatro Inmersivo / Storytelling
  ('a0000000-0000-0000-0000-000000000001', 'user_anfitrion_1',
   'Misterio en el Jardín Botánico',
   'Escape room al aire libre. Un botánico desapareció en el jardín y vos y tu equipo tienen 90 minutos para encontrar las pistas ocultas entre las plantas, descifrar los acertijos y resolver el misterio antes del atardecer. Actores en vivo guían la historia.',
   'Inmersión', 9000, '2026-08-15', '10:00', 'Jardín Botánico, Chacras de Coria, Luján de Cuyo', 15,
   'https://images.unsplash.com/photo-1520324761-0ceb1f0b0e89?w=800'),

  ('a0000000-0000-0000-0000-000000000011', 'user_anfitrion_1',
   'Mendoza 1861: Teatro Inmersivo en la Plaza',
   'Viajá al pasado. Con vestuario de época, cada participante interpreta un personaje real de la Mendoza del siglo XIX y reconstruye la historia de la Plaza Independencia a través de escenas improvisadas. No necesita experiencia en actuación.',
   'Inmersión', 7500, '2026-08-29', '16:00', 'Plaza Independencia, Ciudad', 12,
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'),

  ('a0000000-0000-0000-0000-000000000012', 'user_anfitrion_1',
   'La Trama Oculta del Barrio Bombal',
   'Juego de detectives por el barrio más histórico de Mendoza. Cada participante recibe un rol (investigador, periodista, cómplice) y debe seguir pistas escondidas en comercios reales, interrogar a personajes y descubrir el secreto del Barrio Bombal.',
   'Inmersión', 6500, '2026-09-12', '15:00', 'Barrio Bombal, Ciudad', 10,
   'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'),

  -- 🥾 Pablo Giménez — Aventura Inmersiva / Supervivencia
  ('a0000000-0000-0000-0000-000000000003', 'user_anfitrion_2',
   'Operación Cerro de la Gloria',
   'Misión de exploración y rescate en el Cerro de la Gloria. Divididos en equipos, deben navegar con mapa y brújula, superar estaciones de habilidades (nudos, primeros auxilios, orientación) y llegar a la cima con el informe completo. Sin celulares.',
   'Aventura', 4500, '2026-08-22', '08:00', 'Cerro de la Gloria, Parque General San Martín, Ciudad', 20,
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'),

  ('a0000000-0000-0000-0000-000000000013', 'user_anfitrion_2',
   'Expedición Nocturna en Potrerillos',
   'Caminata nocturna de 5 km por senderos del dique con linternas frontales. En el camino, paradas con narración de mitos andinos alrededor de fogatas. La experiencia culmina con un silencio colectivo bajo las estrellas y chocolate caliente.',
   'Aventura', 8000, '2026-09-06', '17:00', 'Dique Potrerillos, Luján de Cuyo', 12,
   'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800'),

  ('a0000000-0000-0000-0000-000000000014', 'user_anfitrion_2',
   'Misión Río Mendoza: Rescate Acuático',
   'Simulación de operación de rescate en el río. Cada participante asume un rol (coordinador, rescatista, comunicación). Incluye técnicas básicas de RCP, uso de cuerdas y trabajo en equipo en corriente controlada. Instructores certificados.',
   'Aventura', 15000, '2026-09-20', '09:00', 'Río Mendoza, Potrerillos, Luján de Cuyo', 16,
   'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800'),

  ('a0000000-0000-0000-0000-000000000015', 'user_anfitrion_2',
   'La Carrera del Pedemonte',
   'Competencia de mountain bike por equipos con postas. Cada posta combina un desafío físico (trepada, descenso técnico) con uno mental (acertijo, memoria, coordinación). El equipo completo debe cruzar la meta. Bicicletas incluidas.',
   'Aventura', 10000, '2026-10-04', '09:00', 'Pedemonte, Las Heras', 10,
   'https://images.unsplash.com/photo-1576435771530-0c0e240e0d4e?w=800'),

  -- 🍲 Lucía Fernández — Inmersión Cultural / Turismo Humano
  ('a0000000-0000-0000-0000-000000000005', 'user_anfitrion_3',
   'Almuerzo en Casa de los Fernández',
   'Compartí un almuerzo familiar auténtico en la casa de Lucía. No es una clase de cocina: es una experiencia de pertenencia. Ayudás a preparar las empanadas con la receta de la abuela, ponés la mesa, comés con la familia y escuchás las historias de la mesa familiar.',
   'Cultura', 6500, '2026-08-30', '18:00', 'Godoy Cruz', 12,
   'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'),

  ('a0000000-0000-0000-0000-000000000016', 'user_anfitrion_3',
   'Un Día en la Bodega: Vigneron por Jornada',
   'Trabajá como un vigneron real por un día. Te levantás temprano, participás de la cosecha (o la poda según la temporada), limpiás barricas, aprendés a catar mosto y al final del día compartís una cena con los trabajadores de la bodega. El vino que ayudaste a hacer es tuyo.',
   'Cultura', 12000, '2026-09-13', '07:00', 'Ruta del Vino, Maipú', 15,
   'https://images.unsplash.com/photo-1510812431401-41d46bd4722f?w=800'),

  ('a0000000-0000-0000-0000-000000000017', 'user_anfitrion_3',
   'Cosecha de Olivos con la Familia Quiroga',
   'Pasá el día completo con una familia olivícola de Lunlunta. Cosechás aceitunas a mano, llevás la cosecha al molino familiar, prensás tu propio aceite, y almorzás en su casa con los productos de la huerta. Te llevás una botella de aceite que vos mismo produjiste.',
   'Cultura', 6000, '2026-09-27', '08:00', 'Lunlunta, Maipú', 20,
   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'),

  -- 📸 Andrés Pérez — Narrativa Visual Inmersiva
  ('a0000000-0000-0000-0000-000000000008', 'user_anfitrion_4',
   'Misión Fotográfica: Documentá Potrerillos',
   'Cada participante recibe un personaje y una misión fotográfica distinta. Unos son arqueólogos visuales, otros cronistas de viaje, otros documentalistas. Deben capturar la historia de Potrerillos desde la mirada de su rol. Al final, cada uno revela su historia en una proyección colectiva.',
   'Arte', 8000, '2026-08-24', '16:00', 'Potrerillos, Luján de Cuyo', 10,
   'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'),

  ('a0000000-0000-0000-0000-000000000018', 'user_anfitrion_4',
   'Mendoza en 24 Fotos: Competencia por Equipos',
   'Competencia de fotografía narrativa. Equipos de 3 personas reciben un mapa de la ciudad con ubicaciones secretas y un tema distinto cada una. Tienen 3 horas para capturar 24 fotos que cuenten una historia coherente. Gana el equipo que mejor narre su versión de Mendoza.',
   'Arte', 5000, '2026-09-05', '09:00', 'Centro Histórico, Ciudad', 12,
   'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800'),

  ('a0000000-0000-0000-0000-000000000019', 'user_anfitrion_4',
   'El Estudio Viviente',
   'El estudio de Andrés se transforma en 5 escenografías distintas (un café parisino, una casa de campo, un estudio de los 50, un jardín japonés, un taller mecánico). Los participantes rotan roles de fotógrafo y modelo, creando una historia visual colaborativa.',
   'Arte', 6000, '2026-09-19', '10:00', 'Quinta Sección, Ciudad', 15,
   'https://images.unsplash.com/photo-1504898770365-14caca6a7320?w=800'),

  -- 🧘 Carolina Díaz — Inmersión Sensorial / Corporal
  ('a0000000-0000-0000-0000-000000000009', 'user_anfitrion_5',
   'El Cuerpo Habla: Teatro Sensorial en el Parque',
   'Experiencia de movimiento y expresión corporal sin palabras. Inspirada en los elementos del Rosedal, cada participante explora el lenguaje del cuerpo a través de dinámicas de confianza, contacto visual, y movimiento guiado. No importa la flexibilidad, importa la presencia.',
   'Bienestar', 2500, '2026-08-23', '09:00', 'Rosedal, Parque General San Martín, Ciudad', 25,
   'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800'),

  ('a0000000-0000-0000-0000-000000000010', 'user_anfitrion_5',
   'Baño de Sonido al Pie del Dique',
   'Viaje sonoro inmersivo al atardecer. Acostados sobre mantas al borde del Dique Cipolletti, Carolina guía una meditación mientras cuencos, gongs y tambores envuelven el espacio. El cierre es un silencio colectivo donde solo se escucha el agua y el viento.',
   'Bienestar', 5000, '2026-09-05', '18:00', 'Dique Cipolletti, Las Heras', 20,
   'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'),

  ('a0000000-0000-0000-0000-000000000020', 'user_anfitrion_5',
   'Retiro de Reconexión en Cacheuta',
   '3 días de desconexión total. Yoga al amanecer, caminatas silenciosas por la montaña, meditación guiada, comidas conscientes preparadas con ingredientes de la zona, baños termales bajo las estrellas y una fogata de cierre donde cada persona comparte su experiencia.',
   'Bienestar', 35000, '2026-10-10', '09:00', 'Cacheuta, Luján de Cuyo', 10,
   'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),

  -- 🎵 Martín López — Inmersión Musical Colectiva
  ('a0000000-0000-0000-0000-000000000004', 'user_anfitrion_6',
   'Círculo de Tambores en el Centro',
   'Percusión colectiva sin experiencia previa. Cada participante elige un instrumento de percusión y Martín guía al grupo en la construcción de una canción en vivo. Nadie dirige, todos escuchan y responden. El círculo se convierte en una conversación rítmica.',
   'Música', 3500, '2026-08-16', '20:00', 'Ciudad', 20,
   'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800'),

  ('a0000000-0000-0000-0000-000000000021', 'user_anfitrion_6',
   'Cantata al Atardecer en los Viñedos',
   'El grupo aprende una canción folclórica cuyana completa (letra, armonía, ritmo) y la graba en vivo entre los viñedos al atardecer. Cada persona elige su rol: voz, percusión corporal o acompañamiento. Al final, escuchan la grabación con una copa de vino.',
   'Música', 7500, '2026-09-26', '17:00', 'Bodega en Vistalba, Luján de Cuyo', 25,
   'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800'),

  -- 🧵 Valentina Rojas — Inmersión Ancestral
  ('a0000000-0000-0000-0000-000000000006', 'user_anfitrion_7',
   'Tejedora por un Día',
   'Viví como una artesana textil mapuche. Valentina te recibe en su taller en Chacras, te enseña las técnicas ancestrales de telar, teje con vos mientras compartís un almuerzo tradicional y escuchás las historias de su comunidad. Te llevás tu propia pieza tejida.',
   'Cultura', 6000, '2026-08-17', '14:00', 'Chacras de Coria, Luján de Cuyo', 10,
   'https://images.unsplash.com/photo-1565193566173-7a0ee3dbea78?w=800'),

  -- 💻 Fernando Quiroga — Inmersión Digital
  ('a0000000-0000-0000-0000-000000000007', 'user_anfitrion_8',
   'Escape Room Digital: El Misterio del Código',
   'Escape room físico donde cada acertijo se resuelve escribiendo código. No necesitás saber programar — Fernando te guía. Combinás lógica, trabajo en equipo y tecnología para desbloquear puertas, descifrar mensajes y encontrar la salida. Laptops incluidas.',
   'Tecnología', 5000, '2026-08-18', '10:00', 'Godoy Cruz', 20,
   'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 3. COMERCIOS — 8 patrocinadores
-- ════════════════════════════════════════════════════════════

INSERT INTO comercios (id, anfitrion_id, nombre, rubro, direccion, contacto, beneficio_desc) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'user_anfitrion_1',
   'Mercado de la Plaza', 'Alimentos',
   'Plaza Pedro del Castillo 50, Ciudad', '261-438-1001',
   'Comprando $2000 en productos orgánicos, recibí un cupón de descuento para actividades de Sofía'),
  ('c0000000-0000-0000-0000-000000000002', 'user_anfitrion_1',
   'Librería García Santos', 'Cultura',
   'Av. Colón 150, Ciudad', '261-423-4567',
   'Comprando 3 libros de narrativa, llevate descuento en experiencias inmersivas'),
  ('c0000000-0000-0000-0000-000000000003', 'user_anfitrion_2',
   'Andes Outdoor', 'Indumentaria',
   'Las Heras 256, Ciudad', '261-405-6789',
   'Comprando una mochila o botella reutilizable, descuento en expediciones'),
  ('c0000000-0000-0000-0000-000000000004', 'user_anfitrion_3',
   'Viñedos Don Tomás', 'Bebidas',
   'Ruta 40 Km 15, Maipú', '261-530-2020',
   'Degustación gratuita de 3 vinos para participantes de inmersiones culturales'),
  ('c0000000-0000-0000-0000-000000000005', 'user_anfitrion_4',
   'FotoLab Mendoza', 'Fotografía',
   '9 de Julio 890, Ciudad', '261-429-8833',
   '12% off en impresión de fotos para participantes de las misiones fotográficas'),
  ('c0000000-0000-0000-0000-000000000006', 'user_anfitrion_5',
   'Alma Natural', 'Bienestar',
   'Arenal 300, Ciudad', '261-438-5500',
   '15% off en productos de bienestar para quienes hagan experiencias con Carolina'),
  ('c0000000-0000-0000-0000-000000000007', 'user_anfitrion_2',
   'Cervecería Andina', 'Gastronomía',
   'Av. San Martín 952, Ciudad', '261-618-1234',
   '2x1 en cerveza artesanal para participantes de cualquier actividad del día'),
  ('c0000000-0000-0000-0000-000000000008', 'user_anfitrion_6',
   'Casa de la Cultura', 'Música',
   'Mitre 123, Ciudad', '261-444-5678',
   'Entrada gratis a peñas de los jueves para participantes de inmersiones musicales')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 4. CUPONES — vinculados a comercios (12% off, 12 usos)
-- ════════════════════════════════════════════════════════════

INSERT INTO cupones (codigo, comercio_id, descuento_tipo, descuento_valor, condiciones, usos_maximos, usos_actuales, activo) VALUES
  ('SOFIA12', 'c0000000-0000-0000-0000-000000000001', 'porcentaje', 12,
   '12% off en actividades inmersivas de Sofía presentando ticket del Mercado de la Plaza', 50, 12, true),
  ('SOFIA12B', 'c0000000-0000-0000-0000-000000000002', 'porcentaje', 12,
   '12% off en experiencias de Sofía comprando 3 libros en García Santos', 50, 12, true),
  ('PABLO12', 'c0000000-0000-0000-0000-000000000003', 'porcentaje', 12,
   '12% de descuento en expediciones de Pablo con compra en Andes Outdoor', 50, 12, true),
  ('LUCIA12', 'c0000000-0000-0000-0000-000000000004', 'porcentaje', 12,
   '12% off en inmersiones culturales de Lucía con degustación en Viñedos Don Tomás', 50, 12, true),
  ('ANDRES12', 'c0000000-0000-0000-0000-000000000005', 'porcentaje', 12,
   '12% off en impresión y revelado en FotoLab Mendoza para participantes de misiones', 50, 12, true),
  ('CAROLINA12', 'c0000000-0000-0000-0000-000000000006', 'porcentaje', 12,
   '12% off en productos de bienestar en Alma Natural para quienes hagan experiencias con Carolina', 50, 12, true),
  ('PABLO12B', 'c0000000-0000-0000-0000-000000000007', 'porcentaje', 12,
   '12% off en cerveza artesanal en Cervecería Andina presentando código de reserva', 50, 12, true),
  ('MARTIN12', 'c0000000-0000-0000-0000-000000000008', 'porcentaje', 12,
   '12% off en entrada a peñas de los jueves en Casa de la Cultura', 50, 12, true)
ON CONFLICT (codigo) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 5. RESERVAS
-- ════════════════════════════════════════════════════════════

INSERT INTO reservas (id, usuario_id, actividad_id, cantidad, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_participante_1', 'a0000000-0000-0000-0000-000000000001', 2, 'confirmada'),
  ('00000000-0000-0000-0000-000000000002', 'user_participante_2', 'a0000000-0000-0000-0000-000000000003', 1, 'pendiente'),
  ('00000000-0000-0000-0000-000000000003', 'user_participante_3', 'a0000000-0000-0000-0000-000000000005', 1, 'confirmada'),
  ('00000000-0000-0000-0000-000000000004', 'user_participante_4', 'a0000000-0000-0000-0000-000000000009', 1, 'confirmada'),
  ('00000000-0000-0000-0000-000000000005', 'user_participante_1', 'a0000000-0000-0000-0000-000000000004', 3, 'pendiente')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 6. PAGOS
-- ════════════════════════════════════════════════════════════

INSERT INTO pagos (usuario_id, reserva_id, monto, metodo_pago, estado) VALUES
  ('user_participante_1', '00000000-0000-0000-0000-000000000001', 18000, 'mercadopago', 'aprobado'),
  ('user_participante_3', '00000000-0000-0000-0000-000000000003', 6500, 'mercadopago', 'aprobado'),
  ('user_participante_4', '00000000-0000-0000-0000-000000000004', 2500, 'mercadopago', 'aprobado')
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 7. PAGOS_ANFITRION
-- ════════════════════════════════════════════════════════════

INSERT INTO pagos_anfitrion (reserva_id, anfitrion_id, monto, comision, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 16200, 1800, 'pendiente'),
  ('00000000-0000-0000-0000-000000000003', 'user_anfitrion_3', 5850, 650, 'pendiente')
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 8. RESEÑAS
-- ════════════════════════════════════════════════════════════

INSERT INTO resenas (usuario_id, actividad_id, puntuacion, comentario) VALUES
  ('user_participante_1', 'a0000000-0000-0000-0000-000000000001', 5,
   'Nunca hice un escape room al aire libre. Resolver pistas en el jardín botánico mientras caía la tarde fue mágico. Los actores meten muchísimo en la historia.'),
  ('user_participante_3', 'a0000000-0000-0000-0000-000000000005', 5,
   'Almorzar con la familia de Lucía me hizo sentir como en casa. Aprendí más de Mendoza en esa mesa que en cualquier guía turística. El repulgue de las empanadas me salió casi perfecto.'),
  ('user_participante_2', 'a0000000-0000-0000-0000-000000000003', 5,
   'La operación de rescate en el Cerro fue alucinante. Nunca pensé que navegar con mapa y brújula fuera tan adrenalínico. Pablo es un capo transmitiendo su pasión por la montaña.'),
  ('user_participante_4', 'a0000000-0000-0000-0000-000000000009', 5,
   'El teatro sensorial en el Rosedal me rompió esquemas. Comunicarme sin palabras con desconocidos y sentir que nos entendíamos perfectamente fue una experiencia transformadora.')
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 9. FUNCIONES
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