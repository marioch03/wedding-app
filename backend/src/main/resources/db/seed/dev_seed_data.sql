-- =============================================================================
-- dev_seed_data.sql
-- Datos de prueba para desarrollo LOCAL. NO es una migracion Flyway:
-- ejecutar manualmente (psql -f, o el cliente de tu IDE) contra tu BD local
-- despues de que Flyway haya aplicado V1__initial_schema.sql.
--
-- Idempotente: usa DELETE al principio para poder re-ejecutarlo sin duplicar
-- filas mientras iteras en local. Respeta el orden de FKs al borrar (hijos
-- antes que padres) e insertar (padres antes que hijos).
--
-- Los rsvp_token de aqui ('seed-token-...') son legibles a proposito para
-- poder probar el enlace publico a mano. NO reflejan como los genera
-- RsvpTokenGenerator en real (ahi son aleatorios de 256 bits, no legibles).
--
-- El clerk_user_id de admin_user es un placeholder. Sustituyelo por un id
-- real de tu panel de Clerk cuando probemos la Fase 2 (Auth).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Limpieza (orden inverso de dependencias)
-- -----------------------------------------------------------------------------
DELETE FROM guest_event;
DELETE FROM party_event;
DELETE FROM guest;
DELETE FROM party;
DELETE FROM menu_option;
DELETE FROM event;
DELETE FROM admin_user;
DELETE FROM wedding;

-- -----------------------------------------------------------------------------
-- WEDDINg (fila unica)
-- -----------------------------------------------------------------------------
INSERT INTO wedding (id, partner1_name, partner2_name, wedding_date, content, created_at, updated_at)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'Lucia',
    'Marcos',
    '2027-06-12',
    '{
        "hero": {"title": "Lucia & Marcos", "subtitle": "Nos casamos"},
        "story": "Nos conocimos hace 8 anos en la universidad...",
        "theme": {"primaryColor": "#B08968", "font": "serif"}
    }'::jsonb,
    now(),
    now()
);

-- -----------------------------------------------------------------------------
-- ADMIN_USER (placeholder - sustituir por clerk_user_id real en Fase 2)
-- -----------------------------------------------------------------------------
INSERT INTO admin_user (clerk_user_id, email, created_at)
VALUES ('user_seed_placeholder_replace_me', 'admin@example.com', now());

-- -----------------------------------------------------------------------------
-- EVENT (3 eventos: ceremonia, recepcion, fiesta)
-- -----------------------------------------------------------------------------
INSERT INTO event (id, wedding_id, name, event_type, description, start_datetime, end_datetime, venue_name, address, display_order, is_public, created_at, updated_at)
VALUES
    ('22222222-2222-4222-8222-222222222201',
     '11111111-1111-4111-8111-111111111111',
     'Ceremonia', 'CEREMONY', 'Ceremonia religiosa',
     '2027-06-12 12:00:00+02', '2027-06-12 13:00:00+02',
     'Iglesia de Santa Maria', 'Calle Mayor 1, Sevilla',
     1, true, now(), now()),

    ('22222222-2222-4222-8222-222222222202',
     '11111111-1111-4111-8111-111111111111',
     'Recepcion', 'RECEPTION', 'Comida y celebracion',
     '2027-06-12 14:00:00+02', '2027-06-12 20:00:00+02',
     'Hacienda El Rosario', 'Carretera A-92 km 15, Sevilla',
     2, true, now(), now()),

    ('22222222-2222-4222-8222-222222222203',
     '11111111-1111-4111-8111-111111111111',
     'Fiesta', 'PARTY', 'Barra libre y musica hasta tarde',
     '2027-06-12 23:00:00+02', '2027-06-13 04:00:00+02',
     'Hacienda El Rosario', 'Carretera A-92 km 15, Sevilla',
     3, true, now(), now());

-- -----------------------------------------------------------------------------
-- MENU_OPTION (ligadas al evento de Recepcion)
-- -----------------------------------------------------------------------------
INSERT INTO menu_option (id, event_id, name, description, diet_type, display_order)
VALUES
    ('33333333-3333-4333-8333-333333333301',
     '22222222-2222-4222-8222-222222222202',
     'Menu estandar', 'Solomillo con guarnicion de temporada', 'STANDARD', 1),

    ('33333333-3333-4333-8333-333333333302',
     '22222222-2222-4222-8222-222222222202',
     'Menu vegetariano', 'Risotto de setas y verduras de temporada', 'VEGETARIAN', 2),

    ('33333333-3333-4333-8333-333333333303',
     '22222222-2222-4222-8222-222222222202',
     'Menu vegano', 'Curry de garbanzos y verduras', 'VEGAN', 3),

    ('33333333-3333-4333-8333-333333333304',
     '22222222-2222-4222-8222-222222222202',
     'Menu infantil', 'Nuggets con patatas', 'CHILD', 4);

