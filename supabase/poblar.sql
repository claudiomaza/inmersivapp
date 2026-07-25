-- ============================================================
-- INMERSIVAPP — Poblar base de datos
-- Sello: cm2labs · 2026-07-25
-- 32 actividades (17 categorías) · 2+ reseñas c/u · Cupones AnfitriónN
-- IDEMPOTENTE (ON CONFLICT)
-- ============================================================
-- EJECUTAR DESPUÉS de reset_completo.sql (esquema)
-- ============================================================

BEGIN;

-- ════════════════════════════════════════════════════════════
-- 1. PERFILES — 12 usuarios
-- ════════════════════════════════════════════════════════════

INSERT INTO perfiles (id, email, nombre, apellido, username, telefono, avatar_url, intereses, rol, roles) VALUES
  ('user_anfitrion_1', 'maria@inmersivapp.com', 'María', 'García', 'maria_garcia', NULL, NULL, '{Arte,Cocina,Inmersión}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_2', 'carlos@inmersivapp.com', 'Carlos', 'López', 'carlos_lopez', NULL, NULL, '{Naturaleza,Aventura,Deportes}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_3', 'lucia.fernandez@inmersivapp.com', 'Lucía', 'Fernández', 'lucia_fdez', '+5492615001003', NULL, '{Gastronomía,Cultura}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_4', 'andres.perez@inmersivapp.com', 'Andrés', 'Pérez', 'andres_perez', '+5492615001004', NULL, '{Fotografía,Tecnología}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_5', 'carolina.diaz@inmersivapp.com', 'Carolina', 'Díaz', 'caro_diaz', '+5492615001005', NULL, '{Bienestar,Inmersión}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_6', 'martin.lopez@inmersivapp.com', 'Martín', 'López', 'martin_lopez', '+5492615001006', NULL, '{Música,Arte,Cultura}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_7', 'valentina.rojas@inmersivapp.com', 'Valentina', 'Rojas', 'vale_rojas', '+5492615001007', NULL, '{Cultura,Arte}', 'anfitrion', '{anfitrion}'),
  ('user_anfitrion_8', 'fernando.quiroga@inmersivapp.com', 'Fernando', 'Quiroga', 'fer_quiroga', '+5492615001008', NULL, '{Tecnología,Deportes,Aventura}', 'anfitrion', '{anfitrion}'),
  ('user_participante_1', 'laura@inmersivapp.com', 'Laura', 'Martínez', 'lau_martinez', NULL, NULL, '{Arte,Cocina,Naturaleza}', 'participante', '{participante}'),
  ('user_participante_2', 'pedro@inmersivapp.com', 'Pedro', 'Ramírez', 'pedro_ramirez', NULL, NULL, '{Deportes,Aventura,Tecnología}', 'participante', '{participante}'),
  ('user_participante_3', 'florencia.molina@email.com', 'Florencia', 'Molina', 'flor_molina', NULL, NULL, '{Música,Fotografía,Bienestar}', 'participante', '{participante}'),
  ('user_participante_4', 'nicolas.contreras@email.com', 'Nicolás', 'Contreras', 'nico_contreras', NULL, NULL, '{Gastronomía,Cultura,Inmersión}', 'participante', '{participante}')
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 2. ACTIVIDADES — 32 experiencias
--    Categorías: Arte, Aventura, Bienestar, Cocina, Cultura, Deportes, Educación, Fotografía, Gastronomía, Inmersión, Manualidades, Meditación, Música, Naturaleza, Teatro, Tecnología, Yoga
-- ════════════════════════════════════════════════════════════

