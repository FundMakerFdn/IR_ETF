import { Protocol, InsertProtocol, RateUpdate, DepthPoint } from "@shared/schema";
import { storage } from "../models/storage";
import { DEPTH_LEVELS, PROTOCOLS, STABLECOINS } from "../config/constants";
import { validateAmount } from "../utils/validation";
import { aaveService } from "./protocols/aaveService";
import { compoundService } from "./protocols/compoundService";

export class ProtocolService {
  async getAllProtocols(): Promise<Protocol[]> {
    let protocols = await storage.getProtocols();

    if (protocols.length === 0) {
      // Initialize with real protocol data
      await this.initializeProtocols();
      protocols = await storage.getProtocols();
    }

    return protocols;
  }

  async getProtocolById(id: number): Promise<Protocol | undefined> {
    return await storage.getProtocol(id);
  }

  async createProtocol(data: InsertProtocol): Promise<Protocol> {
    // Validate numeric values before creating
    validateAmount(Number(data.tvl));
    validateAmount(Number(data.apy));

    return await storage.createProtocol({
      ...data,
      tvl: data.tvl.toString(),
      apy: data.apy.toString()
    });
  }

  private async initializeProtocols() {
    try {
      // Initialize Aave V3
      const aaveRate = await aaveService.getLendingRate("USDC");
      const aaveTVL = await aaveService.getTotalLiquidity("USDC");

      if (aaveRate > 0 && aaveTVL > 0) {
        await this.createProtocol({
          name: PROTOCOLS.AAVE_V3,
          chain: "ethereum",
          tvl: aaveTVL.toString(),
          apy: aaveRate.toString()
        });
      }

      // Initialize Compound V3
      const compoundRate = await compoundService.getLendingRate();
      const compoundTVL = await compoundService.getTotalLiquidity();

      if (compoundRate > 0 && compoundTVL > 0) {
        await this.createProtocol({
          name: PROTOCOLS.COMPOUND_V3,
          chain: "ethereum",
          tvl: compoundTVL.toString(),
          apy: compoundRate.toString()
        });
      }
    } catch (error) {
      console.error('Error initializing protocols:', error);
      // Don't throw, allow the service to continue with empty protocols list
    }
  }

  async updateRate(update: RateUpdate): Promise<Protocol> {
    validateAmount(update.rate);

    const protocol = await this.getProtocolById(update.protocolId);
    if (!protocol) {
      throw new Error(`Protocol ${update.protocolId} not found`);
    }

    // Get real depth impact based on protocol
    let depthPoints: DepthPoint[];
    try {
      if (protocol.name === PROTOCOLS.AAVE_V3) {
        depthPoints = await aaveService.getDepthImpact("USDC", DEPTH_LEVELS);
      } else if (protocol.name === PROTOCOLS.COMPOUND_V3) {
        depthPoints = await compoundService.getDepthImpact(DEPTH_LEVELS);
      } else {
        depthPoints = DEPTH_LEVELS.map(amount => ({
          amount,
          rate: this.calculateDepthImpact(update.rate, amount)
        }));
      }
    } catch (error) {
      console.error('Error calculating depth impact:', error);
      // Fallback to simple depth calculation
      depthPoints = DEPTH_LEVELS.map(amount => ({
        amount,
        rate: this.calculateDepthImpact(update.rate, amount)
      }));
    }

    return await storage.updateProtocolRate({
      ...update,
      rate: update.rate.toString(),
      depth: depthPoints
    });
  }

  async calculateLDRI(): Promise<number> {
    const protocols = await this.getAllProtocols();
    if (protocols.length === 0) return 0;

    const totalTVL = protocols.reduce((sum, p) => sum + Number(p.tvl), 0);
    return protocols.reduce((weightedRate, protocol) => {
      const weight = Number(protocol.tvl) / totalTVL;
      return weightedRate + (Number(protocol.apy) * weight);
    }, 0);
  }

  private calculateDepthImpact(baseRate: number, amount: number): number {
    const impactFactor = 0.95 - (amount / DEPTH_LEVELS[DEPTH_LEVELS.length - 1]) * 0.1;
    return baseRate * Math.max(impactFactor, 0.85);
  }
}

export const protocolService = new ProtocolService();