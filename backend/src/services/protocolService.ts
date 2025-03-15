import axios from "axios";
import { pool } from "../db/connection";

/**
 * Fetch protocol data from external APIs.
 * @returns {Promise<any[]>} List of protocols with their details.
 */
export const fetchProtocolDataFromAPI = async (): Promise<any[]> => {
  try {
    const response = await axios.get("https://api.defipulse.com/api/v1/protocols", {
      params: {
        apiKey: process.env.DEFI_PULSE_API_KEY,
      },
    });

    return response.data.map((protocol: any) => ({
      protocol_name: protocol.name,
      chain: protocol.chain,
      stablecoin: protocol.stablecoin,
      apy: protocol.apy,
      tvl: protocol.tvl,
    }));
  } catch (error) {
    console.error("Failed to fetch protocol data from API:", error);
    throw new Error("Unable to fetch protocol data from external API.");
  }
};

/**
 * Store protocol data in the database.
 * @param {any[]} protocols - List of protocol data to store.
 */
export const storeProtocolDataInDB = async (protocols: any[]): Promise<void> => {
  const client = await pool.connect();
  try {
    for (const protocol of protocols) {
      await client.query(
        `INSERT INTO protocols (protocol_name, chain, stablecoin, apy, tvl, timestamp)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (protocol_name, chain, stablecoin)
         DO UPDATE SET apy = EXCLUDED.apy, tvl = EXCLUDED.tvl, timestamp = EXCLUDED.timestamp`,
        [protocol.protocol_name, protocol.chain, protocol.stablecoin, protocol.apy, protocol.tvl]
      );
    }
  } catch (error) {
    console.error("Failed to store protocol data in the database:", error);
    throw new Error("Unable to store protocol data in the database.");
  } finally {
    client.release();
  }
};

/**
 * Fetch and store protocol data from external APIs.
 * @returns {Promise<any[]>} List of protocols with their details.
 */
export const fetchAndStoreProtocolData = async (): Promise<any[]> => {
  const protocols = await fetchProtocolDataFromAPI();
  await storeProtocolDataInDB(protocols);
  return protocols;
};
