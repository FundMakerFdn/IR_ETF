import { ethers } from "ethers";
import { PROTOCOL_ADDRESSES } from "../../config/protocols";
import { CHAINS, PROTOCOLS } from "../../config/constants";
import { DepthPoint } from "@shared/schema";

// Comprehensive ABI for Compound's Comet (cUSDCv3) contract
const COMET_ABI = [
  "function baseToken() view returns (address)",
  "function baseTokenPriceFeed() view returns (address)",
  "function getSupplyRate(uint utilization) view returns (uint64)",
  "function getUtilization() view returns (uint)",
  "function totalSupply() view returns (uint256)",
  "function baseScale() view returns (uint256)",
  "function baseIndexScale() view returns (uint256)",
  "function trackingIndexScale() view returns (uint256)"
];

if (!process.env.ETH_RPC_URL) {
  throw new Error("ETH_RPC_URL environment variable is required");
}

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);

export class CompoundService {
  private async getComet(): Promise<ethers.Contract> {
    try {
      const cometAddress = PROTOCOL_ADDRESSES[PROTOCOLS.COMPOUND_V3][CHAINS.ETHEREUM].COMET_USDC;
      console.log('Initializing Compound contract at address:', cometAddress);
      return new ethers.Contract(cometAddress, COMET_ABI, provider);
    } catch (error) {
      console.error('Error initializing Compound contract:', error);
      throw error;
    }
  }

  async getLendingRate(): Promise<number> {
    try {
      console.log('Fetching Compound lending rate');
      const comet = await this.getComet();

      // Get current utilization
      const utilization = await comet.getUtilization();
      console.log('Current utilization:', ethers.utils.formatUnits(utilization, 18));

      // Get supply rate based on current utilization
      const supplyRate = await comet.getSupplyRate(utilization);

      // Convert to annual percentage (Compound uses 1e18 scale)
      const ratePerSecond = Number(ethers.utils.formatUnits(supplyRate, 18));
      const annualRate = ratePerSecond * 365.25 * 24 * 60 * 60 * 100;

      console.log('Compound annual lending rate:', annualRate, '%');
      return annualRate;
    } catch (error) {
      console.error('Error fetching Compound lending rate:', error);
      return 0;
    }
  }

  async getTotalLiquidity(): Promise<number> {
    try {
      console.log('Fetching Compound total liquidity');
      const comet = await this.getComet();
      const totalSupply = await comet.totalSupply();
      const baseScale = await comet.baseScale();

      // Convert to millions (USDC has 6 decimals)
      const liquidity = ethers.utils.formatUnits(
        totalSupply.mul(baseScale).div(ethers.constants.WeiPerEther),
        6
      );
      const liquidityInMillions = Number(liquidity);

      console.log('Compound total liquidity:', liquidityInMillions, 'M');
      return liquidityInMillions;
    } catch (error) {
      console.error('Error fetching Compound total liquidity:', error);
      return 0;
    }
  }

  async getDepthImpact(amounts: number[]): Promise<DepthPoint[]> {
    try {
      console.log('Calculating Compound depth impact');
      const baseRate = await this.getLendingRate();
      const totalLiquidity = await this.getTotalLiquidity();

      return amounts.map(amount => {
        // Calculate impact based on amount relative to total liquidity
        const impactFactor = 1 - (amount / (amount + totalLiquidity));
        const adjustedRate = baseRate * impactFactor;

        return {
          amount,
          rate: Math.max(adjustedRate, baseRate * 0.5) // Ensure rate doesn't drop below 50% of base rate
        };
      });
    } catch (error) {
      console.error('Error calculating Compound depth impact:', error);
      return amounts.map(amount => ({ amount, rate: 0 }));
    }
  }
}

export const compoundService = new CompoundService();