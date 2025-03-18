import { pool } from "../db/connection";
import { Protocol } from "../models/protocolModel";

export const simulateRebalance = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT protocol_name, chain, stablecoin, apy, tvl, timestamp
       FROM historical_protocols
       ORDER BY timestamp ASC`
    );

    const historicalData = result.rows;

    const rebalanceResults: any[] = [];
    let totalLent = 0;
    let weightedSum = 0;

    historicalData.forEach((data: any) => {
      totalLent += data.tvl;
      weightedSum += data.apy * data.tvl;

      const index = totalLent > 0 ? weightedSum / totalLent : 0;

      rebalanceResults.push({
        timestamp: data.timestamp,
        protocol: data.protocol_name,
        chain: data.chain,
        stablecoin: data.stablecoin,
        apy: data.apy,
        tvl: data.tvl,
        index,
      });
    });

    // Store rebalance results in the database
    for (const result of rebalanceResults) {
      await client.query(
        `INSERT INTO ldr_index (index_value, weights, timestamp)
         VALUES ($1, $2, $3)`,
        [result.index, JSON.stringify(result), result.timestamp]
      );
    }

    return rebalanceResults;
  } finally {
    client.release();
  }
};