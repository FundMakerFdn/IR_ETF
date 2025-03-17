export const SUBGRAPH_API_KEY = process.env.SUBGRAPH_API_KEY || "a91ea186d50f7e8629fc84d3acdf75d2";

export const SUBGRAPH_IDS = {
  AAVE_V3: {
    ETHEREUM: "Cd2gEDVeqnjBn1hSeqFMitw8Q1iiyV9FYUZkLNRcL87g",
    ARBITRUM: "4xyasjQeREe7PxnF6wVdobZvCw5mhoHZq3T7guRpuNPf",
    FANTOM: "ZcLcVKJNQboeqACXhGuL3WFLBZzf5uUWheNsaFvLph6",
    OPTIMISM: "3RWFxWNstn4nP3dXiDfKi9GgBoHx7xzc7APkXs1MLEgi",
    POLYGON: "6yuf1C49aWEscgk5n9D1DekeG1BCk5Z9imJYJT3sVmAT",
    SCROLL: "74JwenoHZb2aAYVGCCSdPWzi9mm745dyHyQQVoZ7Sbub",
    ZKSYNC: "E6WWZPbQLLV72QeQPhGPZU8Fgp3xto3WqcBSebgPGBou",
  },
  AAVE_V2: {
    ETHEREUM: "C2zniPn45RnLDGzVeGZCx2Sw3GXrbc9gL4ZfL8B8Em2j",
    POLYGON: "GrZQJ7sWdTqiNUD8Vh2THaeBM4wGwiF8mFv9FBfyzwxm",
  },
  COMPOUND_V3: {
    ETHEREUM: "AwoxEZbiWLvv6e3QdvdMZw4WDURdGbvPfHmZRc8Dpfz9",
    ARBITRUM: "5MjRndNWGhqvNX7chUYLQDnvEgc8DaH8eisEkcJt71SR",
    POLYGON: "5wfoWBpfYv59b99wDxJmyFiKBu9brXESeqJAzw8WP5Cz",
    SCROLL: "GPe7ULSUqftERXs5nmvFEvf1uL1yGQF8WdbE8tPVrUbv",
    OPTIMISM: "FhHNkfh5z6Z2WCEBxB6V3s8RPxnJfWZ9zAfM5bVvbvbb"
  },
  MORPHO: {
    ETHEREUM: "DsznTYxGdsqxWB6a474rSksvB7qWSth5Ff1PcxW28vZy",
    ARBITRUM: "XsJn88DNCHJ1kgTqYeTgHMQSK4LuG1LR75339QVeQ26",
    OPTIMISM: "i5y8d3K3vVCR7r5YwANGCjupLc3hUge54XvhYMEq3Jmq1",
    POLYGON: "EhFokmwryNs7qbvostceRqVdjc3petuD13mmdUiMBw8Y",
    SCROLL: "Aic7prLAxhtipUEbLu5BhDDWf4LssT9n3DG4fT9yCRqm",
  },
  VENUS: {
    ARBITRUM: "3EndsjpSDeZRRVM1SFC6Bc6KjmMPe1GyAre5BpbFbVXT",
    ETHEREUM: "33SALoS8mD2PxLR2utd6TXBekhp3Ra3T3uCyHks5wV3W",
    OPTIMISM: "4WESjRqo3TcdL3eUCTbbT4h2dLFwn3sKVi4PdWJDC118",
    ZKSYNC: "DMFmZ58VgyZRjmTcQjkPyPcHwk4cRaQZKJcnmocu7s6X",
  },
  FLUID: {
    ETHEREUM: "fluid-ethereum-subgraph-id",
  },
  SPARK: {
    ETHEREUM: "GbKdmBe4ycCYCQLQSjqGg6UHYoYfbyJyq5WrG35pv1si",
  },
};

export const STABLECOINS = ["USDT", "USDC", "DAI"];
export const CHAINS = {
  ETHEREUM: "Ethereum",
  ARBITRUM: "Arbitrum One",
  FANTOM: "Fantom",
  OPTIMISM: "Optimism",
  POLYGON: "Polygon",
  SCROLL: "Scroll",
  ZKSYNC: "zkSync",
  BSC: "BSC",
};