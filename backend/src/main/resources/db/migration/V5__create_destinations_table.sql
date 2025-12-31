-- Description: Create the 'destinations' table to store travel destination information.
-- destinations reference table (FULL + MINIMAL)
CREATE TABLE destinations (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(200) NOT NULL,
    location VARCHAR(100) NOT NULL,
    continent VARCHAR(50) NOT NULL,

    image_url TEXT,
    image_alt TEXT,

    overview TEXT,
    budget_per_day INTEGER,

    why_visit TEXT,
    student_perks TEXT[],

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_destinations_title_location UNIQUE (title, location)
);

CREATE INDEX IF NOT EXISTS idx_destinations_continent ON destinations(continent);
CREATE INDEX IF NOT EXISTS idx_destinations_location ON destinations(location);
CREATE INDEX IF NOT EXISTS idx_destinations_title ON destinations(title);
