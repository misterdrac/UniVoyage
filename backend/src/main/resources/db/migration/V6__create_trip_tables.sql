-- migration script for creating trip-related tables
CREATE TABLE trips (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    destination_id BIGINT NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'planned',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trips_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_trips_destination
            FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE RESTRICT,

    CONSTRAINT trips_dates_chk CHECK (return_date >= departure_date)
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_destination_id ON trips(destination_id);

-- trip budgets table (1:1)
CREATE TABLE trip_budgets (
    trip_id BIGINT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trip_budgets_trip
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- trip itineraries table (1:1)
CREATE TABLE trip_itineraries (
    trip_id BIGINT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trip_itineraries_trip
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);
