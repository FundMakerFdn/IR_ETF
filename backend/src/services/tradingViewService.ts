import axios from "axios";

/**
 * Service for generating TradingView-compatible data feeds.
 */
export class TradingViewService {
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
      const response = await axios.get(`${process.env.BACKEND_API_URL}/api/index/historical`);
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
      const response = await axios.get(`${process.env.BACKEND_API_URL}/api/index/realtime`);
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
