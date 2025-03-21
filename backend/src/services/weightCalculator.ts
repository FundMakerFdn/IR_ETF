import { pool } from "../db/connection";
import { saveWeights } from "./weightService";

export const computeAndStoreWeights = async (indexId: number) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT protocol_name as protocol, chain, stablecoin, tvl, timestamp FROM protocols WHERE timestamp > NOW() - INTERVAL '1 month'`
    );

    const protocols = result.rows;

    const latestData: any = {};
    protocols.forEach((protocol: any) => {
      const key = `${protocol.protocol}-${protocol.chain}-${protocol.stablecoin}`;
      if (!latestData[key]) latestData[key] = protocol.tvl;
    });
    const totalTvl: any = Object.values(latestData).reduce(
      (sum: any, tvl: any) => sum + tvl * 1,
      0
    );

    const weights = Object.entries(latestData).map(([key, tvl]: [any, any]) => {
      const [protocol, chain, stablecoin] = key.split("-");
      return {
        protocol,
        chain,
        stablecoin,
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
      `SELECT protocol_name, chain, stablecoin, weight, timestamp 
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
