-- ============================================================
-- INMERSIVAPP — Poblar base de datos
-- Sello: cm2labs · 2026-07-25
-- 21 actividades (12 categorías) · 2+ reseñas c/u · Cupones AnfitriónN
-- IDEMPOTENTE (ON CONFLICT)
-- ============================================================
-- EJECUTAR DESPUÉS de reset_completo.sql (esquema)
-- ============================================================

BEGIN;

-- ════════════════════════════════════════════════════════════
-- 1. PERFILES — 12 usuarios
-- ════════════════════════════════════════════════════════════

INSERT INTO perfiles (id, email, nombre, telefono, avatar_url, rol) VALUES
  ('user_anfitrion_1', 'maria@inmersivapp.com', 'María García', NULL, NULL, 'anfitrion'),
  ('user_anfitrion_2', 'carlos@inmersivapp.com', 'Carlos López', NULL, NULL, 'anfitrion'),
  ('user_anfitrion_3', 'lucia.fernandez@inmersivapp.com', 'Lucía Fernández', '+5492615001003', NULL, 'anfitrion'),
  ('user_anfitrion_4', 'andres.perez@inmersivapp.com', 'Andrés Pérez', '+5492615001004', NULL, 'anfitrion'),
  ('user_anfitrion_5', 'carolina.diaz@inmersivapp.com', 'Carolina Díaz', '+5492615001005', NULL, 'anfitrion'),
  ('user_anfitrion_6', 'martin.lopez@inmersivapp.com', 'Martín López', '+5492615001006', NULL, 'anfitrion'),
  ('user_anfitrion_7', 'valentina.rojas@inmersivapp.com', 'Valentina Rojas', '+5492615001007', NULL, 'anfitrion'),
  ('user_anfitrion_8', 'fernando.quiroga@inmersivapp.com', 'Fernando Quiroga', '+5492615001008', NULL, 'anfitrion'),
  ('user_participante_1', 'laura@inmersivapp.com', 'Laura Martínez', NULL, NULL, 'participante'),
  ('user_participante_2', 'pedro@inmersivapp.com', 'Pedro Ramírez', NULL, NULL, 'participante'),
  ('user_participante_3', 'florencia.molina@email.com', 'Florencia Molina', NULL, NULL, 'participante'),
  ('user_participante_4', 'nicolas.contreras@email.com', 'Nicolás Contreras', NULL, NULL, 'participante')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 2. ACTIVIDADES — 19 experiencias
--    Categorías: Arte, Aventura, Bienestar, Cocina, Cultura, Deportes, Fotografía, Gastronomía, Inmersión, Música, Naturaleza, Tecnología
-- ════════════════════════════════════════════════════════════

