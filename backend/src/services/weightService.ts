import { pool } from "../db/connection";

export const saveWeights = async (indexId: number, weights: any, rebalanceDate: any) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const { protocol, chain, weight } of weights) {
      await client.query(
        `INSERT INTO index_weights (index_id, protocol_name, chain, weight, rebalance_date)
           VALUES ($1, $2, $3, $4, $5)`,
        [indexId, protocol, chain, weight, rebalanceDate]
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error saving weights:", e);
  } finally {
    client.release();
  }
}
