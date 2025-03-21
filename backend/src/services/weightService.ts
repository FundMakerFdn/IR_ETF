import { pool } from "../db/connection";

export const saveWeights = async (indexId: number, weights: any, rebalanceDate: any) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const { protocol, chain, stablecoin, weight } of weights) {
      await client.query(
        `INSERT INTO index_weights (index_id, protocol, chain, stablecoin, weight, rebalance_date)
           VALUES ($1, $2, $3, $4, $5, $6)`,
        [indexId, protocol, chain, stablecoin, weight, rebalanceDate]
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
