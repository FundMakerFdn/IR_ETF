import express from "express";
import { simulateInterestRateDepth, simulatePastRebalance } from "../controllers/simulationController";

const router = express.Router();

router.post("/depth", simulateInterestRateDepth);
router.get("/rebalance", simulatePastRebalance);

export default router;