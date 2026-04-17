-- Manual moderation for review comments (spam control). Existing rows stay visible/aggregated.

ALTER TABLE trip_traveller_ratings
    ADD COLUMN moderation_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED';

COMMENT ON COLUMN trip_traveller_ratings.moderation_status IS 'PENDING | APPROVED | REJECTED; text comments start PENDING until staff approves.';
