export interface Protocol {
  protocol: string;
  chain: string;
  stablecoin: string;
  apy: number;
  tvl: number;
  historicalData?: { timestamp: string; apy: number; tvl: number }[];
}