CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weddings (
    id UUID PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,

    partner_1_name VARCHAR(150) NOT NULL,
    partner_2_name VARCHAR(150) NOT NULL,

    wedding_date DATE,

    timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Madrid',
    locale VARCHAR(10) NOT NULL DEFAULT 'es',

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),

    version BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wedding_users (
    id UUID PRIMARY KEY,

    wedding_id UUID NOT NULL
        REFERENCES weddings(id) ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('OWNER', 'ADMIN', 'EDITOR')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_wedding_user
        UNIQUE (wedding_id, user_id)
);

CREATE INDEX idx_wedding_users_user_id
    ON wedding_users(user_id);