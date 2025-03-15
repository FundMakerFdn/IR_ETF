import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
export const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  // ssl: true, // Uncomment if SSL is required
  max: parseInt(process.env.DB_POOL_SIZE || "10", 10),
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});