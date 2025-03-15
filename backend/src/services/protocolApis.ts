import axios from "axios";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();
const AAVE_V3_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/aave/protocol-v3";
/**
 * Service for interacting with protocol-specific APIs to fetch data from various DeFi protocols.
 */

// Infura Ethereum Mainnet RPC URL
const INFURA_URL = `https://mainnet.infura.io/v3/c5f77a043edb4e13be81bcd7f2e4e355`;

// Connect to Ethereum provider (via Infura)
const provider = new ethers.JsonRpcProvider(INFURA_URL);

// Aave V3 Pool Data Provider contract (Mainnet)
const AAVE_V3_DATA_PROVIDER = "0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3"; // Aave V3 Ethereum Mainnet Data Provider

// Aave Pool Data ABI (Only relevant function)
const AAVE_DATA_PROVIDER_ABI = [
  "function getReservesList() view returns (address[])",
  "function getReserveData(address asset) view returns (uint256, uint128, uint128, uint128, uint128, uint128, uint40, uint16)",
];

// Initialize contract instance
const aaveDataProvider = new ethers.Contract(
  AAVE_V3_DATA_PROVIDER,
  AAVE_DATA_PROVIDER_ABI,
  provider
);
export class ProtocolApis {
  private static async fetchAaveData(): Promise<any[]> {
    // try {
    //   const response = await axios.get("https://api.aave.com/v1/protocols");
    //   return response.data.map((protocol: any) => ({
    //     protocol: "Aave",
    //     chain: protocol.chain,
    //     stablecoin: protocol.stablecoin,
    //     apy: protocol.apy,
    //     tvl: protocol.tvl,
    //   }));
    // } catch (error) {
    //   console.error("Failed to fetch data from Aave API:", error);
    //   throw new Error("Unable to fetch data from Aave API.");
    // }

    // Aave V3 Subgraph API (Example: Polygon)
    try {
      console.log("Fetching Aave V3 reserves...");

      // Fetch all reserve addresses
      const reserves = await aaveDataProvider.getReservesList();

      // Iterate over each reserve and fetch its data
      const reserveData: any[] = await Promise.all(
        reserves.map(async (asset: any) => {
          const data = await aaveDataProvider.getReserveData(asset);

          return {
            protocol: "Aave V3",
            chain: "Ethereum", // Since we're fetching from Ethereum mainnet
            stablecoin: asset, // You may need a mapping to get actual names like USDC, DAI, etc.
            apy: Number(data[2]) / 1e27, // Convert to percentage
            tvl: Number(data[4]) / 1e18, // Convert to human-readable TVL
          };
        })
      );

      return reserveData;
    } catch (error) {
      console.error("Error fetching Aave reserves:", error);
      return []
    }
  }

  private static async fetchCompoundData(): Promise<any[]> {
    return [];
    try {
      const response = await axios.get(
        "https://api.compound.finance/v2/ctokens"
      );
      return response.data.cToken.map((token: any) => ({
        protocol: "Compound",
        chain: "Ethereum",
        stablecoin: token.underlying_symbol,
        apy: parseFloat(token.supply_rate.value) * 100,
        tvl:
          parseFloat(token.total_supply.value) *
          parseFloat(token.exchange_rate.value),
      }));
    } catch (error) {
      console.error("Failed to fetch data from Compound API:", error);
      throw new Error("Unable to fetch data from Compound API.");
    }
  }

  private static async fetchMakerData(): Promise<any[]> {
    return [];
    try {
      const response = await axios.get("https://api.makerdao.com/v1/vaults");
      return response.data.map((vault: any) => ({
        protocol: "MakerDAO",
        chain: "Ethereum",
        stablecoin: vault.collateral_type,
        apy: vault.stability_fee * 100,
        tvl: vault.total_collateral_value,
      }));
    } catch (error) {
      console.error("Failed to fetch data from MakerDAO API:", error);
      throw new Error("Unable to fetch data from MakerDAO API.");
    }
  }

  /**
   * Fetch data from all supported DeFi protocols.
   * @returns {Promise<any[]>} Combined data from all protocols.
   */
  public static async fetchAllProtocols(): Promise<any[]> {
    try {
      const [aaveData, compoundData, makerData] = await Promise.all([
        this.fetchAaveData(),
        this.fetchCompoundData(),
        this.fetchMakerData(),
      ]);

      return [...aaveData, ...compoundData, ...makerData];
    } catch (error) {
      console.error("Failed to fetch data from DeFi protocols:", error);
      throw new Error("Unable to fetch data from DeFi protocols.");
    }
  }
}
