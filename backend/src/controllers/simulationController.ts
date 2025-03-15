import { Request, Response } from "express";
import { simulateDepth, simulateRebalance } from "../services/simulationService";

export const simulateInterestRateDepth = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const result = await simulateDepth(amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to simulate interest rate depth." });
  }
};

export const simulatePastRebalance = async (req: Request, res: Response) => {
  try {
    const result = await simulateRebalance();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to simulate past lending rebalance." });
  }
};