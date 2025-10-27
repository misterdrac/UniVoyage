-- V2__create_users_table.sql
-- Creates the main "users" table for UniVoyage app

CREATE TABLE IF NOT EXISTS users (
    id                 BIGSERIAL PRIMARY KEY,
    name               VARCHAR(100)       NOT NULL,
    email              VARCHAR(150)       UNIQUE NOT NULL,
    password           TEXT               NOT NULL,
    role               VARCHAR(50)        NOT NULL DEFAULT 'user',

    hobbies            TEXT[],            -- array of text values
    languages          TEXT[],            -- array for multiple languages
    country            VARCHAR(100),
    visited            TEXT[],            -- array of visited countries or cities

    profile_image      BYTEA,             -- binary data for the photo
    date_of_register   TIMESTAMPTZ        NOT NULL DEFAULT now(),
    date_of_last_signin TIMESTAMPTZ,

    CONSTRAINT email_format CHECK (position('@' IN email) > 1)
);

COMMENT ON TABLE users IS 'Table storing all UniVoyage registered users.';
COMMENT ON COLUMN users.id IS 'Primary key for each user.';
COMMENT ON COLUMN users.name IS 'Full name of the user.';
COMMENT ON COLUMN users.email IS 'Unique email address for login.';
COMMENT ON COLUMN users.password IS 'Plain password column (later replace with hash).';
COMMENT ON COLUMN users.role IS 'User role (user, admin, etc.).';
COMMENT ON COLUMN users.country IS 'Country of residence.';
COMMENT ON COLUMN users.profile_image IS 'Optional link to user profile image.';
COMMENT ON COLUMN users.date_of_register IS 'Timestamp of user registration.';
COMMENT ON COLUMN users.date_of_last_signin IS 'Timestamp of the last login attempt.';
