CREATE TABLE hourly_apy (
    id SERIAL PRIMARY KEY,
    protocol_name VARCHAR(255) NOT NULL,
    chain VARCHAR(255) NOT NULL,
    stablecoin VARCHAR(255) NOT NULL,
    average_apy NUMERIC NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);