-- -----------------------------------------------------------------------------
-- PARTY (4 escenarios distintos a proposito, ver comentarios)
-- -----------------------------------------------------------------------------

-- 401: familia con 2 adultos + 2 ninos, YA CONFIRMADA, invitada a los 3 eventos
INSERT INTO party (id, display_name, rsvp_token, language_preference, internal_notes, status, responded_at, created_at, updated_at)
VALUES ('44444444-4444-4444-8444-444444444401', 'Familia Garcia', 'seed-token-garcia-0001', 'es',
        'Tios de la novia, mesa 3', 'CONFIRMED', now() - interval '3 days', now() - interval '10 days', now() - interval '3 days');

-- 402: pareja, PENDIENTE de responder, invitada solo a ceremonia + recepcion
INSERT INTO party (id, display_name, rsvp_token, language_preference, internal_notes, status, responded_at, created_at, updated_at)
VALUES ('44444444-4444-4444-8444-444444444402', 'Ana y Diego', 'seed-token-anadiego-0002', 'es',
        NULL, 'PENDING', NULL, now() - interval '10 days', now() - interval '10 days');

-- 403: invitado + acompanante SIN NOMBRE TODAVIA (placeholder), DECLINADA
INSERT INTO party (id, display_name, rsvp_token, language_preference, internal_notes, status, responded_at, created_at, updated_at)
VALUES ('44444444-4444-4444-8444-444444444403', 'Pedro Sanchez', 'seed-token-pedro-0003', 'es',
        'Companero de trabajo del novio', 'DECLINED', now() - interval '5 days', now() - interval '10 days', now() - interval '5 days');

-- 404: invitada individual, PENDIENTE
INSERT INTO party (id, display_name, rsvp_token, language_preference, internal_notes, status, responded_at, created_at, updated_at)
VALUES ('44444444-4444-4444-8444-444444444404', 'Marta Lopez', 'seed-token-marta-0004', 'en',
        NULL, 'PENDING', NULL, now() - interval '10 days', now() - interval '10 days');

-- -----------------------------------------------------------------------------
-- GUEST
-- -----------------------------------------------------------------------------

-- Familia Garcia (401)
INSERT INTO guest (id, party_id, first_name, last_name, guest_type, is_plus_one, email, phone, dietary_restrictions, created_at, updated_at)
VALUES
    ('55555555-5555-4555-8555-555555555501', '44444444-4444-4444-8444-444444444401', 'Maria', 'Garcia', 'ADULT', false, 'maria.garcia@example.com', '+34600000001', NULL, now(), now()),
    ('55555555-5555-4555-8555-555555555502', '44444444-4444-4444-8444-444444444401', 'Jose', 'Garcia', 'ADULT', false, 'jose.garcia@example.com', '+34600000002', NULL, now(), now()),
    ('55555555-5555-4555-8555-555555555503', '44444444-4444-4444-8444-444444444401', 'Sofia', 'Garcia', 'CHILD', false, NULL, NULL, NULL, now(), now()),
    ('55555555-5555-4555-8555-555555555504', '44444444-4444-4444-8444-444444444401', 'Pablo', 'Garcia', 'CHILD', false, NULL, NULL, 'Alergia a los frutos secos', now(), now());

-- Ana y Diego (402)
INSERT INTO guest (id, party_id, first_name, last_name, guest_type, is_plus_one, email, phone, dietary_restrictions, created_at, updated_at)
VALUES
    ('55555555-5555-4555-8555-555555555505', '44444444-4444-4444-8444-444444444402', 'Ana', 'Fernandez', 'ADULT', false, 'ana.fernandez@example.com', '+34600000005', NULL, now(), now()),
    ('55555555-5555-4555-8555-555555555506', '44444444-4444-4444-8444-444444444402', 'Diego', 'Martinez', 'ADULT', false, 'diego.martinez@example.com', '+34600000006', NULL, now(), now());

