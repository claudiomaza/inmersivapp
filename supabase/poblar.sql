-- ============================================================
-- INMERSIVAPP — Poblar base de datos (Mendoza real)
-- Sello: cm2labs · 2026-07-25
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
-- 2. ACTIVIDADES — 20 experiencias mendocinas
-- ════════════════════════════════════════════════════════════

INSERT INTO actividades (id, anfitrion_id, titulo, descripcion, categoria, precio, fecha, hora, lugar, capacidad_max, imagen_url) VALUES

  -- 🎨 Sofía Martínez — Arte
  ('a0000000-0000-0000-0000-000000000001', 'user_anfitrion_1',
   'Taller de Acuarela en el Jardín Botánico',
   'Pintá al aire libre rodeado de naturaleza en el Jardín Botánico de Chacras de Coria. Incluye materiales y un vino de honor al cierre.',
   'Arte', 7000, '2026-08-15', '10:00', 'Chacras de Coria, Luján de Cuyo', 15,
   'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'),

  ('a0000000-0000-0000-0000-000000000011', 'user_anfitrion_1',
   'Retrato en Pastel: Plaza Independencia',
   'Clase de retrato al pastel en pleno centro mendocino. Inspirate con la arquitectura histórica de la Plaza Independencia.',
   'Arte', 5500, '2026-08-29', '16:00', 'Plaza Independencia, Ciudad', 12,
   'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800'),

  ('a0000000-0000-0000-0000-000000000012', 'user_anfitrion_1',
   'Grabado Artesanal en el Barrio Bombal',
   'Taller de xilografía en el histórico Barrio Bombal. Creá tu propia matriz y estampá tus diseños en papel artesanal.',
   'Arte', 4500, '2026-09-12', '15:00', 'Barrio Bombal, Ciudad', 10,
   'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'),

  -- 🥾 Pablo Giménez — Naturaleza / Aventura
  ('a0000000-0000-0000-0000-000000000003', 'user_anfitrion_2',
   'Trekking al Cerro de la Gloria con Mate',
   'Caminata guiada al Cerro de la Gloria con vista panorámica de la ciudad. Incluye mate de bienvenida en la cima.',
   'Naturaleza', 2500, '2026-08-22', '08:00', 'Cerro de la Gloria, Parque General San Martín, Ciudad', 20,
   'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),

  ('a0000000-0000-0000-0000-000000000013', 'user_anfitrion_2',
   'Cabalgata al Atardecer en Potrerillos',
   'Cabalgata guiada por los senderos del Dique Potrerillos con la Cordillera de fondo. Cierre con fogata y chocolate caliente.',
   'Naturaleza', 12000, '2026-09-06', '17:00', 'Potrerillos, Luján de Cuyo', 12,
   'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),

  ('a0000000-0000-0000-0000-000000000014', 'user_anfitrion_2',
   'Rafting en el Río Mendoza',
   'Bajada de rafting nivel principiante por el Río Mendoza. Instructores certificados y equipo completo. Ideal para grupos.',
   'Deportes', 15000, '2026-09-20', '09:00', 'Río Mendoza, Potrerillos, Luján de Cuyo', 16,
   'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),

  ('a0000000-0000-0000-0000-000000000015', 'user_anfitrion_2',
   'Travesía en Mountain Bike por el Pedemonte',
   'Recorrido en MTB por los senderos del pedemonte mendocino. 25 km de dificultad media con paisajes increíbles. Bicicleta incluida.',
   'Deportes', 8500, '2026-10-04', '09:00', 'Pedemonte, Las Heras', 10,
   'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),

  -- 🍲 Lucía Fernández — Gastronomía
  ('a0000000-0000-0000-0000-000000000005', 'user_anfitrion_3',
   'Clase de Cocina Regional: Empanadas Mendocinas',
   'Aprendé a preparar empanadas mendocinas auténticas con receta familiar. Incluye degustación con vino Malbec de la zona.',
   'Gastronomía', 5500, '2026-08-30', '18:00', 'Godoy Cruz', 12,
   'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'),

  ('a0000000-0000-0000-0000-000000000016', 'user_anfitrion_3',
   'Maridaje de Vinos y Quesos en Maipú',
   'Recorrido por 3 bodegas de Maipú con degustación de vinos y tabla de quesos artesanales. Incluye visita guiada a viñedos.',
   'Gastronomía', 9500, '2026-09-13', '11:00', 'Ruta del Vino, Maipú', 15,
   'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'),

  ('a0000000-0000-0000-0000-000000000017', 'user_anfitrion_3',
   'Taller de Oliva y Aceite en Lunlunta',
   'Visita a un olivar familiar con degustación de aceites de oliva extra virgen. Aprendé a diferenciar variedades y maridajes.',
   'Gastronomía', 4000, '2026-09-27', '10:00', 'Lunlunta, Maipú', 20,
   'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'),

  -- 📸 Andrés Pérez — Fotografía
  ('a0000000-0000-0000-0000-000000000008', 'user_anfitrion_4',
   'Safari Fotográfico por Potrerillos',
   'Recorrido fotográfico por los paisajes de Potrerillos al atardecer. Ideal para aprender fotografía de paisaje con un profesional.',
   'Fotografía', 8000, '2026-08-24', '16:00', 'Potrerillos, Luján de Cuyo', 10,
   'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'),

  ('a0000000-0000-0000-0000-000000000018', 'user_anfitrion_4',
   'Street Photography: Ciudad de Mendoza',
   'Caminata fotográfica por el centro histórico: Peatonal Sarmiento, Plaza Independencia y Mercado Central. Revelá tu mirada.',
   'Fotografía', 3500, '2026-09-05', '09:00', 'Centro Histórico, Ciudad', 12,
   'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'),

  ('a0000000-0000-0000-0000-000000000019', 'user_anfitrion_4',
   'Taller de Edición con Luz Natural',
   'Aprendé a editar tus fotos con luz natural usando Lightroom. Traé tu cámara o celular. Incluye coffee break en el estudio.',
   'Fotografía', 5000, '2026-09-19', '10:00', 'Quinta Sección, Ciudad', 15,
   'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'),

  -- 🧘 Carolina Díaz — Yoga / Bienestar
  ('a0000000-0000-0000-0000-000000000009', 'user_anfitrion_5',
   'Yoga al Aire Libre en el Parque San Martín',
   'Sesión de yoga y meditación guiada en el Rosedal del Parque General San Martín. Conectá con la naturaleza al pie de la Cordillera.',
   'Yoga', 1800, '2026-08-23', '09:00', 'Rosedal, Parque General San Martín, Ciudad', 25,
   'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),

  ('a0000000-0000-0000-0000-000000000010', 'user_anfitrion_5',
   'Ciclo de Meditación en el Pie de Monte',
   'Tres encuentros al atardecer con meditación guiada, baño de sonido y cierre con té de hierbas serranas. En el Dique Cipolletti.',
   'Meditación', 4500, '2026-09-05', '18:00', 'Dique Cipolletti, Las Heras', 20,
   'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'),

  ('a0000000-0000-0000-0000-000000000020', 'user_anfitrion_5',
   'Retiro de Fin de Semana en Cacheuta',
   'Desconectate del ruido con un retiro de yoga y meditación en Cacheuta. Incluye comidas, alojamiento y baños termales.',
   'Yoga', 35000, '2026-10-10', '09:00', 'Cacheuta, Luján de Cuyo', 10,
   'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),

  -- 🎵 Martín López — Música
  ('a0000000-0000-0000-0000-000000000004', 'user_anfitrion_6',
   'Noche de Folklore y Guitarra en el Centro',
   'Velada musical con guitarra criolla y folklore cuyano. Participá activamente, no necesitás experiencia previa.',
   'Música', 3000, '2026-08-16', '20:00', 'Ciudad', 20,
   'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'),

  ('a0000000-0000-0000-0000-000000000021', 'user_anfitrion_6',
   'Taller de Canto Colectivo en la Bodega',
   'Cantá rodeado de viñedos. Ejercicios de respiración, técnica vocal y canciones tradicionales argentinas. Cierre con vino.',
   'Música', 6000, '2026-09-26', '17:00', 'Bodega en Vistalba, Luján de Cuyo', 25,
   'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'),

  -- 🧵 Valentina Rojas — Manualidades
  ('a0000000-0000-0000-0000-000000000006', 'user_anfitrion_7',
   'Tejido en Telar Mapuche',
   'Taller de telar con técnicas ancestrales mapuches. Tejé tu propia pieza mientras conocés la historia de los pueblos originarios.',
   'Manualidades', 5000, '2026-08-17', '14:00', 'Chacras de Coria, Luján de Cuyo', 10,
   'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'),

  -- 💻 Fernando Quiroga — Tecnología
  ('a0000000-0000-0000-0000-000000000007', 'user_anfitrion_8',
   'Introducción a la Programación con Python',
   'Taller intensivo de Python para principiantes. Al final del día vas a tener tu primer programa funcionando. Traé tu laptop.',
   'Tecnología', 3000, '2026-08-18', '10:00', 'Godoy Cruz', 20,
   'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 3. COMERCIOS — 8 patrocinadores
-- ════════════════════════════════════════════════════════════

INSERT INTO comercios (id, anfitrion_id, nombre, rubro, direccion, contacto, beneficio_desc) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'user_anfitrion_1',
   'Mercado de la Plaza', 'Alimentos',
   'Plaza Pedro del Castillo 50, Ciudad', '261-438-1001',
   'Comprando $2000 en productos orgánicos, recibí un cupón de descuento para el taller de acuarela'),

  ('c0000000-0000-0000-0000-000000000002', 'user_anfitrion_1',
   'Librería García Santos', 'Cultura',
   'Av. Colón 150, Ciudad', '261-423-4567',
   'Comprando 3 libros de arte, llevate 50% off en actividades culturales de Inmersivapp'),

  ('c0000000-0000-0000-0000-000000000003', 'user_anfitrion_2',
   'Andes Outdoor', 'Indumentaria',
   'Las Heras 256, Ciudad', '261-405-6789',
   'Comprando una mochila o botella reutilizable, $500 de descuento en excursiones'),

  ('c0000000-0000-0000-0000-000000000004', 'user_anfitrion_3',
   'Viñedos Don Tomás', 'Bebidas',
   'Ruta 40 Km 15, Maipú', '261-530-2020',
   'Degustación gratuita de 3 vinos para participantes de clases de cocina'),

  ('c0000000-0000-0000-0000-000000000005', 'user_anfitrion_4',
   'FotoLab Mendoza', 'Fotografía',
   '9 de Julio 890, Ciudad', '261-429-8833',
   '10% off en impresión de fotos y revelado digital para participantes del taller'),

  ('c0000000-0000-0000-0000-000000000006', 'user_anfitrion_5',
   'Alma Natural', 'Bienestar',
   'Arenal 300, Ciudad', '261-438-5500',
   '15% off en productos de bienestar y té para quienes hagan yoga con Carolina'),

  ('c0000000-0000-0000-0000-000000000007', 'user_anfitrion_2',
   'Cervecería Andina', 'Gastronomía',
   'Av. San Martín 952, Ciudad', '261-618-1234',
   '2x1 en cerveza artesanal para participantes de cualquier actividad del día'),

  ('c0000000-0000-0000-0000-000000000008', 'user_anfitrion_6',
   'Casa de la Cultura', 'Música',
   'Mitre 123, Ciudad', '261-444-5678',
   'Entrada gratis a peñas de los jueves para alumnos del taller de guitarra')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 4. CUPONES — vinculados a comercios
-- ════════════════════════════════════════════════════════════

INSERT INTO cupones (codigo, comercio_id, descuento_tipo, descuento_valor, condiciones, usos_maximos, usos_actuales, activo) VALUES
  ('ACUARELA10', 'c0000000-0000-0000-0000-000000000001', 'porcentaje', 10,
   '10% off en el taller de acuarela presentando ticket de compra del Mercado de la Plaza', 50, 3, true),

  ('LIBROS50', 'c0000000-0000-0000-0000-000000000002', 'porcentaje', 50,
   '50% off en actividades culturales comprando 3 libros de arte en García Santos', 30, 1, true),

  ('MOCHILA500', 'c0000000-0000-0000-0000-000000000003', 'fijo', 500,
   '$500 de descuento en excursiones con la compra de mochila o botella en Andes Outdoor', 100, 12, true),

  ('VINOS3', 'c0000000-0000-0000-0000-000000000004', 'fijo', 0,
   'Degustación gratuita de 3 vinos en Viñedos Don Tomás para participantes de clases de cocina', 200, 5, true),

  ('FOTO10', 'c0000000-0000-0000-0000-000000000005', 'porcentaje', 10,
   '10% off en impresión y revelado en FotoLab Mendoza', 80, 0, true),

  ('BIENESTAR15', 'c0000000-0000-0000-0000-000000000006', 'porcentaje', 15,
   '15% off en productos de bienestar en Alma Natural', 60, 8, true),

  ('CEVE2X1', 'c0000000-0000-0000-0000-000000000007', 'fijo', 0,
   '2x1 en cerveza artesanal en Cervecería Andina presentando código de reserva', 150, 22, true),

  ('PENA', 'c0000000-0000-0000-0000-000000000008', 'fijo', 0,
   'Entrada gratuita a peñas de los jueves en Casa de la Cultura', 100, 4, true)
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
  ('user_participante_1', '00000000-0000-0000-0000-000000000001', 14000, 'mercadopago', 'aprobado'),
  ('user_participante_3', '00000000-0000-0000-0000-000000000003', 5500, 'mercadopago', 'aprobado'),
  ('user_participante_4', '00000000-0000-0000-0000-000000000004', 1800, 'mercadopago', 'aprobado')
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 7. PAGOS_ANFITRION
-- ════════════════════════════════════════════════════════════

INSERT INTO pagos_anfitrion (reserva_id, anfitrion_id, monto, comision, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 12600, 1400, 'pendiente'),
  ('00000000-0000-0000-0000-000000000003', 'user_anfitrion_3', 4950, 550, 'pendiente')
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 8. RESEÑAS
-- ════════════════════════════════════════════════════════════

INSERT INTO resenas (usuario_id, actividad_id, puntuacion, comentario) VALUES
  ('user_participante_1', 'a0000000-0000-0000-0000-000000000001', 5,
   'Una experiencia hermosa. Sofía explica re bien y el jardín botánico es un lugar mágico para pintar. Volvería sin dudas.'),
  ('user_participante_3', 'a0000000-0000-0000-0000-000000000005', 4,
   'Las empanadas más ricas que hice en mi vida. Lucía tiene una paciencia increíble explicando el repulgue. El vino Malbec de acompañamiento un 10.'),
  ('user_participante_2', 'a0000000-0000-0000-0000-000000000003', 5,
   'El Cerro de la Gloria a la mañana es imperdible. Pablo sabe un montón de historia de Mendoza. El mate en la cima fue el broche de oro.'),
  ('user_participante_4', 'a0000000-0000-0000-0000-000000000009', 5,
   'Hacer yoga al aire libre con la Cordillera de fondo no tiene precio. Carolina es una genia, salí renovada.')
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