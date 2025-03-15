import { pool } from "../db/connection";

export const calculateLDRIndex = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT stablecoin, apy, tvl FROM protocols WHERE timestamp > NOW() - INTERVAL '1 minute'`
    );

    const protocols = result.rows;

    let totalLent = 0;
    let weightedSum = 0;

    protocols.forEach((protocol: any) => {
      totalLent += protocol.tvl;
      weightedSum += protocol.apy * protocol.tvl;
    });

    const index = totalLent > 0 ? weightedSum / totalLent : 0;

    // Store the calculated index in the database
    await client.query(
      `INSERT INTO ldr_index (index_value, weights) VALUES ($1, $2)`,
      [index, JSON.stringify(protocols)]
    );

    return { index, protocols };
  } finally {
    client.release();
  }
};