-- Average traveller rating (0–5), one decimal; optional until curated or computed from reviews later.

ALTER TABLE destinations
    ADD COLUMN average_rating NUMERIC(2, 1) NULL,
    ADD CONSTRAINT chk_destinations_average_rating
        CHECK (average_rating IS NULL OR (average_rating >= 0 AND average_rating <= 5));
