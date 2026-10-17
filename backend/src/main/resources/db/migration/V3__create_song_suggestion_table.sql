-- =============================================================================
-- V3__create_song_suggestion_table.sql
-- Tabla para almacenar sugerencias de canciones en formato de petición libre.
-- =============================================================================

CREATE TABLE song_suggestion (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id          UUID NOT NULL REFERENCES wedding(id) ON DELETE CASCADE,
    guest_name          VARCHAR(100) NOT NULL,
    song_request        VARCHAR(250) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_song_suggestion_wedding_created ON song_suggestion(wedding_id, created_at DESC);
