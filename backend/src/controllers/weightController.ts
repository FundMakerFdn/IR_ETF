import { Request, Response } from "express";
import { computeAndStoreWeights, fetchWeights } from "../services/weightCalculator";

export const getWeights = async (req: Request, res: Response) => {
  try {
    const indexId = parseInt(req.params.id);
    const weights = await fetchWeights(indexId);
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weights." });
  }
};

export const addWeightsController = async (req: Request, res: Response) => {
  try {
    const { indexId } = req.body;
    const result = await computeAndStoreWeights(indexId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add weights." });
  }
};