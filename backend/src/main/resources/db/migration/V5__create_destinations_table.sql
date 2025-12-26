-- destinations reference table
CREATE TABLE destinations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(250) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_destinations_name_location UNIQUE (name, location)
);

CREATE INDEX IF NOT EXISTS idx_destinations_name ON destinations(name);
