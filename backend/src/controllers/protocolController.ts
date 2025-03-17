import { Request, Response } from "express";
import { fetchProtocols, fetchHistoricalProtocolData } from "../services/dataFetcher";

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
    const historicalData = await fetchHistoricalProtocolData();
    res.json(historicalData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch historical protocol data." });
  }
};