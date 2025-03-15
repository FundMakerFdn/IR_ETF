import { pool } from "../db/connection";

export const computeAndStoreWeights = async (indexId: number) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT protocol_name, tvl FROM protocols WHERE timestamp > NOW() - INTERVAL '1 month'`
    );

    const protocols = result.rows;

    const totalTVL = protocols.reduce((sum: number, protocol: any) => sum + protocol.tvl, 0);

    for (const protocol of protocols) {
      const weight = (protocol.tvl / totalTVL) * 100;

      await client.query(
        `INSERT INTO index_weights (index_id, protocol_name, weight, timestamp)
         VALUES ($1, $2, $3, NOW())`,
        [indexId, protocol.protocol_name, weight]
      );
    }

    return { message: "Weights computed and stored successfully." };
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