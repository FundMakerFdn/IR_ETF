import express from "express";
import { getHourlyAverageAPY, storeHourlyAverageAPYController } from "../controllers/apyController";

const router = express.Router();

router.get("/hourly", getHourlyAverageAPY);
router.post("/hourly/store", storeHourlyAverageAPYController);

export default router;