-- Demo trips for golubovicdario@gmail.com (HEAD_ADMIN): 3 planned + 3 completed, each a different country.
-- UI status is derived from dates (see frontend calculateTripStatus); DB status kept in sync for API/ratings.
-- Re-runnable: removes all existing trips for this user before insert (demo account only).

DELETE FROM trips
WHERE user_id = (SELECT id FROM users WHERE email = 'golubovicdario@gmail.com');

INSERT INTO trips (user_id, destination_id, departure_date, return_date, status, created_at)
SELECT u.id, v.destination_id, v.departure_date::date, v.return_date::date, v.status, v.created_at::timestamptz
FROM users u
CROSS JOIN (VALUES
    -- Planned (future vs migration apply date; adjust if re-run years later)
    (7,  '2026-07-10', '2026-07-20', 'planned',   '2026-05-01 10:00:00+00'),  -- Tokyo, Japan (JP)
    (110, '2026-08-05', '2026-08-15', 'planned',   '2026-05-02 10:00:00+00'),  -- Sydney, Australia (AU)
    (89,  '2026-09-01', '2026-09-10', 'planned',   '2026-05-03 10:00:00+00'),  -- Lisbon, Portugal (PT)
    -- Completed (past)
    (1,  '2025-11-10', '2025-11-17', 'completed', '2025-10-01 10:00:00+00'),  -- Paris, France (FR)
    (2,  '2026-01-15', '2026-01-22', 'completed', '2026-01-01 10:00:00+00'),  -- Barcelona, Spain (ES)
    (5,  '2026-03-01', '2026-03-08', 'completed', '2026-02-15 10:00:00+00')   -- Rome, Italy (IT)
) AS v(destination_id, departure_date, return_date, status, created_at)
WHERE u.email = 'golubovicdario@gmail.com';

-- Sample budget (currency tab) for one planned + one completed trip
INSERT INTO trip_budgets (trip_id, payload, updated_at)
SELECT t.id, b.payload::jsonb, NOW()
FROM trips t
JOIN users u ON u.id = t.user_id AND u.email = 'golubovicdario@gmail.com'
JOIN destinations d ON d.id = t.destination_id
JOIN LATERAL (
    SELECT CASE d.country_code
        WHEN 'JP' THEN '{"total":2400,"currency":"EUR","categories":[{"name":"Flights","amount":1200},{"name":"Stay","amount":800},{"name":"Food","amount":400}]}'
        WHEN 'FR' THEN '{"total":980,"currency":"EUR","categories":[{"name":"Trains","amount":180},{"name":"Museums","amount":120},{"name":"Food","amount":680}]}'
    END AS payload
) b ON d.country_code IN ('JP', 'FR')
WHERE d.country_code IN ('JP', 'FR')
ON CONFLICT (trip_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();

-- Sample itinerary for Tokyo planned trip
INSERT INTO trip_itineraries (trip_id, payload, updated_at)
SELECT t.id, '{"days":[{"day":1,"title":"Arrival Shinjuku","activities":["Check-in","Ramen dinner"]},{"day":2,"title":"Culture","activities":["Senso-ji","teamLab"]}]}'::jsonb, NOW()
FROM trips t
JOIN users u ON u.id = t.user_id AND u.email = 'golubovicdario@gmail.com'
JOIN destinations d ON d.id = t.destination_id AND d.country_code = 'JP'
ON CONFLICT (trip_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();

-- Sample accommodation for Rome completed trip
INSERT INTO trip_accommodations (trip_id, accommodation_name, accommodation_address, accommodation_phone, updated_at)
SELECT t.id, 'Hotel Centro Storico', 'Via del Corso 12, Rome', '+39 06 1234567', NOW()
FROM trips t
JOIN users u ON u.id = t.user_id AND u.email = 'golubovicdario@gmail.com'
JOIN destinations d ON d.id = t.destination_id AND d.country_code = 'IT'
ON CONFLICT (trip_id) DO UPDATE SET
    accommodation_name = EXCLUDED.accommodation_name,
    accommodation_address = EXCLUDED.accommodation_address,
    accommodation_phone = EXCLUDED.accommodation_phone,
    updated_at = NOW();