-- Pedro Sanchez + acompanante placeholder (403)
INSERT INTO guest (id, party_id, first_name, last_name, guest_type, is_plus_one, email, phone, dietary_restrictions, created_at, updated_at)
VALUES
    ('55555555-5555-4555-8555-555555555507', '44444444-4444-4444-8444-444444444403', 'Pedro', 'Sanchez', 'ADULT', false, 'pedro.sanchez@example.com', '+34600000007', NULL, now(), now()),
    ('55555555-5555-4555-8555-555555555508', '44444444-4444-4444-8444-444444444403', NULL, NULL, 'ADULT', true, NULL, NULL, NULL, now(), now());
    -- guest 508: placeholder de +1 nunca rellenado (la party declino antes de nombrarlo)

-- Marta Lopez (404)
INSERT INTO guest (id, party_id, first_name, last_name, guest_type, is_plus_one, email, phone, dietary_restrictions, created_at, updated_at)
VALUES
    ('55555555-5555-4555-8555-555555555509', '44444444-4444-4444-8444-444444444404', 'Marta', 'Lopez', 'ADULT', false, 'marta.lopez@example.com', '+34600000009', NULL, now(), now());

-- -----------------------------------------------------------------------------
-- PARTY_EVENT (a que eventos esta invitada cada party, nivel grueso)
-- -----------------------------------------------------------------------------
INSERT INTO party_event (party_id, event_id, created_at) VALUES
    ('44444444-4444-4444-8444-444444444401', '22222222-2222-4222-8222-222222222201', now()),
    ('44444444-4444-4444-8444-444444444401', '22222222-2222-4222-8222-222222222202', now()),
    ('44444444-4444-4444-8444-444444444401', '22222222-2222-4222-8222-222222222203', now()),

    ('44444444-4444-4444-8444-444444444402', '22222222-2222-4222-8222-222222222201', now()),
    ('44444444-4444-4444-8444-444444444402', '22222222-2222-4222-8222-222222222202', now()),
    -- 402 (Ana y Diego) NO invitada a la fiesta (203)

    ('44444444-4444-4444-8444-444444444403', '22222222-2222-4222-8222-222222222202', now()),
    ('44444444-4444-4444-8444-444444444403', '22222222-2222-4222-8222-222222222203', now()),
    -- 403 (Pedro) NO invitado a la ceremonia (201)

    ('44444444-4444-4444-8444-444444444404', '22222222-2222-4222-8222-222222222201', now()),
    ('44444444-4444-4444-8444-444444444404', '22222222-2222-4222-8222-222222222202', now()),
    ('44444444-4444-4444-8444-444444444404', '22222222-2222-4222-8222-222222222203', now());

-- -----------------------------------------------------------------------------
-- GUEST_EVENT (asistencia + menu, nivel fino por invitado)
-- Existencia de fila = invitado a ese evento. attending NULL = aun sin responder.
-- -----------------------------------------------------------------------------

-- Maria Garcia: confirma los 3 eventos, menu estandar en recepcion
INSERT INTO guest_event (id, guest_id, event_id, attending, menu_option_id, special_notes, responded_at) VALUES
    ('66666666-6666-4666-8666-666666666601', '55555555-5555-4555-8555-555555555501', '22222222-2222-4222-8222-222222222201', true, NULL, NULL, now() - interval '3 days'),
    ('66666666-6666-4666-8666-666666666602', '55555555-5555-4555-8555-555555555501', '22222222-2222-4222-8222-222222222202', true, '33333333-3333-4333-8333-333333333301', NULL, now() - interval '3 days'),
    ('66666666-6666-4666-8666-666666666603', '55555555-5555-4555-8555-555555555501', '22222222-2222-4222-8222-222222222203', true, NULL, NULL, now() - interval '3 days');

-- Jose Garcia: igual que Maria
INSERT INTO guest_event (id, guest_id, event_id, attending, menu_option_id, special_notes, responded_at) VALUES
    ('66666666-6666-4666-8666-666666666604', '55555555-5555-4555-8555-555555555502', '22222222-2222-4222-8222-222222222201', true, NULL, NULL, now() - interval '3 days'),
    ('66666666-6666-4666-8666-666666666605', '55555555-5555-4555-8555-555555555502', '22222222-2222-4222-8222-222222222202', true, '33333333-3333-4333-8333-333333333301', NULL, now() - interval '3 days'),
    ('66666666-6666-4666-8666-666666666606', '55555555-5555-4555-8555-555555555502', '22222222-2222-4222-8222-222222222203', true, NULL, NULL, now() - interval '3 days');

