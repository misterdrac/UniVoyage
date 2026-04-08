-- This script runs only when Postgres initializes a fresh data directory.
-- It keeps database creation separate from Flyway schema migrations.
SELECT 'CREATE DATABASE univoyage_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'univoyage_db');
\gexec
