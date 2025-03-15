import { computeAndStoreWeights } from "./weightCalculator";

export const rebalanceWeights = async (indexId: number) => {
  // Rebalance weights by computing and storing them
  return await computeAndStoreWeights(indexId);
};