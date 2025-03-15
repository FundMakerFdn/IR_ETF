import { pool } from "../db/connection";

/**
 * Fetch all indices from the database.
 * @returns {Promise<any[]>} List of indices.
 */
export const fetchIndices = async (): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, index_value, weights, timestamp
       FROM ldr_index
       ORDER BY timestamp DESC`
    );
    return result.rows;
  } finally {
    client.release();
  }
};

/**
 * Fetch details of a specific index by its ID.
 * @param {number} indexId - The ID of the index to fetch.
 * @returns {Promise<any>} Index details.
 */
export const fetchIndexDetails = async (indexId: number): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, index_value, weights, timestamp
       FROM ldr_index
       WHERE id = $1`,
      [indexId]
    );
    if (result.rows.length === 0) {
      throw new Error(`Index with ID ${indexId} not found.`);
    }
    return result.rows[0];
  } finally {
    client.release();
  }
};
