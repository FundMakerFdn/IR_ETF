import cron from "node-cron";
import { storeHourlyAverageAPY } from "../services/apyService";
import { logger } from "./logger";
import { ProtocolApis } from "../services/protocolApis";
import { saveToPostgres } from "../services/protocolService";
import { rebalanceWeights } from "../services/rebalanceService";

// Schedule a cron job to run every hour
export const initializeCronJobs = async () => {
  cron.schedule("0 * * * *", async () => {
    logger.info("Starting hourly average APY calculation...");
    try {
      const result = await storeHourlyAverageAPY();
      logger.info("Hourly average APY stored successfully:", result);
    } catch (error) {
      logger.error("Failed to store hourly average APY:", error);
    }
  });

  cron.schedule("* * * * *", async () => {
    const data = await ProtocolApis.fetchAllProtocols();
    await saveToPostgres(data);
    console.log("Fetched and stored 1-hour data");
  });

  
  // Schedule monthly rebalance
  cron.schedule("0 0 1 * *", () => rebalanceWeights(1)); // Every 1st of the month
  
  cron.schedule("0 * * * *", async () => {
    const data = await ProtocolApis.fetchAllProtocols();
    await saveToPostgres(data);
    console.log("Fetched and stored 1-hour data");
  });

  logger.info("Cron jobs initialized.");
};
