CREATE TABLE cms_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(64) NOT NULL,
    actor_user_id BIGINT REFERENCES users (id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    target_user_id BIGINT REFERENCES users (id) ON DELETE SET NULL,
    target_email VARCHAR(255),
    ip_address VARCHAR(45),
    metadata TEXT
);

CREATE INDEX idx_cms_audit_logs_created_at ON cms_audit_logs (created_at DESC);
CREATE INDEX idx_cms_audit_logs_event_type ON cms_audit_logs (event_type);
