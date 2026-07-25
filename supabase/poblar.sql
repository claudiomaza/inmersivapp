-- ============================================================
-- INMERSIVAPP — Poblar base de datos
-- Sello: cm2labs · 2026-07-25
-- ============================================================
-- EJECUTAR DESPUÉS de reset_completo.sql (o del esquema nuevo)
-- ============================================================

-- ─── PERFILES (anfitriones + participantes) ─────────────────

INSERT INTO perfiles (id, email, nombre, telefono, avatar_url, rol) VALUES
  ('user_anfitrion_1', 'sofia.martinez@email.com', 'Sofía Martínez', '+5492615001001', null, 'anfitrion'),
  ('user_anfitrion_2', 'pablo.gimenez@email.com', 'Pablo Giménez', '+5492615001002', null, 'anfitrion'),
  ('user_anfitrion_3', 'lucia.fernandez@email.com', 'Lucía Fernández', '+5492615001003', null, 'anfitrion'),
  ('user_anfitrion_4', 'martin.lopez@email.com', 'Martín López', '+5492615001004', null, 'anfitrion'),
  ('user_anfitrion_5', 'carolina.diaz@email.com', 'Carolina Díaz', '+5492615001005', null, 'anfitrion'),
  ('user_participante_1', 'laura@inmersivapp.com', 'Laura Martínez', '+5492615002001', null, 'participante'),
  ('user_participante_2', 'pedro@inmersivapp.com', 'Pedro Ramírez', '+5492615002002', null, 'participante'),
  ('user_participante_3', 'florencia.molina@email.com', 'Florencia Molina', '+5492615002003', null, 'participante'),
  ('user_participante_4', 'nicolas.castillo@email.com', 'Nicolás Castillo', '+5492615002004', null, 'participante');

-- ─── ACTIVIDADES ────────────────────────────────────────────

