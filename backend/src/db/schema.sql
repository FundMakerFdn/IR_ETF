-- Database schema for the LDRI Index project

-- Table to store protocol data
CREATE TABLE protocols (
    id SERIAL PRIMARY KEY,
    protocol_name VARCHAR(255) NOT NULL,
    chain VARCHAR(255) NOT NULL,
    stablecoin VARCHAR(255) NOT NULL,
    apy NUMERIC(10, 4) NOT NULL, -- Annual Percentage Yield
    tvl NUMERIC(20, 2) NOT NULL, -- Total Value Locked
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table to store the Lending Rate Depth Index (LDRI)
CREATE TABLE ldr_index (
    id SERIAL PRIMARY KEY,
    index_value NUMERIC(10, 4) NOT NULL,
    weights JSONB NOT NULL, -- JSON object to store protocol weights
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table to store hourly average APY for protocols
CREATE TABLE hourly_apy (
    id SERIAL PRIMARY KEY,
    protocol_name VARCHAR(255) NOT NULL,
    chain VARCHAR(255) NOT NULL,
    stablecoin VARCHAR(255) NOT NULL,
    average_apy NUMERIC(10, 4) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table to store historical weights for protocols in the index
CREATE TABLE index_weights (
    id SERIAL PRIMARY KEY,
    index_id INT NOT NULL REFERENCES ldr_index(id) ON DELETE CASCADE,
    protocol_name VARCHAR(255) NOT NULL,
    weight NUMERIC(10, 4) NOT NULL, -- Weight as a percentage
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table to store historical protocol data for simulations
CREATE TABLE historical_protocols (
    id SERIAL PRIMARY KEY,
    protocol_name VARCHAR(255) NOT NULL,
    chain VARCHAR(255) NOT NULL,
    stablecoin VARCHAR(255) NOT NULL,
    apy NUMERIC(10, 4) NOT NULL,
    tvl NUMERIC(20, 2) NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

-- Indexes for performance optimization
CREATE INDEX idx_protocols_timestamp ON protocols (timestamp);
CREATE INDEX idx_hourly_apy_timestamp ON hourly_apy (timestamp);
CREATE INDEX idx_index_weights_index_id ON index_weights (index_id);
CREATE INDEX idx_historical_protocols_timestamp ON historical_protocols (timestamp);
