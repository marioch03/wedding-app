-- =============================================================================
-- V1__initial_schema.sql
-- Esquema inicial de la aplicacion de boda.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- WEDDING
-- Configuracion general de la boda y contenido editable del sitio web.
-- -----------------------------------------------------------------------------
CREATE TABLE wedding (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner1_name       VARCHAR(120) NOT NULL,
    partner2_name       VARCHAR(120) NOT NULL,
    wedding_date        DATE NOT NULL,
    content             JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- ADMIN_USER
-- Lista de control de acceso de administradores autenticados via Clerk.
-- -----------------------------------------------------------------------------
CREATE TABLE admin_user (
    clerk_user_id       VARCHAR(100) PRIMARY KEY,
    email               VARCHAR(254),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- EVENT
-- -----------------------------------------------------------------------------
CREATE TABLE event (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id     UUID NOT NULL REFERENCES wedding(id),
    name                VARCHAR(160) NOT NULL,
    event_type          VARCHAR(20) NOT NULL,
    description         TEXT,
    start_datetime      TIMESTAMPTZ NOT NULL,
    end_datetime        TIMESTAMPTZ,
    venue_name          VARCHAR(200),
    address             VARCHAR(300),
    latitude            NUMERIC(9,6),
    longitude           NUMERIC(9,6),
    display_order       INTEGER NOT NULL DEFAULT 0,
    is_public           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_event_type
        CHECK (event_type IN ('CEREMONY', 'RECEPTION', 'PARTY', 'OTHER')),
    CONSTRAINT chk_event_dates
        CHECK (end_datetime IS NULL OR end_datetime >= start_datetime)
);

CREATE INDEX idx_event_wedding_id ON event(wedding_id);

-- -----------------------------------------------------------------------------
-- PARTY
-- Unidad de invitacion y RSVP.
-- -----------------------------------------------------------------------------
CREATE TABLE party (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name        VARCHAR(160) NOT NULL,
    rsvp_token          VARCHAR(64) NOT NULL,
    language_preference VARCHAR(10) NOT NULL DEFAULT 'es',
    internal_notes      TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    responded_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_party_rsvp_token UNIQUE (rsvp_token),
    CONSTRAINT chk_party_status
        CHECK (status IN ('PENDING', 'PARTIAL', 'CONFIRMED', 'DECLINED'))
);

-- -----------------------------------------------------------------------------
-- PARTY_EVENT
-- Define a que eventos esta invitada la PARTY como unidad.
-- -----------------------------------------------------------------------------
CREATE TABLE party_event (
    party_id            UUID NOT NULL REFERENCES party(id) ON DELETE CASCADE,
    event_id            UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (party_id, event_id)
);

CREATE INDEX idx_party_event_event_id ON party_event(event_id);

-- -----------------------------------------------------------------------------
-- GUEST
-- -----------------------------------------------------------------------------
CREATE TABLE guest (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id                UUID NOT NULL REFERENCES party(id) ON DELETE CASCADE,
    first_name              VARCHAR(100),
    last_name               VARCHAR(100),
    guest_type              VARCHAR(20) NOT NULL DEFAULT 'ADULT',
    is_plus_one             BOOLEAN NOT NULL DEFAULT false,
    email                   VARCHAR(254),
    phone                   VARCHAR(30),
    dietary_restrictions    TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_guest_type
        CHECK (guest_type IN ('ADULT', 'CHILD', 'INFANT'))
);

CREATE INDEX idx_guest_party_id ON guest(party_id);

-- -----------------------------------------------------------------------------
-- MENU_OPTION
-- -----------------------------------------------------------------------------
CREATE TABLE menu_option (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    name            VARCHAR(160) NOT NULL,
    description     TEXT,
    diet_type       VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    display_order   INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT chk_menu_diet_type
        CHECK (diet_type IN ('STANDARD', 'VEGETARIAN', 'VEGAN', 'CHILD', 'OTHER'))
);

CREATE INDEX idx_menu_option_event_id ON menu_option(event_id);

-- -----------------------------------------------------------------------------
-- GUEST_EVENT
-- Consolida la invitacion individual, asistencia y seleccion de menu por evento.
-- -----------------------------------------------------------------------------
CREATE TABLE guest_event (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id            UUID NOT NULL REFERENCES guest(id) ON DELETE CASCADE,
    event_id            UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    attending           BOOLEAN,
    menu_option_id      UUID REFERENCES menu_option(id) ON DELETE SET NULL,
    special_notes       TEXT,
    responded_at        TIMESTAMPTZ,

    CONSTRAINT uq_guest_event UNIQUE (guest_id, event_id)
);

CREATE INDEX idx_guest_event_guest_id ON guest_event(guest_id);
CREATE INDEX idx_guest_event_event_id ON guest_event(event_id);
CREATE INDEX idx_guest_event_menu_option_id ON guest_event(menu_option_id);