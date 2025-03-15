import { Protocol } from "./protocolModel";

export interface LDRIndex {
  index: number;
  protocols: Protocol[];
  stablecoins: Stablecoin[];
  historicalData: HistoricalData[];
}

export interface Stablecoin {
  name: string;
  symbol: string;
  chain: string;
}

export interface HistoricalData {
  timestamp: Date;
  indexValue: number;
  protocolDetails: Protocol[];
}