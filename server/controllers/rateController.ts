import { Request, Response, NextFunction } from "express";
import { rateService } from "../services/rateService";

class RateController {
  async getHistorical(req: Request, res: Response, next: NextFunction) {
    try {
      const { protocolId } = req.params;
      const { from, to } = req.query;

      if (!from || !to || typeof from !== "string" || typeof to !== "string") {
        res.status(400).json({ message: "Missing or invalid date range" });
        return;
      }

      const rates = await rateService.getHistoricalRates(
        parseInt(protocolId),
        from,
        to
      );
      res.json(rates);
    } catch (error) {
      next(error);
    }
  }

  async getAggregated(req: Request, res: Response, next: NextFunction) {
    try {
      const { protocolId } = req.params;
      const { from, to, interval } = req.query;

      if (!from || !to || typeof from !== "string" || typeof to !== "string") {
        res.status(400).json({ message: "Missing or invalid date range" });
        return;
      }

      const validInterval = interval === "1h" || interval === "1d" || interval === "1w" 
        ? interval 
        : "1d";

      const rates = await rateService.aggregateRates(
        parseInt(protocolId),
        from,
        to,
        validInterval
      );
      res.json(rates);
    } catch (error) {
      next(error);
    }
  }
}

export const rateController = new RateController();
