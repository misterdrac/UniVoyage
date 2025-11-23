-- Stores a list of countries each user has visited
-- Each user can visit multiple countries, and each country can be visited by multiple users
CREATE TABLE user_visited_countries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    country_code CHAR(2) REFERENCES countries(iso_code) ON DELETE CASCADE, -- References the 'countries' table
    date_of_visit DATE, -- Optional: Stores when they visited (if tracking details)
    UNIQUE (user_id, country_code)
);