import dotenv from "dotenv";

dotenv.config();

const config = {
  database: {
    poolSize: parseInt(process.env.DB_POOL_SIZE || "10", 10),
  },
  server: {
    port: parseInt(process.env.PORT || "5000", 10),
    host: process.env.HOST || "localhost",
  },
  apiKeys: {
    defiPulse: process.env.DEFI_PULSE_API_KEY || "",
  },
  cronJobs: {
    hourlyAPYCalculation: process.env.CRON_HOURLY_APY || "0 * * * *",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
  environment: process.env.NODE_ENV || "development",
};

export default config;
