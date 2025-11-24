-- Stores a list of countries each user has visited
-- Each user can visit multiple countries, and each country can be visited by multiple users
CREATE TABLE user_visited_countries (
    user_id BIGINT NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    date_of_visit TIMESTAMPTZ,

    PRIMARY KEY (user_id, country_code),

    CONSTRAINT fk_user_visited_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_visited_country
        FOREIGN KEY (country_code) REFERENCES countries(iso_code) ON DELETE CASCADE
);
