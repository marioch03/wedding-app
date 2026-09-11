-- =============================================================================
-- seed_test_data.sql
-- Datos de prueba para validar el módulo de Eventos y Menús.
-- Requiere que la tabla wedding tenga al menos un registro.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- WEDDING (si no existe todavía)
-- -----------------------------------------------------------------------------
INSERT INTO wedding (id, partner1_name, partner2_name, wedding_date, content)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Mario',
  'Laura',
  '2026-06-21',
  '{}'
) ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- EVENTS
-- -----------------------------------------------------------------------------
INSERT INTO event (id, wedding_id, name, event_type, description, start_datetime, end_datetime,
                   venue_name, address, latitude, longitude, display_order, is_public)
VALUES
  (
    'e1111111-1111-4111-8111-111111111101',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Ceremonia Civil',
    'CEREMONY',
    'Enlace civil en el Ayuntamiento de la ciudad.',
    '2026-06-21 12:00:00+02',
    '2026-06-21 13:00:00+02',
    'Ayuntamiento',
    'Plaza Mayor, 1, Madrid',
    40.415363,
    -3.707398,
    1,
    true
  ),
  (
    'e2222222-2222-4222-8222-222222222202',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Cóctel de Bienvenida',
    'RECEPTION',
    'Aperitivo en los jardines de la finca.',
    '2026-06-21 14:00:00+02',
    '2026-06-21 16:00:00+02',
    'Finca El Robledal',
    'Carretera de Brunete, km 12, Madrid',
    40.371200,
    -3.894500,
    2,
    true
  ),
  (
    'e3333333-3333-4333-8333-333333333303',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Banquete',
    'RECEPTION',
    'Cena de gala en el salón principal.',
    '2026-06-21 16:30:00+02',
    '2026-06-21 23:00:00+02',
    'Finca El Robledal',
    'Carretera de Brunete, km 12, Madrid',
    40.371200,
    -3.894500,
    3,
    true
  ),
  (
    'e4444444-4444-4444-8444-444444444404',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Fiesta',
    'PARTY',
    'Música en vivo y baile hasta la madrugada.',
    '2026-06-21 23:00:00+02',
    NULL,
    'Finca El Robledal',
    'Carretera de Brunete, km 12, Madrid',
    40.371200,
    -3.894500,
    4,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- MENU OPTIONS (solo para el Banquete)
-- -----------------------------------------------------------------------------
INSERT INTO menu_option (id, event_id, name, description, diet_type, display_order)
VALUES
  (
    'a1111111-1111-4111-8111-111111111101',
    'e3333333-3333-4333-8333-333333333303',
    'Menú Estándar',
    'Entrante de jamón y queso, solomillo de ternera, tarta nupcial.',
    'STANDARD',
    1
  ),
  (
    'a2222222-2222-4222-8222-222222222202',
    'e3333333-3333-4333-8333-333333333303',
    'Menú Vegetariano',
    'Ensalada gourmet, risotto de setas, tarta de frutas.',
    'VEGETARIAN',
    2
  ),
  (
    'a3333333-3333-4333-8333-333333333303',
    'e3333333-3333-4333-8333-333333333303',
    'Menú Vegano',
    'Carpaccio de remolacha, curry de garbanzos, fruta de temporada.',
    'VEGAN',
    3
  ),
  (
    'a4444444-4444-4444-8444-444444444404',
    'e3333333-3333-4333-8333-333333333303',
    'Menú Infantil',
    'Macarrones, salchichas con patatas, helado.',
    'CHILD',
    4
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- PARTY
-- -----------------------------------------------------------------------------
INSERT INTO party (id, display_name, rsvp_token, language_preference, status)
VALUES
  (
    'bb111111-1111-4111-8111-111111111101',
    'Familia García',
    'tok-garcia-familia-2026',
    'es',
    'PENDING'
  ),
  (
    'bb222222-2222-4222-8222-222222222202',
    'Ana y Diego',
    'tok-ana-diego-2026',
    'es',
    'PENDING'
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- PARTY_EVENT
-- -----------------------------------------------------------------------------
-- Familia García: todos los eventos
INSERT INTO party_event (party_id, event_id)
VALUES
  ('bb111111-1111-4111-8111-111111111101', 'e1111111-1111-4111-8111-111111111101'),
  ('bb111111-1111-4111-8111-111111111101', 'e2222222-2222-4222-8222-222222222202'),
  ('bb111111-1111-4111-8111-111111111101', 'e3333333-3333-4333-8333-333333333303'),
  ('bb111111-1111-4111-8111-111111111101', 'e4444444-4444-4444-8444-444444444404')
ON CONFLICT DO NOTHING;

-- Ana y Diego: sin Ceremonia
INSERT INTO party_event (party_id, event_id)
VALUES
  ('bb222222-2222-4222-8222-222222222202', 'e2222222-2222-4222-8222-222222222202'),
  ('bb222222-2222-4222-8222-222222222202', 'e3333333-3333-4333-8333-333333333303'),
  ('bb222222-2222-4222-8222-222222222202', 'e4444444-4444-4444-8444-444444444404')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- GUESTS
-- -----------------------------------------------------------------------------
INSERT INTO guest (id, party_id, first_name, last_name, guest_type, is_plus_one)
VALUES
  -- Familia García
  ('cc111111-1111-4111-8111-111111111101', 'bb111111-1111-4111-8111-111111111101', 'Carlos', 'García',   'ADULT', false),
  ('cc222222-2222-4222-8222-222222222202', 'bb111111-1111-4111-8111-111111111101', 'Sofía',  'García',   'ADULT', false),
  ('cc333333-3333-4333-8333-333333333303', 'bb111111-1111-4111-8111-111111111101', 'Pablo',  'García',   'CHILD', false),
  -- Ana y Diego
  ('cc444444-4444-4444-8444-444444444404', 'bb222222-2222-4222-8222-222222222202', 'Ana',    'Martínez', 'ADULT', false),
  ('cc555555-5555-4555-8555-555555555505', 'bb222222-2222-4222-8222-222222222202', 'Diego',  'López',    'ADULT', false)
ON CONFLICT (id) DO NOTHING;
