import { pool } from "../db/connection";

/**
 * Simulate how interest rates change when adding a specific amount of capital to the protocols.
 * @param {number} amount - The amount of capital to add.
 * @returns {Promise<any[]>} Simulation results showing the impact on interest rates.
 */
export const simulateDepth = async (amount: number): Promise<any[]> => {
  const client = await pool.connect();
  try {
    // Fetch current protocol data
    const result = await client.query(
      `SELECT protocol_name, chain, stablecoin, apy, tvl
       FROM protocols
       WHERE timestamp > NOW() - INTERVAL '1 hour'`
    );

    const protocols = result.rows;

    // Calculate the impact of adding the specified amount to each protocol
    const simulationResults = protocols.map((protocol: any) => {
      const newTvl = protocol.tvl + amount;
      const depthImpact = ((protocol.apy * protocol.tvl) / newTvl) - protocol.apy;

      return {
        protocol: protocol.protocol_name,
        chain: protocol.chain,
        stablecoin: protocol.stablecoin,
        apy: protocol.apy,
        tvl: protocol.tvl,
        depthImpact: depthImpact * 100, // Convert to percentage
      };
    });

    return simulationResults;
  } finally {
    client.release();
  }
};
