import { ethers } from "ethers";
import { PROTOCOL_ADDRESSES, ASSET_ADDRESSES } from "../../config/protocols";
import { CHAINS, PROTOCOLS } from "../../config/constants";
import { DepthPoint } from "@shared/schema";

// Comprehensive ABI for Aave Pool contract
const POOL_ABI = [
  "function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
  "function getReserveNormalizedIncome(address asset) view returns (uint256)",
  "function getReservesList() view returns (address[])"
];

if (!process.env.ETH_RPC_URL) {
  throw new Error("ETH_RPC_URL environment variable is required");
}

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
const chain = CHAINS.ETHEREUM;

export class AaveService {
  private pool: ethers.Contract;

  constructor() {
    try {
      const poolAddress = PROTOCOL_ADDRESSES[PROTOCOLS.AAVE_V3][chain].POOL;
      this.pool = new ethers.Contract(poolAddress, POOL_ABI, provider);
      console.log('AaveService initialized with pool address:', poolAddress);
    } catch (error) {
      console.error('Error initializing AaveService:', error);
      throw error;
    }
  }

  async getLendingRate(asset: keyof typeof ASSET_ADDRESSES[typeof CHAINS.ETHEREUM]): Promise<number> {
    try {
      console.log('Fetching lending rate for asset:', asset);
      const assetAddress = ASSET_ADDRESSES[chain][asset];
      const reserveData = await this.pool.getReserveData(assetAddress);

      // Aave uses Ray (27 decimals) for rates
      const rateInRay = reserveData.currentLiquidityRate;
      const rateAsDecimal = Number(ethers.utils.formatUnits(rateInRay, 27));
      const annualRate = rateAsDecimal * 100; // Convert to percentage

      console.log(`Lending rate for ${asset}: ${annualRate}%`);
      return annualRate;
    } catch (error) {
      console.error(`Error fetching Aave lending rate for ${asset}:`, error);
      return 0;
    }
  }

  async getTotalLiquidity(asset: keyof typeof ASSET_ADDRESSES[typeof CHAINS.ETHEREUM]): Promise<number> {
    try {
      console.log('Fetching total liquidity for asset:', asset);
      const assetAddress = ASSET_ADDRESSES[chain][asset];
      const reserveData = await this.pool.getReserveData(assetAddress);

      // Get normalized income to calculate total aToken supply
      const normalizedIncome = await this.pool.getReserveNormalizedIncome(assetAddress);
      const rawSupply = ethers.BigNumber.from(reserveData.liquidityIndex);
      const totalSupply = rawSupply.mul(normalizedIncome).div(ethers.constants.WeiPerEther);

      // Convert to millions of units (assuming 6 decimals for stablecoins)
      const liquidityInMillions = Number(ethers.utils.formatUnits(totalSupply, 6));

      console.log(`Total liquidity for ${asset}: $${liquidityInMillions}M`);
      return liquidityInMillions;
    } catch (error) {
      console.error(`Error fetching Aave total liquidity for ${asset}:`, error);
      return 0;
    }
  }

  async getDepthImpact(
    asset: keyof typeof ASSET_ADDRESSES[typeof CHAINS.ETHEREUM],
    amounts: number[]
  ): Promise<DepthPoint[]> {
    try {
      console.log('Calculating depth impact for asset:', asset);
      const baseRate = await this.getLendingRate(asset);
      const totalLiquidity = await this.getTotalLiquidity(asset);

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
      console.error(`Error calculating Aave depth impact for ${asset}:`, error);
      return amounts.map(amount => ({ amount, rate: 0 }));
    }
  }
}

export const aaveService = new AaveService();