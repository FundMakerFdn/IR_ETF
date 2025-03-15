import { Request, Response } from "express";
import { fetchProtocols, fetchHistoricalProtocols } from "../services/dataFetcher";

export const getProtocols = async (req: Request, res: Response) => {
  try {
    const protocols = await fetchProtocols();
    res.json(protocols);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch protocol data." });
  }
};

export const getHistoricalProtocols = async (req: Request, res: Response) => {
  try {
    const historicalData = await fetchHistoricalProtocols();
    res.json(historicalData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch historical protocol data." });
  }
};