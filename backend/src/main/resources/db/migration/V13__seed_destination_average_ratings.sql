-- Replace ad-hoc frontend mock ratings: assign a stable, plausible average (3.5–5.0, one decimal)
-- for every destination that does not already have average_rating set (e.g. after admin curation).

UPDATE destinations
SET average_rating = ROUND((3.5::numeric + (mod(id * 7919, 16) * 0.1)), 1)
WHERE average_rating IS NULL;
