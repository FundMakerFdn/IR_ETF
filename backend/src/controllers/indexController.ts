import { Request, Response } from "express";
import { fetchIndices, fetchIndexDetails } from "../services/indexService";
import { calculateLDRIndex } from "../services/indexCalculator";

export const getIndices = async (req: Request, res: Response) => {
  try {
    const indices = await fetchIndices();
    res.json(indices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch indices." });
  }
};

export const getIndexDetails = async (req: Request, res: Response) => {
  try {
    const indexId = parseInt(req.params.id);
    const indexDetails = await fetchIndexDetails(indexId);
    res.json(indexDetails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch index details." });
  }
};

export const calculateIndex = async (req: Request, res: Response) => {
  try {
    const result = await calculateLDRIndex();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate LDR Index." });
  }
};