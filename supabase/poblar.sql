-- ============================================================
-- INMERSIVAPP — Poblar base de datos (Mendoza real)
-- Sello: cm2labs · 2026-07-25
-- ============================================================
-- EJECUTAR DESPUÉS de reset_completo.sql (esquema)
-- ============================================================
-- Requisito: que los perfiles de Clerk existan o se creen.
-- Por ahora inserts con IDs fijos para desarrollo.
-- ============================================================

-- ─── PERFILES ────────────────────────────────────────────────

INSERT INTO perfiles (id, email, nombre, telefono, avatar_url, rol) VALUES
  ('user_anfitrion_1', 'sofia.martinez@inmersivapp.com', 'Sofía Martínez', '+5492615001001', null, 'anfitrion'),
  ('user_anfitrion_2', 'pablo.gimenez@inmersivapp.com', 'Pablo Giménez', '+5492615001002', null, 'anfitrion'),
  ('user_anfitrion_3', 'lucia.fernandez@inmersivapp.com', 'Lucía Fernández', '+5492615001003', null, 'anfitrion'),
  ('user_anfitrion_4', 'andres.perez@inmersivapp.com', 'Andrés Pérez', '+5492615001004', null, 'anfitrion'),
  ('user_anfitrion_5', 'carolina.diaz@inmersivapp.com', 'Carolina Díaz', '+5492615001005', null, 'anfitrion'),
  ('user_participante_1', 'laura.martinez@email.com', 'Laura Martínez', '+5492615002001', null, 'participante'),
  ('user_participante_2', 'pedro.ramirez@email.com', 'Pedro Ramírez', '+5492615002002', null, 'participante'),
  ('user_participante_3', 'florencia.molina@email.com', 'Florencia Molina', '+5492615002003', null, 'participante'),
  ('user_participante_4', 'nicolas.castillo@email.com', 'Nicolás Castillo', '+5492615002004', null, 'participante');

-- ─── ACTIVIDADES ─────────────────────────────────────────────

