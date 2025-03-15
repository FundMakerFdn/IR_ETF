import { pool } from "../db/connection";

/**
 * Fetch hourly average APY for all protocols.
 */
export const fetchHourlyAverageAPY = async () => {
  const client = await pool.connect();
  try {
    // Query to calculate the average APY for the last hour
    const result = await client.query(
      `SELECT protocol_name, chain, stablecoin, AVG(apy) as average_apy
       FROM protocols
       WHERE timestamp > NOW() - INTERVAL '1 hour'
       GROUP BY protocol_name, chain, stablecoin`
    );

    return result.rows; // Return the computed averages
  } finally {
    client.release();
  }
};

/**
 * Store hourly average APY in the database.
 */
export const storeHourlyAverageAPY = async () => {
  const client = await pool.connect();
  try {
    // Fetch the hourly average APY
    const averages = await fetchHourlyAverageAPY();

    // Store the average APY in the database
    for (const avg of averages) {
      await client.query(
        `INSERT INTO hourly_apy (protocol_name, chain, stablecoin, average_apy, timestamp)
         VALUES ($1, $2, $3, $4, NOW())`,
        [avg.protocol_name, avg.chain, avg.stablecoin, avg.average_apy]
      );
    }

    return { message: "Hourly average APY stored successfully." };
  } finally {
    client.release();
  }
};