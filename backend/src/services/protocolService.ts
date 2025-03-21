import { pool } from "../db/connection";

export const saveToPostgres = async (data: any[]) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queryText = `
      INSERT INTO protocols (protocol_name, chain, stablecoin, apy, tvl, interest_rate, last_updated)
      VALUES ${data
        .map(
          (_, i) =>
            `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${
              i * 7 + 5
            }, $${i * 7 + 6}, $${i * 7 + 7})`
        )
        .join(", ")}
    `;
    const values = data.flatMap((item) => [
      item.protocol,
      item.chain,
      item.stablecoin,
      item.apy,
      item.tvl,
      item.interest_rate,
      item.timestamp,
    ]);
    await client.query(queryText, values);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error saving to Postgres:", e);
  } finally {
    client.release();
  }
};
