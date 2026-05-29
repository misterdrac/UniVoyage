ALTER TABLE users
    ADD COLUMN email_verified_at TIMESTAMPTZ;

COMMENT ON COLUMN users.email_verified_at IS
    'Set when the user proves mailbox control (password reset link, email verification, or OAuth with verified email).';

CREATE TABLE user_email_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    email           VARCHAR(150) NOT NULL,
    purpose         VARCHAR(32) NOT NULL,
    token_hash      TEXT NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    attempt_count   INT NOT NULL DEFAULT 0,
    max_attempts    INT NOT NULL DEFAULT 5,
    consumed_at     TIMESTAMPTZ,
    invalidated_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT user_email_token_purpose_check CHECK (
        purpose IN ('PASSWORD_RESET', 'EMAIL_VERIFICATION')
    ),
    CONSTRAINT user_email_token_attempt_count_nonneg CHECK (attempt_count >= 0)
);

CREATE UNIQUE INDEX idx_user_email_token_active
    ON user_email_tokens (LOWER(email), purpose)
    WHERE consumed_at IS NULL AND invalidated_at IS NULL;

CREATE INDEX idx_user_email_token_expires_at ON user_email_tokens (expires_at);
CREATE INDEX idx_user_email_token_hash ON user_email_tokens (token_hash);
