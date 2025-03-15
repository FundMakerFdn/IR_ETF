CREATE TABLE index_weights (
    id SERIAL PRIMARY KEY,
    index_id INT NOT NULL,
    protocol_name VARCHAR(255) NOT NULL,
    weight NUMERIC NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (index_id) REFERENCES indices(id)
);