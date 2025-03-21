"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { X } from "lucide-react";
import ChartLegend from "@/components/charts/chart-legend";
import ChartTooltip from "@/components/charts/chart-tooltip";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchAssetData } from "@/lib/api";

// Utility function to generate random colors
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Format date for axis display
const formatDateForAxis = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}.${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:00`;
};

export default function APYChart() {
  const [data, setData] = useState<any[]>([]);
  const [activeAssets, setActiveAssets] = useState<string[]>([]);
  const [assetColors, setAssetColors] = useState<Record<string, string>>({});
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(0);

  useEffect(() => {
    async function getData() {
      const response = await fetchAssetData();
      if (response) {
        setData(response);
        setVisibleEndIndex(Math.min(100, response.length - 1));

        // Extract unique asset keys dynamically
        const keys = new Set<string>();
        response.forEach((item: any) => {
          Object.keys(item).forEach((key) => {
            if (!["date", "timestamp", "blockNumber", "total"].includes(key)) {
              keys.add(key);
            }
          });
        });

        const newAssetKeys = Array.from(keys);
        setActiveAssets(newAssetKeys);

        // Assign colors dynamically
        const newAssetColors: Record<string, string> = {};
        newAssetKeys.forEach((key) => {
          newAssetColors[key] = getRandomColor();
        });
        setAssetColors(newAssetColors);
      }
    }
    getData();
  }, []);

  // Prepare data with formatted dates
  const formattedData = useMemo(() => {
    return data.map((item) => {
      const formattedItem: any = {
        date: item.date,
        formattedDate: formatDateForAxis(item.date),
      };

      activeAssets.forEach((asset) => {
        formattedItem[asset] = item[asset]?.apy ? parseFloat(item[asset].apy) : null;
      });

      return formattedItem;
    });
  }, [data, activeAssets]);

  // Get the data for the currently selected range
  const visibleData = useMemo(() => {
    return formattedData.slice(visibleStartIndex, visibleEndIndex + 1);
  }, [formattedData, visibleStartIndex, visibleEndIndex]);

  // Toggle a specific asset's visibility
  const toggleAsset = useCallback((asset: string) => {
    setActiveAssets((prev) =>
      prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset]
    );
  }, []);

  // Toggle all assets' visibility
  const toggleAllAssets = useCallback(() => {
    setActiveAssets((prev) => (prev.length === Object.keys(assetColors).length ? [] : Object.keys(assetColors)));
  }, [assetColors]);

  // Handle brush change
  const handleBrushChange = useCallback((brushData: any) => {
    if (!brushData) return;
    setVisibleStartIndex(brushData.startIndex);
    setVisibleEndIndex(brushData.endIndex);
  }, []);

  return (
    <Card className="w-full bg-[#0a0e17] border-border min-h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        {/* Title can be added here */}
      </CardHeader>

      <CardContent className="p-0">
        {/* Main chart */}
        <div className="px-4">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={visibleData} stackOffset="none">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={8}
                interval="preserveStartEnd"
                style={{
                  fontSize: "12px",
                  fontFamily: "inherit",
                  fill: "#888",
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // tickFormatter={(value) => formatCurrency(value)}
                style={{
                  fontSize: "12px",
                  fontFamily: "inherit",
                  fill: "#888",
                }}
              />
              <Tooltip content={<ChartTooltip />} />

              {activeAssets.map((asset) => (
                <Area
                  key={asset}
                  type="stepAfter"
                  dataKey={asset}
                  stackId="1"
                  stroke={assetColors[asset]}
                  fill={assetColors[asset]}
                  fillOpacity={0.6}
                  strokeWidth={2}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Range selector (brush) with mini chart */}
        <div className="mt-2 px-4">
          <div className="w-full h-[20px] relative">
            <div className="absolute top-0 left-0 w-full h-[20px] z-0">
              <ResponsiveContainer width="100%" height={20}>
                <AreaChart data={formattedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  {activeAssets.map((asset) => (
                    <Area
                      key={asset}
                      type="stepAfter"
                      dataKey={asset}
                      stackId="1"
                      stroke={assetColors[asset]}
                      fill={assetColors[asset]}
                      fillOpacity={0.6}
                      strokeWidth={0}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="absolute top-0 left-0 w-full h-[20px] z-10">
              <ResponsiveContainer width="100%" height={20}>
                <AreaChart data={formattedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Brush
                    dataKey="formattedDate"
                    height={20}
                    stroke="#888"
                    fill="transparent"
                    fillOpacity={0.1}
                    startIndex={visibleStartIndex}
                    endIndex={visibleEndIndex}
                    onChange={handleBrushChange}
                    travellerWidth={8}
                    gap={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 pb-4 mt-6">
          <ChartLegend
            items={Object.keys(assetColors)}
            colors={assetColors}
            activeItems={activeAssets}
            onToggleItem={toggleAsset}
            onToggleAll={toggleAllAssets}
          />
        </div>
      </CardContent>
    </Card>
  );
}
