import { Request, Response } from "express";
import { storeHourlyAverageAPY, fetchHourlyAverageAPY } from "../services/apyService";

export const getHourlyAverageAPY = async (req: Request, res: Response) => {
  try {
    const hourlyAPY = await fetchHourlyAverageAPY();
    res.json(hourlyAPY);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hourly average APY." });
  }
};

export const storeHourlyAverageAPYController = async (req: Request, res: Response) => {
  try {
    const result = await storeHourlyAverageAPY();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to store hourly average APY." });
  }
};