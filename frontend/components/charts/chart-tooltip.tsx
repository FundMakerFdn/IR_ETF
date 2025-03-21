import React from "react";
import { formatCurrency, formatDate } from "@/lib/data";

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export default function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Get the first payload item to extract common data
  const firstPayload = payload[0].payload;
  const date = formatDate(firstPayload.date);
  const blockNumber = firstPayload.blockNumber;

  // Calculate total
  const total = payload.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="rounded-md border border-border bg-[#0a0e17] p-4 shadow-md">
      <div className="mb-2 space-y-1">
        <p className="text-sm font-medium text-white">{date}</p>
        <p className="text-xs text-muted-foreground">Block: {blockNumber}</p>
      </div>
      
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white">Total:</span>
          <span className="text-xs font-bold text-white">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}