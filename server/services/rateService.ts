import { HistoricalRate, InsertHistoricalRate } from "@shared/schema";
import { storage } from "../models/storage";
import { validateDateRange } from "../utils/validation";

export class RateService {
  async getHistoricalRates(
    protocolId: number,
    fromDate: string,
    toDate: string
  ): Promise<HistoricalRate[]> {
    const { from, to } = validateDateRange(fromDate, toDate);
    return await storage.getHistoricalRates(protocolId, from, to);
  }

  async addHistoricalRate(rate: InsertHistoricalRate): Promise<HistoricalRate> {
    return await storage.addHistoricalRate(rate);
  }

  async aggregateRates(
    protocolId: number,
    fromDate: string,
    toDate: string,
    interval: "1h" | "1d" | "1w" = "1d"
  ): Promise<{ timestamp: Date; rate: number }[]> {
    const { from, to } = validateDateRange(fromDate, toDate);
    const rates = await storage.getHistoricalRates(protocolId, from, to);
    
    // Group rates by interval and calculate average
    const groupedRates = new Map<string, number[]>();
    
    rates.forEach((rate) => {
      const key = this.getIntervalKey(rate.timestamp, interval);
      const current = groupedRates.get(key) || [];
      groupedRates.set(key, [...current, Number(rate.rate)]);
    });

    return Array.from(groupedRates.entries()).map(([key, rates]) => ({
      timestamp: new Date(key),
      rate: rates.reduce((sum, rate) => sum + rate, 0) / rates.length
    }));
  }

  private getIntervalKey(date: Date, interval: "1h" | "1d" | "1w"): string {
    const d = new Date(date);
    switch (interval) {
      case "1h":
        d.setMinutes(0, 0, 0);
        break;
      case "1d":
        d.setHours(0, 0, 0, 0);
        break;
      case "1w":
        d.setDate(d.getDate() - d.getDay());
        d.setHours(0, 0, 0, 0);
        break;
    }
    return d.toISOString();
  }
}

export const rateService = new RateService();
