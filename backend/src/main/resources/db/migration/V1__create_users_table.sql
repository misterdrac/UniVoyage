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
        CHECK (role IN ('USER', 'ADMIN', 'HEAD_ADMIN')),

    country_of_origin_code VARCHAR(2),

    profile_image_path TEXT,
    date_of_register TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_of_last_signin TIMESTAMPTZ,

    CONSTRAINT email_format CHECK (position('@' IN email) > 1),

    CONSTRAINT fk_users_country_origin
        FOREIGN KEY (country_of_origin_code) REFERENCES countries(iso_code)
);
