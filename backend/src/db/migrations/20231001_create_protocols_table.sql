CREATE TABLE protocols (
    id SERIAL PRIMARY KEY,
    protocol_name VARCHAR(255) NOT NULL,
    chain VARCHAR(255) NOT NULL,
    stablecoin VARCHAR(255) NOT NULL,
    apy NUMERIC NOT NULL,
    tvl NUMERIC NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);