-- Sofia (nina): confirmada en ceremonia + recepcion con menu infantil. SIN fila para
-- fiesta (203) aunque su party si esta invitada - la familia decidio no llevarla de noche.
INSERT INTO guest_event (id, guest_id, event_id, attending, menu_option_id, special_notes, responded_at) VALUES
    ('66666666-6666-4666-8666-666666666607', '55555555-5555-4555-8555-555555555503', '22222222-2222-4222-8222-222222222201', true, NULL, NULL, now() - interval '3 days'),
    ('66666666-6666-4666-8666-666666666608', '55555555-5555-4555-8555-555555555503', '22222222-2222-4222-8222-222222222202', true, '33333333-3333-4333-8333-333333333304', NULL, now() - interval '3 days');

-- Pablo (nino, alergia): igual que Sofia, con nota de alergia en el menu
INSERT INTO guest_event (id, guest_id, event_id, attending, menu_option_id, special_notes, responded_at) VALUES
    ('66666666-6666-4666-8666-666666666609', '55555555-5555-4555-8555-555555555504', '22222222-2222-4222-8222-222222222201', true, NULL, NULL, now() - interval '3 days'),
    ('66666666-6666-4666-8666-666666666610', '55555555-5555-4555-8555-555555555504', '22222222-2222-4222-8222-222222222202', true, '33333333-3333-4333-8333-333333333304', 'Alergia a frutos secos - avisar a catering', now() - interval '3 days');

-- Ana y Diego (party PENDING): las filas existen (estan invitados) pero SIN respuesta -> attending NULL
INSERT INTO guest_event (id, guest_id, event_id, attending, menu_option_id, special_notes, responded_at) VALUES
    ('66666666-6666-4666-8666-666666666611', '55555555-5555-4555-8555-555555555505', '22222222-2222-4222-8222-222222222201', NULL, NULL, NULL, NULL),
    ('66666666-6666-4666-8666-666666666612', '55555555-5555-4555-8555-555555555505', '22222222-2222-4222-8222-222222222202', NULL, NULL, NULL, NULL),
    ('66666666-6666-4666-8666-666666666613', '55555555-5555-4555-8555-555555555506', '22222222-2222-4222-8222-222222222201', NULL, NULL, NULL, NULL),
    ('66666666-6666-4666-8666-666666666614', '55555555-5555-4555-8555-555555555506', '22222222-2222-4222-8222-222222222202', NULL, NULL, NULL, NULL);

-- Pedro Sanchez (party DECLINED): responde que no a los 2 eventos a los que esta invitado.
-- Su acompanante placeholder (508) NO tiene filas: nunca llego a confirmarse nada sobre el.
INSERT INTO guest_event (id, guest_id, event_id, attending, menu_option_id, special_notes, responded_at) VALUES
    ('66666666-6666-4666-8666-666666666615', '55555555-5555-4555-8555-555555555507', '22222222-2222-4222-8222-222222222202', false, NULL, NULL, now() - interval '5 days'),
    ('66666666-6666-4666-8666-666666666616', '55555555-5555-4555-8555-555555555507', '22222222-2222-4222-8222-222222222203', false, NULL, NULL, now() - interval '5 days');

-- Marta Lopez (party PENDING): invitada a los 3 eventos, sin responder aun
INSERT INTO guest_event (id, guest_id, event_id, attending, menu_option_id, special_notes, responded_at) VALUES
    ('66666666-6666-4666-8666-666666666617', '55555555-5555-4555-8555-555555555509', '22222222-2222-4222-8222-222222222201', NULL, NULL, NULL, NULL),
    ('66666666-6666-4666-8666-666666666618', '55555555-5555-4555-8555-555555555509', '22222222-2222-4222-8222-222222222202', NULL, NULL, NULL, NULL),
    ('66666666-6666-4666-8666-666666666619', '55555555-5555-4555-8555-555555555509', '22222222-2222-4222-8222-222222222203', NULL, NULL, NULL, NULL);

COMMIT;

-- -----------------------------------------------------------------------------
-- Resumen de escenarios cubiertos (util para probar el admin panel / RSVP):
--   - seed-token-garcia-0001  -> CONFIRMED, familia de 4, con alergia y exclusion de nino en un evento
--   - seed-token-anadiego-0002 -> PENDING, pareja, sin invitacion a la fiesta
--   - seed-token-pedro-0003   -> DECLINED, con un +1 nunca nombrado
--   - seed-token-marta-0004   -> PENDING, invitada individual, locale 'en'
-- -----------------------------------------------------------------------------