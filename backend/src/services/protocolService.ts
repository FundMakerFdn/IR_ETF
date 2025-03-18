import { pool } from "../db/connection";

export const saveToPostgres = async (data: any[]) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of data) {
      await client.query(
        `INSERT INTO protocols (protocol_name, chain, stablecoin, apy, tvl, interest_rate, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          item.protocol,
          item.chain,
          item.stablecoin,
          item.apy,
          item.tvl,
          item.interest_rate,
          item.timestamp,
        ]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error saving to Postgres:", e);
  } finally {
    client.release();
  }
};
