// Mock data for the allocation chart
export type AssetAllocation = {
  date: string;
  timestamp: number;
  blockNumber: number;
  "Compound v3 USDC": number;
  "Moonwell USDC": number;
  "Fluid USDC": number;
  "Morpho Ionic Ecosystem USDC": number;
  "Morpho Seamless USDC Vault": number;
  "Morpho wstETH/USDC": number;
  "Morpho cbETH/USDC": number;
  "Morpho WETH/USDC": number;
  "Morpho cbBTC/USDC": number;
  total: number;
};

// Generate dates for February and March 2023
const generateDates = (startDate: Date, days: number): Date[] => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });
};

const startDate = new Date(2023, 1, 15); // Feb 15, 2023
const dates = generateDates(startDate, 35); // Generate 35 days of data

// Generate random allocation data
export const generateMockData = (): AssetAllocation[] => {
  let blockNumber = 28980000;

  return dates.flatMap((date) => {
    // Generate multiple data points per day (every 1 hour)
    return Array.from({ length: 24 }, (_, i) => {
      const hours = i;
      const newDate = new Date(date);
      newDate.setHours(hours);

      // Random allocation values that stack up
      const compound = Math.random() * 200000;
      const moonwell = Math.random() * 150000;
      const fluid = Math.random() * 180000;
      const morphoIonic = Math.random() * 120000;
      const morphoSeamless = Math.random() * 100000;
      const morphoWstEth = Math.random() * 250000;
      const morphoCbEth = Math.random() * 200000;
      const morphoWeth = Math.random() * 220000;
      const morphoCbBtc = Math.random() * 300000;

      const total =
        compound +
        moonwell +
        fluid +
        morphoIonic +
        morphoSeamless +
        morphoWstEth +
        morphoCbEth +
        morphoWeth +
        morphoCbBtc;

      blockNumber += Math.floor(Math.random() * 20) + 10;

      return {
        date: newDate.toISOString(),
        timestamp: newDate.getTime(),
        blockNumber,
        "Compound v3 USDC": compound,
        "Moonwell USDC": moonwell,
        "Fluid USDC": fluid,
        "Morpho Ionic Ecosystem USDC": morphoIonic,
        "Morpho Seamless USDC Vault": morphoSeamless,
        "Morpho wstETH/USDC": morphoWstEth,
        "Morpho cbETH/USDC": morphoCbEth,
        "Morpho WETH/USDC": morphoWeth,
        "Morpho cbBTC/USDC": morphoCbBtc,
        total,
      };
    });
  });
};

export const mockData = generateMockData();

export const assetColors: any = {
  "Compound v3 USDC": "#4ade80",
  "Moonwell USDC": "#2563eb",
  "Fluid USDC": "#60a5fa",
  "Morpho Ionic Ecosystem USDC": "#0f172a",
  "Morpho Seamless USDC Vault": "#475569",
  "Morpho wstETH/USDC": "#8b5cf6",
  "Morpho cbETH/USDC": "#3b82f6",
  "Morpho WETH/USDC": "#a78bfa",
  "Morpho cbBTC/USDC": "#f97316",
};

export const assetKeys = Object.keys(assetColors);

// Generate random colors for unknown keys
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
// Function to assign colors dynamically
export const getAssetColor = (key: string): string => {
  const parts = key.split(" "); // Extract protocol name from dynamic key
  const protocolName = parts.slice(0, -2).join(" "); // Get everything except chain & stablecoin

  return getRandomColor(); // Use predefined or generate a new color
};

// Function to generate the assetKeys dynamically
export const generateAssetKeys = (data: any[]): string[] => {
  const keys = new Set<string>();

  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (!["date", "timestamp", "blockNumber", "total"].includes(key)) {
        keys.add(key);
      }
    });
  });

  return Array.from(keys);
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
