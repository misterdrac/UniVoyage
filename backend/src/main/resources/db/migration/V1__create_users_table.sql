-- CREATE DATABASE univoyage;

-- \c univoyage

CREATE TABLE users (
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

-- COMMENT ON users.email IS 'User email address is unique, has to contain @ sign, that is define with unique constraint';
-- COMMENT ON users.email IS 'Password must be atleast 8 characters long, contain numbers, lowercase, uppercase letters';
