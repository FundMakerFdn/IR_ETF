import cron from 'node-cron'
import { storeHourlyAverageAPY } from "../services/apyService";
import { logger } from "./logger";

// Schedule a cron job to run every hour
export const initializeCronJobs = () => {
  cron.schedule("0 * * * *", async () => {
    logger.info("Starting hourly average APY calculation...");
    try {
      const result = await storeHourlyAverageAPY();
      logger.info("Hourly average APY stored successfully:", result);
    } catch (error) {
      logger.error("Failed to store hourly average APY:", error);
    }
  });

  logger.info("Cron jobs initialized.");
};