INSERT INTO actividades (id, anfitrion_id, titulo, descripcion, categoria, fecha, hora, lugar, precio, capacidad_max, imagen_url) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'user_anfitrion_1', 'Taller de Cerámica', 'La cerámica artesanal es una de las expresiones más antiguas de la cultura mendocina, y en este taller vas a conectar con esa tradición de una manera completamente práctica.Modelado, torno y esmaltado en una experiencia de 3 horas. Incluye todos los materiales, cocción de tu pieza y un vino de la región para cerrar la jornada. Te llevás tu creación lista en 15 días.', 'Arte', '2026-08-15', '10:00', 'Chacras de Coria', 2500, 12, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'),
  ('a0000000-0000-0000-0000-000000000002', 'user_anfitrion_1', 'Clase de Cocina Vegana', 'La cocina basada en plantas dejó de ser una tendencia para convertirse en un estilo de vida. En esta clase vas a descubrir que lo vegano puede ser tan sabroso como cualquier plato tradicional.Platos saludables sin ingredientes de origen animal, del huerto a la mesa. Cocinamos desde cero: entrada, plato principal y postre, con ingredientes de la huerta orgánica de la casa. Incluye recetario digital.', 'Cocina', '2026-08-20', '11:00', 'Ciudad de Mendoza', 3500, 10, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'),
  ('a0000000-0000-0000-0000-000000000028', 'user_anfitrion_1', 'Pastas Caseras con la Nonna', 'Nada como una mesa bien puesta con pasta hecha a mano para sentirte en casa. Te enseñamos los secretos que pasan de generación en generación en las familias mendocinas.Aprendé a hacer pasta fresca desde cero: amasado, estirado, cortado y salsas tradicionales. Al final, te sentás a comer lo que hiciste maridado con un vino Malbec de la casa.', 'Cocina', '2026-09-10', '11:00', 'Godoy Cruz', 4000, 8, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800'),
  ('a0000000-0000-0000-0000-000000000011', 'user_anfitrion_1', 'Mendoza 1861: Teatro Inmersivo en la Plaza', 'El terremoto de 1861 cambió para siempre la historia de Mendoza. Ahora podés revivirlo como si estuvieras ahí, en el mismo lugar donde ocurrió.Teatro inmersivo en la Plaza Independencia. Cada participante tiene un personaje histórico real con vestuario de época. La experiencia arranca con una introducción en la Catedral San Francisco y termina con una copa en la terraza del Museo de la Ciudad.', 'Inmersión', '2026-08-29', '16:00', 'Plaza Independencia, Ciudad', 7500, 12, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'),
  ('a0000000-0000-0000-0000-000000000003', 'user_anfitrion_2', 'Excursión a Sierra Chica', 'El Valle de Uco es uno de los paisajes más imponentes de la provincia, y Sierra Chica es su mirador privilegiado. Una caminata que combina naturaleza, silencio y vistas que cortan la respiración.Caminata guiada por senderos naturales con vista panorámica del Valle de Uco. 4 horas de trekking de dificultad media. Incluye transporte ida y vuelta desde Ciudad, botiquín, snack regional y fotos de la travesía.', 'Naturaleza', '2026-08-17', '08:00', 'Sierra Chica, Valle de Uco', 1500, 20, 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),
  ('a0000000-0000-0000-0000-000000000013', 'user_anfitrion_2', 'Expedición Nocturna en Potrerillos', 'Cuando cae el sol en la montaña, el paisaje cambia por completo. Los sonidos, los olores y el cielo estrellado crean una atmósfera que no se vive de día.Trekking nocturno con linternas frontales por los senderos de Potrerillos. Historias de montaña y fogón al final con chocolate caliente y tortas fritas. 3 horas de recorrido, dificultad baja-media.', 'Aventura', '2026-09-05', '19:00', 'Potrerillos, Luján de Cuyo', 8000, 15, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'),
  ('a0000000-0000-0000-0000-000000000022', 'user_anfitrion_2', 'Rafting en el Río Mendoza', 'El río Mendoza baja con fuerza desde la Cordillera, y sus rápidos son el escenario perfecto para una aventura que combina adrenalina y paisaje.Descenso en balsa por rápidos clase II y III. 2 horas de navegación, equipo de seguridad completo, instructores certificados y fotos de la experiencia. Incluye traslado desde Potrerillos y almuerzo al aire libre.', 'Aventura', '2026-09-19', '09:00', 'Potrerillos, Luján de Cuyo', 12000, 12, 'https://images.unsplash.com/photo-1508166466920-f65aa51f727c?w=800'),
  ('a0000000-0000-0000-0000-000000000015', 'user_anfitrion_2', 'La Carrera del Pedemonte', 'El pedemonte mendocino tiene una geografía única que lo convierte en un circuito natural para el running de montaña. Cada kilómetro regala una vista distinta de la ciudad y la Cordillera.Trail running de 10K por el pedemonte mendocino. Categorías competitiva y recreativa. Incluye hidratación, medalla para todos los que completan el circuito y sorteo de premios.', 'Deportes', '2026-09-12', '07:00', 'Pedemonte, Ciudad', 10000, 50, 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'),
  ('a0000000-0000-0000-0000-000000000023', 'user_anfitrion_2', 'Clase de Yoga al Aire Libre en el Parque', 'El Parque General San Martín amanece con una energía especial. Practicar yoga al aire libre rodeado de árboles centenarios y con la Cordillera de fondo es una experiencia que no tiene comparación.Yoga vinyasa nivel inicial a intermedio en el Rosedal del Parque. 90 minutos de práctica guiada, incluye esterilla y mate de bienvenida. Abierto a todos los niveles, llevá ropa cómoda.', 'Deportes', '2026-09-26', '08:00', 'Parque Gral. San Martín', 2000, 20, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
  ('a0000000-0000-0000-0000-000000000005', 'user_anfitrion_3', 'Almuerzo en Casa de los Fernández', 'La cocina mendocina es mucho más que empanadas y asado: es historia, familia y un ritual que se comparte alrededor de la mesa. En Godoy Cruz, la familia Fernández abre las puertas de su casa centenaria para compartirlo con vos.Tradición familiar mendocina: asado, empanadas y vino en una casa centenaria de Godoy Cruz. Incluye entrada, plato principal, postre casero y degustación de 3 vinos de la bodega familiar. Duración 3 horas.', 'Gastronomía', '2026-08-23', '12:00', 'Godoy Cruz', 6500, 8, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'),
  ('a0000000-0000-0000-0000-000000000024', 'user_anfitrion_3', 'Cata de Vinos en la Bodega Secreta', 'No todas las bodegas mendocinas están abiertas al público. Algunas guardan sus mejores etiquetas para encuentros íntimos donde el vino se explica con pasión y sin apuro.Bodega boutique oculta en los viñedos de Luján de Cuyo. Cata guiada de 6 etiquetas, incluye un blend de autor exclusivo. Tabla de quesos y fiambres regionales de por medio. Cupo limitado a 8 personas.', 'Gastronomía', '2026-09-18', '18:00', 'Luján de Cuyo', 8500, 8, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'),
  ('a0000000-0000-0000-0000-000000000016', 'user_anfitrion_3', 'Un Día en la Bodega: Vigneron por Jornada', 'Ser vigneron por un día es la mejor manera de entender por qué Mendoza produce algunos de los mejores vinos del mundo. La tierra, el clima y el trabajo manual se combinan en una experiencia única.Viví un día completo como vigneron: poda, cosecha, pisada de uvas y cata final con el enólogo. Incluye almuerzo en la bodega con maridaje de 4 vinos y delantal de regalo.', 'Cultura', '2026-09-15', '09:00', 'Bodega La Rural, Maipú', 12000, 10, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'),
  ('a0000000-0000-0000-0000-000000000017', 'user_anfitrion_3', 'Cosecha de Olivos con la Familia Quiroga', 'La tradición olivícola de Mendoza tiene raíces profundas en Lavalle, donde la tierra árida y el sol intenso producen aceites de oliva de calidad excepcional.Cosechá aceitunas a mano, visitá la almazara y probá aceite de oliva recién molido con pan casero. Te llevás una botella de aceite de cosecha propia. Actividad apta para toda la familia.', 'Cultura', '2026-09-20', '10:00', 'Lavalle', 6000, 15, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800'),
  ('a0000000-0000-0000-0000-000000000008', 'user_anfitrion_4', 'Misión Fotográfica: Documentá Potrerillos', 'Potrerillos es uno de los paisajes más fotogénicos de Mendoza, pero capturarlo bien requiere ojo, técnica y conocer los mejores ángulos. Esta salida es tanto una caminata como un taller de fotografía de naturaleza.Caminata + taller de fotografía de naturaleza. Documentá la biodiversidad del embalse con tu celular o cámara. Incluye guía fotógrafo profesional, café de bienvenida y edición colaborativa de las mejores tomas al final.', 'Fotografía', '2026-08-27', '07:00', 'Potrerillos, Luján de Cuyo', 8000, 10, 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'),
  ('a0000000-0000-0000-0000-000000000018', 'user_anfitrion_4', 'Mendoza en 24 Fotos: Competencia por Equipos', 'La fotografía urbana es un deporte de observación. En equipos, compitiendo contra el reloj, descubrir Mendoza a través del lente es una forma completamente distinta de recorrer la ciudad.Competencia de fotografía urbana por equipos. 24 desafíos, 4 horas, 1 ganador. Incluye kit de participante, mapa de locaciones y exposición de las fotos ganadoras en el Museo Municipal de Arte.', 'Fotografía', '2026-09-22', '14:00', 'Centro de Mendoza', 5000, 20, 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800'),
  ('a0000000-0000-0000-0000-000000000019', 'user_anfitrion_4', 'El Estudio Viviente', 'La fotografía de estudio es un arte en sí misma: luz, composición, dirección. Este taller combina la teoría con la práctica en vivo, con modelos y un loft preparado para crear.Sesión de fotos con modelos en vivo en un loft-industrial. Aprendé iluminación, composición y dirección de arte. Incluye coffee break y las mejores fotos editadas para tu portfolio.', 'Arte', '2026-09-25', '16:00', 'Godoy Cruz', 6000, 8, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'),
  ('a0000000-0000-0000-0000-000000000009', 'user_anfitrion_5', 'El Cuerpo Habla: Teatro Sensorial en el Rosedal', 'Comunicarse sin palabras es un desafío que despierta sentidos que creíamos olvidados. En el Rosedal del Parque General San Martín, el cuerpo se convierte en el único vehículo de expresión.Teatro ciego: comunicate sin palabras a través del movimiento, el tacto y el sonido en el Rosedal del Parque General San Martín. 2 horas de exploración sensorial guiada. Incluye cierre con meditación grupal.', 'Bienestar', '2026-08-28', '15:00', 'Parque Gral. San Martín', 2500, 10, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'),
  ('a0000000-0000-0000-0000-000000000010', 'user_anfitrion_5', 'Baño de Sonido al Pie del Dique', 'Los cuencos tibetanos y los gongs tienen frecuencias que resuenan con el cuerpo de una manera que las palabras no pueden explicar. Al pie del Dique Cipolletti, con la Cordillera iluminándose con el atardecer, la experiencia es simplemente mágica.Cuencos tibetanos, gongs y didgeridoo al atardecer. Meditación guiada con vista al dique Cipolletti. 90 minutos de inmersión sonora. Incluye mantita, almohadón y té de hierbas al cierre.', 'Bienestar', '2026-08-31', '17:00', 'Dique Cipolletti, Luján de Cuyo', 5000, 15, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'),
  ('a0000000-0000-0000-0000-000000000020', 'user_anfitrion_5', 'Retiro de Reconexión en Cacheuta', 'Cacheuta es un oasis de tranquilidad a media hora de la ciudad. El sonido del río y el aire puro de la montaña crean el ambiente ideal para una jornada de reconexión profunda.Día completo de reconexión: yoga, meditación guiada, baño de sonido, comida consciente y senderismo. Incluye almuerzo orgánico, traslado desde Ciudad y cuaderno de bitácora personal.', 'Bienestar', '2026-09-28', '08:00', 'Cacheuta, Luján de Cuyo', 35000, 8, 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800'),
  ('a0000000-0000-0000-0000-000000000029', 'user_anfitrion_5', 'Realidad Virtual en las Bodegas', 'Las bodegas de Mendoza cuentan historias centenarias, pero ¿y si pudieras verlas desde adentro sin moverte del lugar? La realidad virtual te transporta a viñedos históricos, procesos de fermentación y catas a 360 grados.Experiencia de realidad virtual 360° en la Bodega Catena Zapata. Recorré los viñedos históricos, el proceso de fermentación y una cata virtual desde adentro de la barrica. 45 minutos. Incluye copa de vino real al finalizar.', 'Inmersión', '2026-10-11', '16:00', 'Bodega Catena Zapata, Luján de Cuyo', 8500, 6, 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=800'),
  ('a0000000-0000-0000-0000-000000000004', 'user_anfitrion_6', 'Círculo de Tambores en el Centro', 'La percusión en círculo es una de las experiencias musicales más primitivas y poderosas. No hace falta saber música, solo dejarse llevar por el ritmo colectivo.Tambores africanos, percusión corporal y ritmos latinos en una jam session abierta a todo nivel. Instrumentos incluidos. 2 horas de música en vivo en Plaza España. Cierre con improvisación grupal.', 'Música', '2026-08-24', '18:00', 'Plaza España, Ciudad', 3500, 20, 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800'),
  ('a0000000-0000-0000-0000-000000000021', 'user_anfitrion_6', 'Cantata al Atardecer en los Viñedos', 'Cantar al aire libre entre viñedos, cuando el sol tiñe la Cordillera de naranja y rojo, es una experiencia que conecta con lo más profundo. No importa si cantás bien o mal: importa que te sumes.Coro abierto + orquesta de cámara al aire libre entre viñedos de Maipú. No hace falta saber cantar, solo tener ganas. Incluye partitura, vino de honor al finalizar y atardecer sobre la Cordillera.', 'Música', '2026-10-03', '18:00', 'Maipú', 7500, 30, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800'),
  ('a0000000-0000-0000-0000-000000000006', 'user_anfitrion_7', 'Tejedora por un Día', 'El tejido andino es una tradición milenaria que las comunidades originarias de Mendoza mantienen viva. Cada diseño cuenta una historia, cada color tiene un significado.Aprendé telar mapuche y tejido andino con artesanas de la comunidad Huarpe de Lavalle. Te llevás tu tejido puesto. Incluye materiales, mateada durante la actividad y certificado de participación.', 'Cultura', '2026-08-26', '10:00', 'Lavalle', 6000, 8, 'https://images.unsplash.com/photo-1715374033196-0ff662284a7e?w=800'),
  ('a0000000-0000-0000-0000-000000000025', 'user_anfitrion_7', 'Pintura al Óleo en el Cerro de la Gloria', 'El Cerro de la Gloria no solo tiene una vista panorámica de la ciudad, sino que su luz particular ha inspirado a pintores mendocinos durante décadas. Es el lugar perfecto para aprender pintura al aire libre.Taller de pintura al óleo al aire libre con vista a la ciudad. Caballetes, pinceles y óleos incluidos. 3 horas de clase guiada por un artista plástico local. Te llevás tu obra enmarcada.', 'Arte', '2026-10-10', '15:00', 'Cerro de la Gloria, Ciudad', 4500, 10, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'),
  ('a0000000-0000-0000-0000-000000000007', 'user_anfitrion_8', 'Escape Room Digital: El Misterio del Código Perdido', 'La tecnología y el misterio se combinan en un escape room que usa realidad aumentada para transformar el centro de Mendoza en un tablero de juego gigante.Escape room con realidad aumentada en el centro de Mendoza. Descifrá códigos, encontrá pistas virtuales y resolvé el misterio en 60 minutos. Incluye dispositivo móvil con RA, asistencia remota y cerveza artesanal de regalo al resolverlo.', 'Tecnología', '2026-08-30', '15:00', 'Centro de Mendoza', 5000, 6, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'),
  ('a0000000-0000-0000-0000-000000000026', 'user_anfitrion_8', 'Hackatón Creativa: Idea tu App en 4 Horas', 'Mendoza tiene un ecosistema tecnológico en pleno crecimiento. Esta hackatón te desafía a pasar de una idea a un prototipo funcional en solo 4 horas, trabajando en equipo.Hackatón de desarrollo de apps. Equipos de 3-4 personas, mentores técnicos, pizza y bebida incluida. Al final cada equipo presenta su prototipo y el ganador recibe una mentoría personalizada.', 'Tecnología', '2026-10-17', '09:00', 'Godoy Cruz', 3000, 24, 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800'),
  ('a0000000-0000-0000-0000-000000000027', 'user_anfitrion_8', 'Cicloturismo por los Caminos del Vino', 'Recorrer los viñedos en bicicleta es la forma mas linda de conocer la region vitivinicola de Mendoza. El viento, el sol y el paisaje se viven de una manera distinta sobre dos ruedas. Recorrido en bicicleta por bodegas de Maipu. 25 km de senderos entre viñedos, paradas en 3 bodegas con degustacion. Incluye bicicleta, casco, hidratacion y almuerzo en la ultima bodega.', 'Naturaleza', '2026-10-24', '08:00', 'Maipu', 9000, 15, 'https://images.unsplash.com/photo-1600672220770-3ece499a3852?w=800'),
  ('a0000000-0000-0000-0000-000000000030', 'user_anfitrion_7', 'Taller de Manualidades: Joyeria en Plata', 'Crea tu propia joya en plata con tecnicas ancestrales de orfebreria. Desde el diseno hasta el pulido final, todo el proceso en tus manos. Incluye materiales, herramientas y un certificado de tu pieza unica.', 'Manualidades', '2026-10-08', '15:00', 'Godoy Cruz', 5500, 8, 'https://images.unsplash.com/photo-1715374033196-0ff662284a7e?w=800'),
  ('a0000000-0000-0000-0000-000000000031', 'user_anfitrion_7', 'Yoga para Principiantes en el Parque', 'Yoga suave al aire libre en el Parque Central. Ideal para quienes nunca hicieron yoga o quieren retomar la practica. Posturas basicas, respiracion consciente y relajacion guiada con el sonido de los pajaros.', 'Yoga', '2026-10-15', '09:00', 'Parque Central, Ciudad', 2000, 15, 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800'),
  ('a0000000-0000-0000-0000-000000000032', 'user_anfitrion_5', 'Meditacion Guiada en el Dique', 'Una jornada de meditacion guiada al borde del dique, combinando tecnicas de mindfulness, respiracion y visualizacion. El sonido del agua y la brisa de la montana acompanan la practica.', 'Meditación', '2026-10-22', '10:00', 'Dique Cipolletti, Luján de Cuyo', 3000, 20, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'),
  ('a0000000-0000-0000-0000-000000000033', 'user_anfitrion_1', 'Teatro de Improvisacion en el Solar', 'El teatro de improvisacion no tiene guion, solo reglas y mucha creatividad. En esta experiencia vas a descubrir que todos podemos actuar cuando soltamos el miedo al ridiculo.', 'Teatro', '2026-10-30', '19:00', 'Solar de la Plaza, Ciudad', 4000, 12, 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800'),
  ('a0000000-0000-0000-0000-000000000034', 'user_anfitrion_4', 'Educacion Financiera para Creativos', 'Taller practico de finanzas personales pensado para artistas, emprendedores y trabajadores independientes. Presupuesto, ahorro, inversion simple y herramientas digitales para ordenar tus cuentas.', 'Educación', '2026-11-05', '10:00', 'Ciudad de Mendoza', 3500, 20, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800')
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

INSERT INTO reservas (id, usuario_id, actividad_id, fecha, cupon_codigo, cantidad, estado, codigo_confirmacion) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user_participante_1', 'a0000000-0000-0000-0000-000000000001', '2026-08-15', 'Maria1', 2, 'confirmada', 'CONF-A001'),
  ('00000000-0000-0000-0000-000000000002', 'user_participante_2', 'a0000000-0000-0000-0000-000000000003', '2026-08-17', NULL, 1, 'pendiente', NULL),
  ('00000000-0000-0000-0000-000000000003', 'user_participante_1', 'a0000000-0000-0000-0000-000000000011', '2026-08-29', 'Maria2', 3, 'confirmada', 'CONF-A011'),
  ('00000000-0000-0000-0000-000000000004', 'user_participante_3', 'a0000000-0000-0000-0000-000000000005', '2026-08-23', NULL, 2, 'confirmada', 'CONF-A005'),
  ('00000000-0000-0000-0000-000000000005', 'user_participante_4', 'a0000000-0000-0000-0000-000000000009', '2026-08-28', 'Carolina1', 1, 'pendiente', NULL)
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 6. RESEÑAS — 79 reseñas (mínimo 2 por actividad)
-- ════════════════════════════════════════════════════════════

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