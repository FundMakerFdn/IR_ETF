import { pool } from "../db/connection";
import { saveWeights } from "./weightService";

export const computeAndStoreWeights = async (indexId: number) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT protocol, chain, tvl, timestamp FROM protocols WHERE timestamp > NOW() - INTERVAL '1 month'`
    );

    const protocols = result.rows;

    const latestData: any = {};
    protocols.forEach((protocol: any) => {
      const key = `${protocol.protocol}-${protocol.chain}`;
      if (!latestData[key]) latestData[key] = protocol.tvl;
    });

    const totalTvl: any = Object.values(latestData).reduce(
      (sum: any, tvl: any) => sum + tvl,
      0
    );

    const weights = Object.entries(latestData).map(([key, tvl]: [any, any]) => {
      const [protocol, chain] = key.split("-");
      return {
        protocol,
        chain,
        weight: (tvl / totalTvl) * 100,
      };
    });

    const rebalanceDate = new Date().toISOString().split("T")[0];
    await saveWeights(indexId, weights, rebalanceDate);
    return weights;
  } finally {
    client.release();
  }
};

export const fetchWeights = async (indexId: number) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT protocol_name, weight, timestamp 
       FROM index_weights 
       WHERE index_id = $1 
       ORDER BY timestamp DESC`,
      [indexId]
    );

    return result.rows;
  } finally {
    client.release();
  }
};
