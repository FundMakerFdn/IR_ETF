import axios from "axios";
import { pool } from "../db/connection";
/**
 * Service for generating TradingView-compatible data feeds.
 */
export class TradingViewService {
  private static async getTradingViewData(timeframe: any) {
    const client = await pool.connect();
    try {
      const interval =
        timeframe === "1h"
          ? "1 hour"
          : timeframe === "1d"
          ? "1 day"
          : "1 minute";
      const { rows } = await client.query(
        `SELECT 
           date_trunc($1, timestamp) AS time,
           AVG(tvl) AS open,
           MAX(tvl) AS high,
           MIN(tvl) AS low,
           AVG(tvl) AS close
         FROM protocols_data
         GROUP BY date_trunc($1, timestamp)
         ORDER BY time`,
        [interval]
      );
      return rows.map((row: any) => ({
        time: new Date(row.time).getTime() / 1000,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
      }));
    } finally {
      client.release();
    }
  }

  // app.get('/tv-data/:timeframe', async (req, res) => {
  //   const data = await getTradingViewData(req.params.timeframe);
  //   res.json(data);
  // });
  private static formatDataForTradingView(data: any[]): any[] {
    return data.map((entry) => ({
      time: new Date(entry.timestamp).getTime() / 1000, // Convert to UNIX timestamp in seconds
      value: entry.index_value,
    }));
  }

  /**
   * Fetch historical LDRI Index data from the database.
   * @returns {Promise<any[]>} TradingView-compatible data feed.
   */
  public static async fetchHistoricalIndexData(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${process.env.BACKEND_API_URL}/api/index/historical`
      );
      const formattedData = this.formatDataForTradingView(response.data);
      return formattedData;
    } catch (error) {
      console.error("Failed to fetch historical index data:", error);
      throw new Error("Unable to fetch historical index data.");
    }
  }

  /**
   * Fetch real-time LDRI Index data from the database.
   * @returns {Promise<any>} Latest index value in TradingView-compatible format.
   */
  public static async fetchRealTimeIndexData(): Promise<any> {
    try {
      const response = await axios.get(
        `${process.env.BACKEND_API_URL}/api/index/realtime`
      );
      const latestData = response.data;
      return {
        time: new Date(latestData.timestamp).getTime() / 1000, // Convert to UNIX timestamp in seconds
        value: latestData.index_value,
      };
    } catch (error) {
      console.error("Failed to fetch real-time index data:", error);
      throw new Error("Unable to fetch real-time index data.");
    }
  }
}
