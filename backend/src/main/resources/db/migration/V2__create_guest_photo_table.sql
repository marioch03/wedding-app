-- =============================================================================
-- V2__create_guest_photo_table.sql
-- Tabla para almacenar fotos subidas por los invitados al álbum colaborativo.
-- =============================================================================

CREATE TABLE guest_photo (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id          UUID NOT NULL REFERENCES wedding(id) ON DELETE CASCADE,
    image_url           VARCHAR(500) NOT NULL,
    uploader_name       VARCHAR(120) NOT NULL,
    caption             VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_guest_photo_wedding_created ON guest_photo(wedding_id, created_at DESC);
