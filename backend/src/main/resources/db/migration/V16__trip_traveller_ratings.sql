-- Per-user rating of the trip's destination experience (one row per user per trip).
-- Used after the trip has ended; aggregates feed destinations.traveller_rating_* (separate from admin average_rating).

CREATE TABLE trip_traveller_ratings (
    id              BIGSERIAL PRIMARY KEY,
    trip_id         BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    stars           SMALLINT NOT NULL,
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ttr_trip
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
    CONSTRAINT fk_ttr_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_ttr_trip_user UNIQUE (trip_id, user_id),
    CONSTRAINT chk_ttr_stars CHECK (stars >= 1 AND stars <= 5)
);

CREATE INDEX idx_ttr_trip_id ON trip_traveller_ratings (trip_id);
CREATE INDEX idx_ttr_user_id ON trip_traveller_ratings (user_id);

ALTER TABLE destinations
    ADD COLUMN traveller_rating_average NUMERIC(2, 1) NULL,
    ADD COLUMN traveller_rating_count   INTEGER NOT NULL DEFAULT 0;
