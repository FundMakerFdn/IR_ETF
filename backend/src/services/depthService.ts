import { pool } from "../db/connection";

/**
 * Simulate how interest rates change when adding a specific amount of capital to the protocols.
 * @param {number} amount - The amount of capital to add.
 * @returns {Promise<any[]>} Simulation results showing the impact on interest rates.
 */
// Function to simulate non-linear APY change based on TVL
const calculateNonLinearApy = (tvl: number, amount: number, apy: number) => {
  const newTvl = tvl + amount;
  // Apply a diminishing return effect
  const scaleFactor = 1 - Math.pow(tvl / (tvl + 1000000), 0.5); // Adjust this scale to model diminishing returns
  const newApy = apy * (1 - scaleFactor); // Calculate the new APY

  return newApy;
}
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
      const newApy = calculateNonLinearApy(protocol.tvl, amount, protocol.apy);
      const depthImpact = ((protocol.apy - newApy) / protocol.apy) * 100;

      return {
        protocol: protocol.protocol_name,
        chain: protocol.chain,
        stablecoin: protocol.stablecoin,
        apy: protocol.apy,
        tvl: protocol.tvl,
        depthImpact: depthImpact,
      };
    });

    return simulationResults;
  } finally {
    client.release();
  }
};
