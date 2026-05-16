CREATE TABLE email_otp_challenges (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(150) NOT NULL,
    purpose         VARCHAR(32) NOT NULL,
    otp_hash        TEXT NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    attempt_count   INT NOT NULL DEFAULT 0,
    max_attempts    INT NOT NULL DEFAULT 5,
    resend_count    INT NOT NULL DEFAULT 0,
    max_resends     INT NOT NULL DEFAULT 3,
    last_sent_at    TIMESTAMPTZ NOT NULL,
    next_resend_at  TIMESTAMPTZ NOT NULL,
    consumed_at     TIMESTAMPTZ,
    locked_until    TIMESTAMPTZ,
    invalidated_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT email_otp_purpose_check CHECK (
        purpose IN ('LOGIN', 'REGISTER', 'PASSWORD_RESET')
    ),
    CONSTRAINT email_otp_attempt_count_nonneg CHECK (attempt_count >= 0),
    CONSTRAINT email_otp_resend_count_nonneg CHECK (resend_count >= 0)
);

-- Single active (non-consumed, non-invalidated) challenge per email + purpose.
CREATE UNIQUE INDEX idx_email_otp_active_challenge
    ON email_otp_challenges (LOWER(email), purpose)
    WHERE consumed_at IS NULL AND invalidated_at IS NULL;

CREATE INDEX idx_email_otp_expires_at ON email_otp_challenges (expires_at);
