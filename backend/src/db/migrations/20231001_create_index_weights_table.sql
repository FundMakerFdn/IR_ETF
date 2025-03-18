CREATE TABLE
    index_weights (
        id SERIAL PRIMARY KEY,
        index_id INT,
        protocol VARCHAR(50),
        chain VARCHAR(50),
        weight DECIMAL,
        rebalance_date DATE,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW ()
    );