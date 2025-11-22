-- We want to keep these dictionaries in separate tables to ensure data integrity and avoid duplication.
-- Table of all possible languages
CREATE TABLE languages (
    lang_code CHAR(2) PRIMARY KEY, -- e.g., 'en', 'es', 'hr'
    lang_name VARCHAR(50) UNIQUE NOT NULL
);

-- Table of all possible hobbies
CREATE TABLE hobbies (
    id SERIAL PRIMARY KEY,
    hobby_name VARCHAR(100) UNIQUE NOT NULL
);

-- Table of all countries (for origin and visited countries)
CREATE TABLE countries (
    iso_code CHAR(2) PRIMARY KEY, -- ISO 2-letter code (e.g., 'US', 'HR')
    country_name VARCHAR(100) UNIQUE NOT NULL
);