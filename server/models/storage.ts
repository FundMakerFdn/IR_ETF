import { Protocol, InsertProtocol, HistoricalRate, InsertHistoricalRate, RateUpdate } from "@shared/schema";

export interface IStorage {
  getProtocols(): Promise<Protocol[]>;
  getProtocol(id: number): Promise<Protocol | undefined>;
  createProtocol(protocol: InsertProtocol): Promise<Protocol>;
  getHistoricalRates(protocolId: number, from: Date, to: Date): Promise<HistoricalRate[]>;
  addHistoricalRate(rate: InsertHistoricalRate): Promise<HistoricalRate>;
  updateProtocolRate(update: RateUpdate): Promise<Protocol>;
}

export class MemStorage implements IStorage {
  private protocols: Map<number, Protocol>;
  private historicalRates: Map<number, HistoricalRate[]>;
  private currentId: number;

  constructor() {
    this.protocols = new Map();
    this.historicalRates = new Map();
    this.currentId = 1;
  }

  async getProtocols(): Promise<Protocol[]> {
    return Array.from(this.protocols.values());
  }

  async getProtocol(id: number): Promise<Protocol | undefined> {
    return this.protocols.get(id);
  }

  async createProtocol(insertProtocol: InsertProtocol): Promise<Protocol> {
    const id = this.currentId++;
    const protocol: Protocol = {
      ...insertProtocol,
      id,
      tvl: insertProtocol.tvl.toString(),
      apy: insertProtocol.apy.toString(),
      lastUpdate: new Date()
    };
    this.protocols.set(id, protocol);
    return protocol;
  }

  async getHistoricalRates(protocolId: number, from: Date, to: Date): Promise<HistoricalRate[]> {
    const rates = this.historicalRates.get(protocolId) || [];
    return rates.filter(rate => 
      rate.timestamp >= from && rate.timestamp <= to
    );
  }

  async addHistoricalRate(rate: InsertHistoricalRate): Promise<HistoricalRate> {
    const id = this.currentId++;

    if (typeof rate.protocolId !== 'number') {
      throw new Error('Protocol ID must be a number');
    }

    const historicalRate: HistoricalRate = {
      id,
      protocolId: rate.protocolId,
      timestamp: rate.timestamp,
      rate: rate.rate.toString(),
      depth: rate.depth
    };

    const existingRates = this.historicalRates.get(rate.protocolId) || [];
    this.historicalRates.set(rate.protocolId, [...existingRates, historicalRate]);

    return historicalRate;
  }

  async updateProtocolRate(update: RateUpdate): Promise<Protocol> {
    const protocol = await this.getProtocol(update.protocolId);
    if (!protocol) {
      throw new Error(`Protocol ${update.protocolId} not found`);
    }

    const updatedProtocol: Protocol = {
      ...protocol,
      apy: update.rate.toString(),
      lastUpdate: update.timestamp
    };

    this.protocols.set(protocol.id, updatedProtocol);

    await this.addHistoricalRate({
      protocolId: protocol.id,
      timestamp: update.timestamp,
      rate: update.rate,
      depth: update.depth
    });

    return updatedProtocol;
  }
}

export const storage = new MemStorage();