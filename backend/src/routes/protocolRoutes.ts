import express from "express";
import { getProtocols, getHistoricalProtocols } from "../controllers/protocolController";

const router = express.Router();

router.get("/", getProtocols);
router.get("/historical", getHistoricalProtocols);

// New endpoint to fetch protocol weights
import { getWeights, addWeightsController } from "../controllers/weightController";
router.get("/weights/:id", getWeights);
router.post("/weights", addWeightsController);

export default router;