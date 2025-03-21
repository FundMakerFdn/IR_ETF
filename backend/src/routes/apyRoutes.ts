import express from "express";
import { getHourlyAverageAPY, getHourlyAverageAPYs, storeHourlyAverageAPYController } from "../controllers/apyController";

const router = express.Router();

router.get("/hourly", getHourlyAverageAPY);
router.get("/getHourlyAPYs", getHourlyAverageAPYs);
router.post("/hourly/store", storeHourlyAverageAPYController);

export default router;