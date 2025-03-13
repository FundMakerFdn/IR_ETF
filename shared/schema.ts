import { pgTable, text, serial, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const protocols = pgTable("protocols", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chain: text("chain").notNull(),
  tvl: numeric("tvl").notNull(),
  apy: numeric("apy").notNull(),
  lastUpdate: timestamp("last_update").notNull()
});

export const historicalRates = pgTable("historical_rates", {
  id: serial("id").primaryKey(),
  protocolId: serial("protocol_id").references(() => protocols.id),
  timestamp: timestamp("timestamp").notNull(),
  rate: numeric("rate").notNull(),
  depth: json("depth").notNull()
});

export const insertProtocolSchema = createInsertSchema(protocols).omit({ 
  id: true,
  lastUpdate: true 
});

export const insertHistoricalRateSchema = createInsertSchema(historicalRates).omit({ 
  id: true 
});

export type Protocol = typeof protocols.$inferSelect;
export type InsertProtocol = z.infer<typeof insertProtocolSchema>;
export type HistoricalRate = typeof historicalRates.$inferSelect;
export type InsertHistoricalRate = z.infer<typeof insertHistoricalRateSchema>;

export interface DepthPoint {
  amount: number;
  rate: number;
}

export interface RateUpdate {
  protocolId: number;
  rate: number;
  depth: DepthPoint[];
  timestamp: Date;
}
