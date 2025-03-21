import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./utils/errorHandler";
import indexRoutes from "./routes/indexRoutes";
import protocolRoutes from "./routes/protocolRoutes";
import simulationRoutes from "./routes/simulationRoutes";
import apyRoutes from "./routes/apyRoutes";
import weightRoutes from "./routes/weightRoutes";

import { initializeCronJobs } from "./utils/cronJobs";

const app = express();
// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/index", indexRoutes);
app.use("/api/protocols", protocolRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/apy", apyRoutes);
app.use("/api/weights", weightRoutes);

// Initialize Cron Jobs
initializeCronJobs();

// Error Handling
app.use(errorHandler);

export default app;