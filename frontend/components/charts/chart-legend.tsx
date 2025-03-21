import React from "react";
import { assetColors } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ChartLegendProps {
  items: string[];
  colors: Record<string, string>;
  activeItems: string[];
  onToggleItem: (item: string) => void;
  onToggleAll: () => void;
}

export default function ChartLegend({
  items,
  colors,
  activeItems,
  onToggleItem,
  onToggleAll
}: ChartLegendProps) {
  const allActive = activeItems.length === items.length;

  return (
    <div className="flex flex-wrap items-center gap-4 py-2">
      {/* <Button
        variant="outline"
        size="sm"
        onClick={onToggleAll}
        className="h-7 px-2 text-xs"
      >
        {allActive ? "Hide All" : "Show All"}
      </Button> */}
      
      {items.map((item) => {
        const isActive = activeItems.includes(item);
        const hasExternalLink = item.includes("Morpho");
        
        return (
          <div 
            key={item}
            className="flex items-center gap-1.5"
            onClick={() => onToggleItem(item)}
          >
            <div 
              className={cn(
                "h-3 w-3 rounded-full cursor-pointer",
                isActive ? "opacity-100" : "opacity-40"
              )}
              style={{ backgroundColor: colors[item] }}
            />
            <span 
              className={cn(
                "text-xs cursor-pointer flex items-center gap-1",
                isActive ? "text-white" : "text-muted-foreground"
              )}
            >
              {item}
              {/* {hasExternalLink && (
                <ExternalLink size={10} className="inline-block" />
              )} */}
            </span>
          </div>
        );
      })}
    </div>
  );
}