-- Seed initial data into hobby, language, and country tables
-- This migration adds predefined hobbies, languages, and countries to the database because we use checker on registration
-- to validate user input against existing data, this way we ensure that the data is consistent and avoid user defining arbitrary values.
-- The ON CONFLICT DO NOTHING clause ensures that if the data already exists, it won't be duplicated.
-- User cannot modify these tables directly, so this seeding is a one-time operation during migration.
INSERT INTO hobbies (hobby_name) VALUES
    ('history'),
    ('hiking'),
    ('culture'),
    ('food'),
    ('photography'),
    ('adventure'),
    ('nightlife'),
    ('party'),
    ('nature'),
    ('beaches'),
    ('architecture'),
    ('museums'),
    ('shopping'),
    ('sports'),
    ('wildlife'),
    ('music'),
    ('art'),
    ('festivals'),
    ('wellness_spa'),
    ('wine_tasting'),
    ('volunteering'),
    ('road_trips'),
    ('sailing_boating'),
    ('relaxation_meditation'),
    ('stargazing'),
    ('genealogy_ancestry'),
    ('local_markets'),
    ('reading_writing'),
    ('scuba_snorkeling'),
    ('golf_country_clubs')
ON CONFLICT (hobby_name) DO NOTHING;