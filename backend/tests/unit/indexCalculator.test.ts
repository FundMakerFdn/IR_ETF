import { calculateLDRIndex } from "../../src/services/indexCalculator";

jest.mock("../../src/services/dataFetcher", () => ({
  fetchProtocols: jest.fn().mockResolvedValue([
    { protocol: "Aave V3", chain: "Ethereum", apy: 3.5, tvl: 1000000000 },
    { protocol: "Compound V3", chain: "Ethereum", apy: 2.8, tvl: 800000000 }
  ])
}));

describe("calculateLDRIndex", () => {
  it("should calculate the LDR Index correctly", async () => {
    const result = await calculateLDRIndex();
    expect(result.index).toBeCloseTo(3.2, 1); // Weighted average
    expect(result.protocols).toHaveLength(2);
  });
});