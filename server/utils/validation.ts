import { z } from "zod";
import { PROTOCOLS, CHAINS, STABLECOINS } from "../config/constants";

export const protocolValidator = z.enum(Object.values(PROTOCOLS) as [string, ...string[]]);
export const chainValidator = z.enum(Object.values(CHAINS) as [string, ...string[]]);
export const stablecoinValidator = z.enum(Object.values(STABLECOINS) as [string, ...string[]]);

export function validateDateRange(from: string, to: string): { from: Date; to: Date } {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw new Error("Invalid date format");
  }

  if (fromDate > toDate) {
    throw new Error("From date must be before to date");
  }

  return { from: fromDate, to: toDate };
}

export function validateAmount(amount: number): void {
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
}
