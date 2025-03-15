import express from "express";
import { getWeights, addWeightsController } from "../controllers/weightController";

const router = express.Router();

router.get("/:id", getWeights);
router.post("/add", addWeightsController);

export default router;