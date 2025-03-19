import { pool } from "./connection";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const adminPool = new Pool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: "postgres", // Connect to default database first
});
const createDatabaseIfNotExists = async () => {
  const client = await adminPool.connect();
  try {
    const dbName = process.env.DATABASE_NAME;
    console.log(`Checking if database "${dbName}" exists...`);

    // Check if the database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error("Error checking/creating database:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const initializeDatabase = async () => {
  await createDatabaseIfNotExists();
  const client = await pool.connect();
  try {
    console.log("Initializing database schema...");

    // Create protocols table
    await client.query(`
      CREATE TABLE IF NOT EXISTS protocols (
        id SERIAL PRIMARY KEY,
        protocol_name VARCHAR(255) NOT NULL,
        chain VARCHAR(255) NOT NULL,
        stablecoin VARCHAR(255) NOT NULL,
        apy NUMERIC(10, 4) NOT NULL,
        tvl NUMERIC(20, 2) NOT NULL,
        interest_rate DECIMAL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create ldr_index table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ldr_index (
        id SERIAL PRIMARY KEY,
        index_value NUMERIC(10, 4) NOT NULL,
        weights JSONB NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create hourly_apy table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hourly_apy (
        id SERIAL PRIMARY KEY,
        protocol_name VARCHAR(255) NOT NULL,
        chain VARCHAR(255) NOT NULL,
        stablecoin VARCHAR(255) NOT NULL,
        average_apy NUMERIC(10, 4) NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create index_weights table
    await client.query(`
      CREATE TABLE IF NOT EXISTS index_weights (
        id SERIAL PRIMARY KEY,
        index_id INT,
        protocol VARCHAR(50),
        chain VARCHAR(50),
        weight DECIMAL,
        rebalance_date DATE,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW ()
      );
    `);

    // Create historical_protocols table
    await client.query(`
      CREATE TABLE IF NOT EXISTS historical_protocols (
        id SERIAL PRIMARY KEY,
        protocol_name VARCHAR(255) NOT NULL,
        chain VARCHAR(255) NOT NULL,
        stablecoin VARCHAR(255) NOT NULL,
        apy NUMERIC(10, 4) NOT NULL,
        tvl NUMERIC(20, 2) NOT NULL,
        timestamp TIMESTAMP NOT NULL
      );
    `);

    // Create indexes for performance optimization
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_protocols_timestamp ON protocols (timestamp);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hourly_apy_timestamp ON hourly_apy (timestamp);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_index_weights_index_id ON index_weights (index_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_historical_protocols_timestamp ON historical_protocols (timestamp);
    `);

    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Error initializing database schema:", error);
    throw error;
  } finally {
    client.release();
  }
};