INSERT INTO actividades (id, anfitrion_id, titulo, descripcion, categoria, fecha, hora, lugar, precio, capacidad_max, imagen_url) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 'Taller de Cerámica', 'Aprendé a hacer tu propia vajilla con técnicas artesanales. Modelado, torno y esmaltado en una experiencia de 3 horas.', 'Arte', '2026-08-15', '10:00', 'Chacras de Coria', 2500, 12, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'),
  ('a0000000-0000-0000-0000-000000000002', 'user_anfitrion_1', 'Clase de Cocina Vegana', 'Platos saludables sin ingredientes de origen animal. Del huerto a la mesa.', 'Cocina', '2026-08-20', '11:00', 'Ciudad de Mendoza', 3500, 10, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'),
  ('a0000000-0000-0000-0000-000000000011', 'user_anfitrion_1', 'Mendoza 1861: Teatro Inmersivo en la Plaza', 'Reviví el terremoto de 1861 en la Plaza Independencia. Cada participante tiene un personaje histórico real con vestuario de época.', 'Inmersión', '2026-08-29', '16:00', 'Plaza Independencia, Ciudad', 7500, 12, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'),
  ('a0000000-0000-0000-0000-000000000003', 'user_anfitrion_2', 'Excursión a Sierra Chica', 'Caminata guiada por senderos naturales con vista panorámica del Valle de Uco.', 'Naturaleza', '2026-08-17', '08:00', 'Sierra Chica, Valle de Uco', 1500, 20, 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),
  ('a0000000-0000-0000-0000-000000000013', 'user_anfitrion_2', 'Expedición Nocturna en Potrerillos', 'Trekking nocturno con linternas frontales por los senderos de Potrerillos. Historias de montaña y fogón al final.', 'Aventura', '2026-09-05', '19:00', 'Potrerillos, Luján de Cuyo', 8000, 15, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'),
  ('a0000000-0000-0000-0000-000000000015', 'user_anfitrion_2', 'La Carrera del Pedemonte', 'Trail running de 10K por el pedemonte mendocino. Categorías competitiva y recreativa. Incluye hidratación y medalla.', 'Deportes', '2026-09-12', '07:00', 'Pedemonte, Ciudad', 10000, 50, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'),
  ('a0000000-0000-0000-0000-000000000005', 'user_anfitrion_3', 'Almuerzo en Casa de los Fernández', 'Tradición familiar mendocina: asado, empanadas y vino en una casa centenaria de Godoy Cruz.', 'Gastronomía', '2026-08-23', '12:00', 'Godoy Cruz', 6500, 8, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'),
  ('a0000000-0000-0000-0000-000000000016', 'user_anfitrion_3', 'Un Día en la Bodega: Vigneron por Jornada', 'Viví un día completo como vigneron: poda, cosecha, pisada de uvas y cata final con el enólogo.', 'Cultura', '2026-09-15', '09:00', 'Bodega La Rural, Maipú', 12000, 10, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'),
  ('a0000000-0000-0000-0000-000000000017', 'user_anfitrion_3', 'Cosecha de Olivos con la Familia Quiroga', 'Cosechá aceitunas a mano, visitá la almazara y probá aceite de oliva recién molido con pan casero.', 'Cultura', '2026-09-20', '10:00', 'Lavalle', 6000, 15, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800'),
  ('a0000000-0000-0000-0000-000000000008', 'user_anfitrion_4', 'Misión Fotográfica: Documentá Potrerillos', 'Caminata + taller de fotografía de naturaleza. Documentá la biodiversidad del embalse con tu celular o cámara.', 'Fotografía', '2026-08-27', '07:00', 'Potrerillos, Luján de Cuyo', 8000, 10, 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'),
  ('a0000000-0000-0000-0000-000000000018', 'user_anfitrion_4', 'Mendoza en 24 Fotos: Competencia por Equipos', 'Competencia de fotografía urbana por equipos. 24 desafíos, 4 horas, 1 ganador.', 'Fotografía', '2026-09-22', '14:00', 'Centro de Mendoza', 5000, 20, 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800'),
  ('a0000000-0000-0000-0000-000000000019', 'user_anfitrion_4', 'El Estudio Viviente', 'Sesión de fotos con modelos en vivo en un loft-industrial. Aprendé iluminación, composición y dirección de arte.', 'Arte', '2026-09-25', '16:00', 'Godoy Cruz', 6000, 8, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'),
  ('a0000000-0000-0000-0000-000000000009', 'user_anfitrion_5', 'El Cuerpo Habla: Teatro Sensorial en el Rosedal', 'Teatro ciego: comunicate sin palabras a través del movimiento, el tacto y el sonido en el Rosedal del Parque General San Martín.', 'Bienestar', '2026-08-28', '15:00', 'Parque Gral. San Martín', 2500, 10, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
  ('a0000000-0000-0000-0000-000000000010', 'user_anfitrion_5', 'Baño de Sonido al Pie del Dique', 'Cuencos tibetanos, gongs y didgeridoo al atardecer. Meditación guiada con vista al dique Cipolletti.', 'Bienestar', '2026-08-31', '17:00', 'Dique Cipolletti, Luján de Cuyo', 5000, 15, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'),
  ('a0000000-0000-0000-0000-000000000020', 'user_anfitrion_5', 'Retiro de Reconexión en Cacheuta', 'Día completo de reconexión: yoga, meditación guiada, baño de sonido, comida consciente y senderismo. Incluye almuerzo orgánico.', 'Bienestar', '2026-09-28', '08:00', 'Cacheuta, Luján de Cuyo', 35000, 8, 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800'),
  ('a0000000-0000-0000-0000-000000000004', 'user_anfitrion_6', 'Círculo de Tambores en el Centro', 'Tambores africanos, percusión corporal y ritmos latinos en una jam session abierta a todo nivel.', 'Música', '2026-08-24', '18:00', 'Plaza España, Ciudad', 3500, 20, 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800'),
  ('a0000000-0000-0000-0000-000000000021', 'user_anfitrion_6', 'Cantata al Atardecer en los Viñedos', 'Coro abierto + orquesta de cámara al aire libre entre viñedos. No hace falta saber cantar, solo tener ganas.', 'Música', '2026-10-03', '18:00', 'Maipú', 7500, 30, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800'),
  ('a0000000-0000-0000-0000-000000000006', 'user_anfitrion_7', 'Tejedora por un Día', 'Aprendé telar mapuche y tejido andino con artesanas de la comunidad Huarpe. Te llevás tu tejido puesto.', 'Cultura', '2026-08-26', '10:00', 'Lavalle', 6000, 8, 'https://images.unsplash.com/photo-1591123120776-7dfb24f3a2ab?w=800'),
  ('a0000000-0000-0000-0000-000000000007', 'user_anfitrion_8', 'Escape Room Digital: El Misterio del Código Perdido', 'Escape room con realidad aumentada en el centro de Mendoza. Descifrá códigos, encontrá pistas virtuales y resolvé el misterio.', 'Tecnología', '2026-08-30', '15:00', 'Centro de Mendoza', 5000, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 3. COMERCIOS — 8 sponsors
-- ════════════════════════════════════════════════════════════

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

-- ════════════════════════════════════════════════════════════
-- 4. CUPONES — 16 códigos (formato: AnfitriónN)
-- ════════════════════════════════════════════════════════════

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

-- ════════════════════════════════════════════════════════════
-- 5. RESERVAS — 5 reservas
-- ════════════════════════════════════════════════════════════

INSERT INTO reservas (id, usuario_id, actividad_id, cupon_codigo, cantidad, estado) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_participante_1', 'a0000000-0000-0000-0000-000000000001', 'Maria1', 2, 'confirmada'),
  ('00000000-0000-0000-0000-000000000002', 'user_participante_2', 'a0000000-0000-0000-0000-000000000003', NULL, 1, 'pendiente'),
  ('00000000-0000-0000-0000-000000000003', 'user_participante_1', 'a0000000-0000-0000-0000-000000000011', 'Maria2', 3, 'confirmada'),
  ('00000000-0000-0000-0000-000000000004', 'user_participante_3', 'a0000000-0000-0000-0000-000000000005', NULL, 2, 'confirmada'),
  ('00000000-0000-0000-0000-000000000005', 'user_participante_4', 'a0000000-0000-0000-0000-000000000009', 'Carolina1', 1, 'pendiente')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 6. RESEÑAS — 47 reseñas (mínimo 2 por actividad)
-- ════════════════════════════════════════════════════════════

INSERT INTO resenas (id, usuario_id, actividad_id, puntuacion, comentario) VALUES
  ('r00000001-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000001', 5, 'Aprendí muchísimo y pasé un rato hermoso. Gracias!'),
  ('r00000002-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000001', 4, 'Muy lindo lugar y buena organización. Repetiría'),
  ('r00000003-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000002', 5, 'Superó todas mis expectativas. Volvería sin dudarlo'),
  ('r00000004-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000002', 4, 'El anfitrión fue excelente, muy atento y profesional'),
  ('r00000005-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000011', 4, 'Muy buena organización desde el principio hasta el final'),
  ('r00000006-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000011', 4, 'Muy buena organización desde el principio hasta el final'),
  ('r00000007-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000003', 4, 'La actividad es tal cual la describen. Muy recomendable'),
  ('r00000008-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000003', 5, 'El anfitrión tiene una energía increíble. Hizo la experiencia'),
  ('r00000009-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000003', 5, 'Muy lindo lugar y buena organización. Repetiría'),
  ('r00000010-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000013', 4, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('r00000011-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000013', 4, 'Me fui con ganas de más. Ojalá haya pronto otra fecha'),
  ('r00000012-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000015', 4, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('r00000013-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000015', 4, 'Muy buena organización desde el principio hasta el final'),
  ('r00000014-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000015', 5, 'La comunicación previa fue clara y todo salió según lo planeado'),
  ('r00000015-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000005', 4, 'Aprendí muchísimo y pasé un rato hermoso. Gracias!'),
  ('r00000016-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000005', 5, 'El anfitrión fue excelente, muy atento y profesional'),
  ('r00000017-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000005', 4, 'Una experiencia transformadora. Me llevé mucho más de lo que esperaba'),
  ('r00000018-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000016', 4, 'Me fui con ganas de más. Ojalá haya pronto otra fecha'),
  ('r00000019-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000016', 5, 'Me encantó la dinámica, el grupo y el entorno. 10/10'),
  ('r00000020-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000016', 5, 'El anfitrión fue excelente, muy atento y profesional'),
  ('r00000021-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000017', 5, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('r00000022-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000017', 5, 'Muy buena organización desde el principio hasta el final'),
  ('r00000023-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000008', 4, 'Superó todas mis expectativas. Volvería sin dudarlo'),
  ('r00000024-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000008', 5, 'Recomiendo llevar ropa cómoda porque te movés bastante'),
  ('r00000025-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000018', 4, 'Un plan diferente para hacer en Mendoza. Me encantó'),
  ('r00000026-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000018', 5, 'Actividad familiar, divertida y educativa a la vez'),
  ('r00000027-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000018', 4, 'Excelente relación calidad-precio. Super recomendable'),
  ('r00000028-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000019', 5, 'Nunca había hecho algo así. Me abrió la cabeza'),
  ('r00000029-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000019', 5, 'Nunca había hecho algo así. Me abrió la cabeza'),
  ('r00000030-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000009', 5, 'El anfitrión fue excelente, muy atento y profesional'),
  ('r00000031-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000009', 4, 'Una experiencia transformadora. Me llevé mucho más de lo que esperaba'),
  ('r00000032-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000009', 4, 'La actividad es tal cual la describen. Muy recomendable'),
  ('r00000033-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000010', 5, 'El paisaje es espectacular. Las fotos no le hacen justicia'),
  ('r00000034-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000010', 5, 'Muy buena organización desde el principio hasta el final'),
  ('r00000035-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000010', 4, 'Una experiencia transformadora. Me llevé mucho más de lo que esperaba'),
  ('r00000036-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000020', 5, 'La actividad es tal cual la describen. Muy recomendable'),
  ('r00000037-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000020', 5, 'Increíble experiencia, muy recomendable'),
  ('r00000038-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000020', 5, 'El paisaje es espectacular. Las fotos no le hacen justicia'),
  ('r00000039-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000004', 5, 'El paisaje es espectacular. Las fotos no le hacen justicia'),
  ('r00000040-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000004', 4, 'Muy lindo lugar y buena organización. Repetiría'),
  ('r00000041-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000021', 5, 'Un plan diferente para hacer en Mendoza. Me encantó'),
  ('r00000042-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000021', 4, 'Una experiencia transformadora. Me llevé mucho más de lo que esperaba'),
  ('r00000043-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000021', 5, 'Una experiencia única en Mendoza. No se la pierdan'),
  ('r00000044-0000-0000-0000-000000000000', 'user_participante_1', 'a0000000-0000-0000-0000-000000000006', 4, 'El anfitrión fue excelente, muy atento y profesional'),
  ('r00000045-0000-0000-0000-000000000000', 'user_participante_4', 'a0000000-0000-0000-0000-000000000006', 5, 'El anfitrión fue excelente, muy atento y profesional'),
  ('r00000046-0000-0000-0000-000000000000', 'user_participante_2', 'a0000000-0000-0000-0000-000000000007', 5, 'Muy buena organización desde el principio hasta el final'),
  ('r00000047-0000-0000-0000-000000000000', 'user_participante_3', 'a0000000-0000-0000-0000-000000000007', 4, 'Excelente relación calidad-precio. Super recomendable')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 7. FUNCIÓN
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