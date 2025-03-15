import { pool } from "../db/connection";
import { ProtocolApis } from "./protocolApis";

export const fetchProtocols = async () => {
  // Fetch live protocol data from external APIs
  const protocols = await fetchLiveProtocolData();

  // Fetch historical protocol data from external APIs
  const historicalProtocols = await fetchHistoricalProtocolData();
  // Store live and historical data in the database
  const client = await pool.connect();
  try {
    for (const protocol of protocols) {
      await client.query(
        `INSERT INTO protocols (protocol_name, chain, stablecoin, apy, tvl, timestamp)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [protocol.protocol, protocol.chain, protocol.stablecoin, protocol.apy, protocol.tvl]
      );
    }

    for (const historicalProtocol of historicalProtocols) {
      await client.query(
        `INSERT INTO historical_protocols (protocol_name, chain, stablecoin, apy, tvl, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          historicalProtocol.protocol,
          historicalProtocol.chain,
          historicalProtocol.stablecoin,
          historicalProtocol.apy,
          historicalProtocol.tvl,
          historicalProtocol.timestamp,
        ]
      );
    }
  } finally {
    client.release();
  }

  return protocols;
};

export const fetchLiveProtocolData = async () => {
  // Fetch live protocol data from external APIs
  const liveData = await ProtocolApis.fetchAllProtocols();
  return liveData;
};

export const fetchHistoricalProtocolData = async () => {
  // Fetch historical protocol data from the database
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT protocol_name, chain, stablecoin, apy, tvl, timestamp
       FROM historical_protocols
       ORDER BY timestamp DESC`
    );
    return result.rows;
  } finally {
    client.release();
  }
};

export const fetchHistoricalProtocols = async () => {
  // Fetch historical protocol data from the database
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT protocol_name, chain, stablecoin, apy, tvl, timestamp
       FROM historical_protocols
       ORDER BY timestamp DESC`
    );
    return result.rows;
  } finally {
    client.release();
  }
};