INSERT INTO actividades (id, anfitrion_id, titulo, descripcion, categoria, precio, fecha, hora, lugar, capacidad_max, imagen_url) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 'Taller de Acuarela Botánica',
   'Aprendé técnicas de acuarela pintando flores y plantas nativas de Mendoza. Materiales incluidos. Ideal para principiantes.',
   'Arte', 3500, '2026-08-10', '10:00', 'Av. San Martín 845, Ciudad', 15,
   'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'),
  ('a0000000-0000-0000-0000-000000000002', 'user_anfitrion_1', 'Clase de Cocina Vegana',
   'Platos saludables sin ingredientes de origen animal. Incluye degustación y recetario digital.',
   'Gastronomía', 3500, '2026-08-12', '18:00', 'Av. San Martín 845, Ciudad', 10,
   'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'),
  ('a0000000-0000-0000-0000-000000000003', 'user_anfitrion_2', 'Excursión a Sierra Chica',
   'Caminata guiada por senderos naturales con vista panorámica. Incluye mate de bienvenida en la cima.',
   'Naturaleza', 1500, '2026-08-08', '08:00', 'Av. de los Trabajadores s/n, Base del Cerro', 20,
   'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),
  ('a0000000-0000-0000-0000-000000000004', 'user_anfitrion_2', 'Trekking al Cerro de la Virgen',
   'Caminata guiada por senderos del Cerro de la Virgen con vista panorámica de la ciudad.',
   'Naturaleza', 2500, '2026-08-15', '08:00', 'Av. de los Trabajadores s/n, Base del Cerro', 20,
   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'),
  ('a0000000-0000-0000-0000-000000000005', 'user_anfitrion_3', 'Clase de Cocina Regional: Empanadas Mendocinas',
   'Aprendé a preparar empanadas mendocinas auténticas con receta familiar. Incluye degustación con vino de la zona.',
   'Gastronomía', 5500, '2026-08-14', '18:00', 'Lavalle 450, Godoy Cruz', 12,
   'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800'),
  ('a0000000-0000-0000-0000-000000000006', 'user_anfitrion_4', 'Taller de Fotografía con Smartphone',
   'Descubrí cómo sacar fotos profesionales con tu celular. Composición, iluminación y edición básica.',
   'Fotografía', 2000, '2026-08-20', '16:00', 'Sarmiento 320, Ciudad', 20,
   'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'),
  ('a0000000-0000-0000-0000-000000000007', 'user_anfitrion_5', 'Yoga al Aire Libre en el Parque',
   'Sesión de yoga y meditación guiada en el Parque General San Martín. Conectá con la naturaleza.',
   'Naturaleza', 1800, '2026-08-22', '09:00', 'Parque General San Martín, Ciudad', 25,
   'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800');

-- ─── COMERCIOS ──────────────────────────────────────────────

INSERT INTO comercios (id, anfitrion_id, nombre, rubro, direccion, contacto, beneficio_desc) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 'Mercado Orgánico', 'Alimentos',
   'San Martín 1020, Ciudad', '261-555-0101',
   'Comprando $2000 en productos, llevate un cupón de descuento para el taller de cocina'),
  ('c0000000-0000-0000-0000-000000000002', 'user_anfitrion_1', 'Librería El Péndulo', 'Cultura',
   'Colón 560, Ciudad', '261-555-0102',
   'Comprando 3 libros, llevate 50% off en actividades culturales'),
  ('c0000000-0000-0000-0000-000000000003', 'user_anfitrion_2', 'Deportes Patagonia', 'Indumentaria',
   'Las Heras 250, Ciudad', '261-555-0103',
   'Comprando una mochila, llevate $500 de descuento en excursiones'),
  ('c0000000-0000-0000-0000-000000000004', 'user_anfitrion_3', 'Viñedos Don Tomás', 'Bebidas',
   'Ruta 40 Km 15, Maipú', '261-555-0104',
   'Degustación gratuita para participantes de clases de cocina'),
  ('c0000000-0000-0000-0000-000000000005', 'user_anfitrion_4', 'Foto Studio Mendoza', 'Fotografía',
   '9 de Julio 890, Ciudad', '261-555-0105',
   '10% off en impresión de fotos para participantes del taller'),
  ('c0000000-0000-0000-0000-000000000006', 'user_anfitrion_5', 'Alma Natural', 'Bienestar',
   'Arenal 300, Ciudad', '261-555-0106',
   '15% off en productos de bienestar para quienes hagan yoga');

-- ─── CUPONES ────────────────────────────────────────────────

INSERT INTO cupones (codigo, comercio_id, descuento_tipo, descuento_valor, condiciones, usos_maximos, usos_actuales, activo) VALUES
  ('COCINA10', 'c0000000-0000-0000-0000-000000000001', 'porcentaje', 10, 'Válido para la clase de cocina vegana. Mínimo 2 participantes.', 50, 0, true),
  ('CULTURA50', 'c0000000-0000-0000-0000-000000000002', 'porcentaje', 50, 'Válido en actividades culturales de Inmersivapp. No acumulable.', 30, 0, true),
  ('SIERRA500', 'c0000000-0000-0000-0000-000000000003', 'fijo', 500, 'Válido para excursiones a Sierra Chica. Válido hasta diciembre 2026.', 40, 0, true),
  ('VINO20', 'c0000000-0000-0000-0000-000000000004', 'porcentaje', 20, '20% off en la compra de vinos. Válido en la bodega.', 25, 0, true),
  ('FOTO100', 'c0000000-0000-0000-0000-000000000005', 'fijo', 100, '$100 de descuento en impresión de fotos 20x30cm.', 60, 0, true),
  ('YOGA15', 'c0000000-0000-0000-0000-000000000006', 'porcentaje', 15, '15% off en productos seleccionados de Alma Natural.', 35, 0, true);

-- ─── RESERVAS ───────────────────────────────────────────────

INSERT INTO reservas (id, usuario_id, actividad_id, cantidad, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_participante_1', 'a0000000-0000-0000-0000-000000000001', 2, 'confirmada'),
  ('00000000-0000-0000-0000-000000000002', 'user_participante_2', 'a0000000-0000-0000-0000-000000000003', 1, 'pendiente'),
  ('00000000-0000-0000-0000-000000000003', 'user_participante_3', 'a0000000-0000-0000-0000-000000000005', 3, 'confirmada'),
  ('00000000-0000-0000-0000-000000000004', 'user_participante_4', 'a0000000-0000-0000-0000-000000000007', 1, 'pendiente');

-- ─── PAGOS ──────────────────────────────────────────────────

INSERT INTO pagos (usuario_id, reserva_id, monto, metodo_pago, estado) VALUES
  ('user_participante_1', '00000000-0000-0000-0000-000000000001', 7000, 'mercadopago', 'aprobado'),
  ('user_participante_3', '00000000-0000-0000-0000-000000000003', 16500, 'mercadopago', 'aprobado');

-- ─── PAGOS_ANFITRION ────────────────────────────────────────

INSERT INTO pagos_anfitrion (reserva_id, anfitrion_id, monto, comision, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 6300, 700, 'pendiente'),
  ('00000000-0000-0000-0000-000000000003', 'user_anfitrion_3', 14850, 1650, 'pendiente');

-- ─── RESEÑAS ────────────────────────────────────────────────

INSERT INTO resenas (usuario_id, actividad_id, puntuacion, comentario) VALUES
  ('user_participante_1', 'a0000000-0000-0000-0000-000000000001', 5, 'Increíble experiencia, muy recomendable. Sofía es una genia.'),
  ('user_participante_3', 'a0000000-0000-0000-0000-000000000005', 4, 'Las empanadas estaban deliciosas. Aprendí un montón.');

-- ─── FUNCIONES ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION incrementar_usos_cupon(p_codigo TEXT)
RETURNS void AS $$
BEGIN
  UPDATE cupones
  SET usos_actuales = usos_actuales + 1
  WHERE codigo = p_codigo
    AND usos_actuales < usos_maximos;
END;
$$ LANGUAGE plpgsql;