-- Migration: introduce user_identities for multi-provider OAuth support.
-- One row per (provider, provider_subject) pair; links back to a user.

CREATE TABLE user_identities (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT       NOT NULL,
    provider          VARCHAR(32)  NOT NULL,
    provider_subject  VARCHAR(255) NOT NULL,
    provider_email    VARCHAR(150),
    email_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_identities_provider_subject
        UNIQUE (provider, provider_subject),

    CONSTRAINT fk_user_identities_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
);

-- Fast lookup by user (list all identities for a user)
CREATE INDEX idx_user_identities_user_id
    ON user_identities (user_id);

-- Fast lookup by provider + subject (OAuth callback → existing identity)
CREATE INDEX idx_user_identities_provider_subject
    ON user_identities (provider, provider_subject);