INSERT INTO actividades (id, anfitrion_id, titulo, descripcion, categoria, precio, fecha, hora, lugar, capacidad_max, imagen_url) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'user_anfitrion_1',
   'Taller de Acuarela Botánica en el Jardín',
   'Aprendé técnicas de acuarela pintando flores y plantas nativas en el Jardín Botánico de Chacras de Coria. Materiales incluidos, vermú al final. Ideal para principiantes.',
   'Arte', 3500, '2026-08-10', '10:00', 'Jardín Botánico, Chacras de Coria, Luján de Cuyo', 15,
   'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'),

  ('a0000000-0000-0000-0000-000000000002', 'user_anfitrion_1',
   'Cata de Vinos y Pintura en Bodega',
   'Una tarde de pintura guiada con copa de vino en mano en Bodega La Azul. Al final te llevás tu obra y una botella. Maridaje incluido.',
   'Arte', 5500, '2026-08-16', '17:00', 'Bodega La Azul, Ruta 15 Km 8, Maipú', 12,
   'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800'),

  ('a0000000-0000-0000-0000-000000000003', 'user_anfitrion_2',
   'Excursión al Cerro de la Gloria',
   'Caminata guiada por senderos del Cerro de la Gloria con vista panorámica de la ciudad. Incluye mate de bienvenida en la cima y fotos grupales.',
   'Naturaleza', 1500, '2026-08-08', '08:00', 'Base del Cerro de la Gloria, Parque Gral. San Martín, Ciudad', 20,
   'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),

  ('a0000000-0000-0000-0000-000000000004', 'user_anfitrion_2',
   'Trekking a la Quebrada del Ángel',
   'Caminata de dificultad media por la Quebrada del Ángel, en el piedemonte mendocino. Arroyos, flora nativa y vistas de la precordillera. Llevar agua y zapatillas.',
   'Naturaleza', 2500, '2026-08-22', '07:00', 'Portezuelo del Ángel, Las Heras', 15,
   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'),

  ('a0000000-0000-0000-0000-000000000005', 'user_anfitrion_3',
   'Clase de Cocina Regional: Empanadas Mendocinas',
   'Aprendé a preparar empanadas mendocinas auténticas con la receta de la abuela de Lucía. Incluye degustación con vino Malbec de la zona. Recetario al final.',
   'Gastronomía', 5500, '2026-08-14', '18:00', 'Lavalle 450, Godoy Cruz', 12,
   'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800'),

  ('a0000000-0000-0000-0000-000000000006', 'user_anfitrion_3',
   'Taller de Pastelería: Dulces Mendocinos',
   'Aprendé a hacer arrope de membrillo, dulce de cayote y alfajores mendocinos. Todo artesanal, llevás tus producciones.',
   'Gastronomía', 4000, '2026-08-28', '16:00', 'Lavalle 450, Godoy Cruz', 10,
   'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'),

  ('a0000000-0000-0000-0000-000000000007', 'user_anfitrion_4',
   'Taller de Fotografía en Bodega',
   'Mañana de fotografía en Bodega Catena Zapata. Composición, luz natural y edición móvil con el paisaje de la Cordillera de fondo.',
   'Fotografía', 3500, '2026-08-23', '09:00', 'Bodega Catena Zapata, Ruta 7 Km 12, Luján de Cuyo', 15,
   'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'),

  ('a0000000-0000-0000-0000-000000000008', 'user_anfitrion_4',
   'Caminata Fotográfica por el Centro Histórico',
   'Recorrido por la Peatonal Sarmiento, Plaza Independencia y el Paseo Alameda, capturando la arquitectura mendocina con tu celular.',
   'Fotografía', 1800, '2026-08-30', '17:00', 'Plaza Independencia, Ciudad', 20,
   'https://images.unsplash.com/photo-1507003211169-0a1dd7222f8d?w=800'),

  ('a0000000-0000-0000-0000-000000000009', 'user_anfitrion_5',
   'Yoga al Aire Libre en el Parque San Martín',
   'Sesión de yoga y meditación guiada en el Rosedal del Parque General San Martín. Conectá con la naturaleza al pie de la Cordillera.',
   'Naturaleza', 1800, '2026-08-22', '09:00', 'Rosedal, Parque General San Martín, Ciudad', 25,
   'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),

  ('a0000000-0000-0000-0000-000000000010', 'user_anfitrion_5',
   'Ciclo de Meditación en el Pie de Monte',
   'Tres encuentros al atardecer con meditación guiada, baño de sonido y cierre con té de hierbas serranas. En el Dique Cipolletti.',
   'Naturaleza', 4500, '2026-09-05', '18:00', 'Dique Cipolletti, Las Heras', 20,
   'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800');

-- ─── COMERCIOS ───────────────────────────────────────────────

INSERT INTO comercios (id, anfitrion_id, nombre, rubro, direccion, contacto, beneficio_desc) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'user_anfitrion_1',
   'Mercado de la Plaza',
   'Alimentos',
   'Plaza Pedro del Castillo 50, Ciudad',
   '261-438-1001',
   'Comprando $2000 en productos orgánicos, recibí un cupón de descuento para el taller de acuarela'),

  ('c0000000-0000-0000-0000-000000000002', 'user_anfitrion_1',
   'Librería García Santos',
   'Cultura',
   'Av. Colón 150, Ciudad',
   '261-423-4567',
   'Comprando 3 libros de arte, llevate 50% off en actividades culturales de Inmersivapp'),

  ('c0000000-0000-0000-0000-000000000003', 'user_anfitrion_2',
   'Andes Outdoor',
   'Indumentaria',
   'Las Heras 256, Ciudad',
   '261-405-6789',
   'Comprando una mochila o botella reutilizable, $500 de descuento en excursiones'),

  ('c0000000-0000-0000-0000-000000000004', 'user_anfitrion_3',
   'Viñedos Don Tomás',
   'Bebidas',
   'Ruta 40 Km 15, Maipú',
   '261-530-2020',
   'Degustación gratuita de 3 vinos para participantes de clases de cocina'),

  ('c0000000-0000-0000-0000-000000000005', 'user_anfitrion_4',
   'FotoLab Mendoza',
   'Fotografía',
   '9 de Julio 890, Ciudad',
   '261-429-8833',
   '10% off en impresión de fotos y revelado digital para participantes del taller'),

  ('c0000000-0000-0000-0000-000000000006', 'user_anfitrion_5',
   'Alma Natural',
   'Bienestar',
   'Arenal 300, Ciudad',
   '261-438-5500',
   '15% off en productos de bienestar y té para quienes hagan yoga con Carolina'),

  ('c0000000-0000-0000-0000-000000000007', 'user_anfitrion_2',
   'Cervecería Andina',
   'Gastronomía',
   'Av. San Martín 952, Ciudad',
   '261-618-1234',
   '2x1 en cerveza artesanal para los que hagan trekking con Pablo'),

  ('c0000000-0000-0000-0000-000000000008', 'user_anfitrion_5',
   'Té de la Sierra',
   'Alimentos',
   'Pellegrini 120, Godoy Cruz',
   '261-444-5678',
   '10% off en todo el local para la comunidad de yoga de Inmersivapp');

-- ─── CUPONES ────────────────────────────────────────────────

INSERT INTO cupones (codigo, comercio_id, descuento_tipo, descuento_valor, condiciones, usos_maximos, usos_actuales, activo) VALUES
  ('ACUARELA10', 'c0000000-0000-0000-0000-000000000001', 'porcentaje', 10,
   '10% off en el taller de acuarela. Válido presentando comprobante de compra del Mercado de la Plaza.', 30, 0, true),

  ('ARTE50', 'c0000000-0000-0000-0000-000000000002', 'porcentaje', 50,
   '50% off en cualquier actividad cultural de Inmersivapp. No acumulable con otras promos.', 25, 0, true),

  ('SIERRA500', 'c0000000-0000-0000-0000-000000000003', 'fijo', 500,
   '$500 de descuento en excursiones de Naturaleza. Válido hasta diciembre 2026.', 40, 0, true),

  ('VINO20', 'c0000000-0000-0000-0000-000000000004', 'porcentaje', 20,
   '20% off en la compra de vinos en Viñedos Don Tomás. Válido presentando el código en la bodega.', 25, 0, true),

  ('FOTO100', 'c0000000-0000-0000-0000-000000000005', 'fijo', 100,
   '$100 de descuento en impresión de fotos 20x30cm en FotoLab Mendoza.', 60, 0, true),

  ('YOGA15', 'c0000000-0000-0000-0000-000000000006', 'porcentaje', 15,
   '15% off en productos seleccionados de Alma Natural. Válido para quienes hayan asistido a una sesión de yoga.', 35, 0, true),

  ('CERVEZA2X1', 'c0000000-0000-0000-0000-000000000007', 'porcentaje', 50,
   '50% off (2x1 virtual) en cerveza artesanal en Cervecería Andina. Mostrando código.', 50, 0, true),

  ('TESIERRA10', 'c0000000-0000-0000-0000-000000000008', 'porcentaje', 10,
   '10% off en todo Té de la Sierra. Válido para la comunidad Inmersivapp.', 40, 0, true);

-- ─── RESERVAS ────────────────────────────────────────────────

INSERT INTO reservas (id, usuario_id, actividad_id, cantidad, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_participante_1', 'a0000000-0000-0000-0000-000000000001', 2, 'confirmada'),
  ('00000000-0000-0000-0000-000000000002', 'user_participante_2', 'a0000000-0000-0000-0000-000000000003', 1, 'pendiente'),
  ('00000000-0000-0000-0000-000000000003', 'user_participante_3', 'a0000000-0000-0000-0000-000000000005', 3, 'confirmada'),
  ('00000000-0000-0000-0000-000000000004', 'user_participante_4', 'a0000000-0000-0000-0000-000000000009', 1, 'pendiente');

-- ─── PAGOS ───────────────────────────────────────────────────

INSERT INTO pagos (usuario_id, reserva_id, monto, metodo_pago, estado) VALUES
  ('user_participante_1', '00000000-0000-0000-0000-000000000001', 7000, 'mercadopago', 'aprobado'),
  ('user_participante_3', '00000000-0000-0000-0000-000000000003', 16500, 'mercadopago', 'aprobado');

-- ─── PAGOS_ANFITRION ─────────────────────────────────────────

INSERT INTO pagos_anfitrion (reserva_id, anfitrion_id, monto, comision, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 6300, 700, 'pendiente'),
  ('00000000-0000-0000-0000-000000000003', 'user_anfitrion_3', 14850, 1650, 'pendiente');

-- ─── RESEÑAS ─────────────────────────────────────────────────

INSERT INTO resenas (usuario_id, actividad_id, puntuacion, comentario) VALUES
  ('user_participante_1', 'a0000000-0000-0000-0000-000000000001', 5,
   'Una experiencia hermosa. Sofía explica re bien y el jardín botánico es un lugar mágico para pintar. Volvería sin dudas.'),
  ('user_participante_3', 'a0000000-0000-0000-0000-000000000005', 4,
   'Las empanadas más ricas que hice en mi vida. Lucía tiene una paciencia increíble explicando el repulgue. El vino Malbec de acompañamiento un 10.'),
  ('user_participante_2', 'a0000000-0000-0000-0000-000000000003', 5,
   'El Cerro de la Gloria a la mañana es imperdible. Pablo sabe un montón de historia de Mendoza. El mate en la cima fue el broche de oro.'),
  ('user_participante_4', 'a0000000-0000-0000-0000-000000000009', 5,
   'Hacer yoga al aire libre con la Cordillera de fondo no tiene precio. Carolina es una genia, salí renovada.');

-- ─── FUNCIONES ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION incrementar_usos_cupon(p_codigo TEXT)
RETURNS void AS $$
BEGIN
  UPDATE cupones
  SET usos_actuales = usos_actuales + 1
  WHERE codigo = p_codigo
    AND usos_actuales < usos_maximos;
END;
$$ LANGUAGE plpgsql;