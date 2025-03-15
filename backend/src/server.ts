import app from "./app";
import { logger } from "./utils/logger";
import { initializeCronJobs } from "./utils/cronJobs";
import { pool } from "./db/connection";
import { initializeDatabase } from "./db/init";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize the database
    await initializeDatabase()

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
