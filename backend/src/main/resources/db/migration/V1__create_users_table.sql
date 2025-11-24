-- CREATE DATABASE univoyage_db;

-- \c univoyage_db

CREATE TABLE countries (
    iso_code VARCHAR(2) PRIMARY KEY,
    country_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    surname       VARCHAR(150) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'USER'
        CHECK (role IN ('USER', 'ADMIN')),

    country_of_origin_code VARCHAR(2),

    profile_image_url TEXT,
    date_of_register TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_of_last_signin TIMESTAMPTZ,

    CONSTRAINT email_format CHECK (position('@' IN email) > 1),

    CONSTRAINT fk_users_country_origin
        FOREIGN KEY (country_of_origin_code) REFERENCES countries(iso_code)
);

COMMENT ON TABLE users IS 'Table storing all UniVoyage registered users.';
COMMENT ON COLUMN users.id IS 'Primary key for each user.';
COMMENT ON COLUMN users.name IS 'First name of the user.';
COMMENT ON COLUMN users.surname IS 'Surname (last name) of the user.';
COMMENT ON COLUMN users.email IS 'Unique email address for login.';
COMMENT ON COLUMN users.password_hash IS 'Secure hash of the user password (SHA-256, bcrypt, etc.).';
COMMENT ON COLUMN users.role IS 'User role (user, admin).';
COMMENT ON COLUMN users.country_of_origin_code IS 'Reference to the user''s country of origin (ISO 2-letter code).';
COMMENT ON COLUMN users.profile_image_data IS 'Binary data (BYTEA) of the user profile image.';
COMMENT ON COLUMN users.date_of_register IS 'Timestamp of user registration (including HH:MM:SS).';
COMMENT ON COLUMN users.date_of_last_signin IS 'Timestamp of the last successful sign-in.';