import { Router } from "express";
import { protocolController } from "../controllers/protocolController";
import { rateController } from "../controllers/rateController";
import { errorHandler } from "../middleware/errorHandler";

const router = Router();

// Protocol routes
router.get("/protocols", protocolController.getAll);
router.post("/protocols", protocolController.create);
router.get("/protocols/:id", protocolController.getById);

// Rate routes
router.get("/rates/:protocolId", rateController.getHistorical);
router.get("/rates/:protocolId/aggregate", rateController.getAggregated);

// Apply error handling
router.use(errorHandler);

export { router as apiRouter };
