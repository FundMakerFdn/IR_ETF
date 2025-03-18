import axios from "axios";
import {
  SUBGRAPH_API_KEY,
  SUBGRAPH_IDS,
  STABLECOINS,
  CHAINS,
} from "../constant/constant";
export class ProtocolApis {
  private static async fetchSubgraphData(
    protocol: string,
    chain: string,
    subgraphId: string
  ): Promise<any[]> {
    const url = `https://gateway.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/${subgraphId}`;
    try {
      // const query = `
      // {
      //   markets {
      //     protocol
      //     name
      //     rates {
      //       type
      //       rate
      //     }
      //     totalValueLockedUSD
      //     createdTimestamp
      //   }
      // }
      // `;
      const query = `
      {
        reserves {
          id
          symbol
          decimals
          liquidityRate
          totalLiquidity
          lastUpdateTimestamp
        }
      }
    `;

      const response = await axios.post(url, { query });
      if (response.data.errors) {
        console.error(
          `GraphQL errors for ${protocol} on ${chain}:`,
          response.data.errors
        );
        return [];
      }

      //   with reserve data
      const reserves = response.data.data.reserves;
      return reserves
        .filter((reserve: any) => STABLECOINS.includes(reserve.symbol))
        .map((reserve: any) => {
          const liquidityRate = parseFloat(reserve.liquidityRate) / 1e27;
          const apy = ((1 + liquidityRate / 31536000) ** 31536000 - 1) * 100;
          const tvl =
            parseFloat(reserve.totalLiquidity) / 10 ** reserve.decimals;
          return {
            protocol,
            chain: CHAINS[chain as keyof typeof CHAINS],
            stablecoin: reserve.symbol,
            apy,
            tvl,
            interest_rate: liquidityRate * 100,
            timestamp: new Date(
              reserve.lastUpdateTimestamp * 1000
            ).toISOString(),
          };
        });

      // with markets data
      // const markets = response.data.data.markets;
      // console.log(markets);
      // return markets
      //   .filter((market: any) =>
      //     STABLECOINS.some((stablecoin) => market.name.includes(stablecoin))
      //   )
      //   .map((market: any) => {
      //     const liquidityRate =
      //       market.rates?.find((rate: any) => rate.type === "liquidity")
      //         ?.rate || 0;
      //     console.log(market.rates);
      //     const adjustedLiquidityRate = parseFloat(liquidityRate) / 1e27;
      //     const apy =
      //       ((1 + adjustedLiquidityRate / 31536000) ** 31536000 - 1) * 100;
      //     const tvl = parseFloat(market.totalValueLockedUSD);
      //     const stablecoin =
      //       STABLECOINS.find((s) => market.name.includes(s)) || "";
      //     return {
      //       protocol,
      //       chain: CHAINS[chain as keyof typeof CHAINS],
      //       stablecoin: stablecoin,
      //       apy,
      //       tvl,
      //       interest_rate: adjustedLiquidityRate * 100,
      //       timestamp: new Date(market.createdTimestamp * 1000).toISOString(),
      //     };
      //   });
    } catch (error) {
      console.error(`Error fetching ${protocol} data on ${chain}:`, error);
      return [];
    }
  }

  private static async fetchAaveV3Data(): Promise<any[]> {
    const promises = Object.entries(SUBGRAPH_IDS.AAVE_V3).map(([chain, id]) =>
      this.fetchSubgraphData("Aave V3", chain, id)
    );
    const results = await Promise.all(promises);
    return results.flat();
  }

  private static async fetchAaveV2Data(): Promise<any[]> {
    const promises = Object.entries(SUBGRAPH_IDS.AAVE_V2).map(([chain, id]) =>
      this.fetchSubgraphData("Aave V2", chain, id)
    );
    const results = await Promise.all(promises);
    return results.flat();
  }

  private static async fetchCompoundV3Data(): Promise<any[]> {
    const promises = Object.entries(SUBGRAPH_IDS.COMPOUND_V3).map(
      ([chain, id]) => this.fetchSubgraphData("Compound V3", chain, id)
    );
    const results = await Promise.all(promises);
    return results.flat();
  }

  private static async fetchMorphoData(): Promise<any[]> {
    const promises = Object.entries(SUBGRAPH_IDS.MORPHO).map(([chain, id]) =>
      this.fetchSubgraphData("Morpho", chain, id)
    );
    const results = await Promise.all(promises);
    return results.flat();
  }

  private static async fetchVenusData(): Promise<any[]> {
    const promises = Object.entries(SUBGRAPH_IDS.VENUS).map(([chain, id]) =>
      this.fetchSubgraphData("Venus", chain, id)
    );
    const results = await Promise.all(promises);
    return results.flat();
  }

  private static async fetchFluidData(): Promise<any[]> {
    const promises = Object.entries(SUBGRAPH_IDS.FLUID).map(([chain, id]) =>
      this.fetchSubgraphData("Fluid", chain, id)
    );
    const results = await Promise.all(promises);
    return results.flat();
  }

  private static async fetchSparkData(): Promise<any[]> {
    const promises = Object.entries(SUBGRAPH_IDS.SPARK).map(([chain, id]) =>
      this.fetchSubgraphData("Spark", chain, id)
    );
    const results = await Promise.all(promises);
    return results.flat();
  }

  /**
   * Fetch data from all supported DeFi protocols.
   * @returns {Promise<any[]>} Combined data from all protocols.
   */
  public static async fetchAllProtocols(): Promise<any[]> {
    try {
      const [
        aaveV3Data,
        aaveV2Data,
        compoundV3Data,
        morphoData,
        venusData,
        fluidData,
        sparkData,
      ] = await Promise.all([
        this.fetchAaveV3Data(),
        this.fetchAaveV2Data(),
        this.fetchCompoundV3Data(),
        this.fetchMorphoData(),
        this.fetchVenusData(),
        this.fetchFluidData(),
        this.fetchSparkData(),
      ]);

      const allData = [
        ...aaveV3Data,
        ...aaveV2Data,
        ...compoundV3Data,
        ...morphoData,
        ...venusData,
        ...fluidData,
        ...sparkData,
      ];

      return allData;
    } catch (error) {
      console.error("Failed to fetch data from DeFi protocols:", error);
      throw new Error("Unable to fetch data from DeFi protocols.");
    }
  }
}
