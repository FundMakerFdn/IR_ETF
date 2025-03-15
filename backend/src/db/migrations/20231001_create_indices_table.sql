CREATE TABLE indices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    index_value NUMERIC(10, 4) NOT NULL,
    weights JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);