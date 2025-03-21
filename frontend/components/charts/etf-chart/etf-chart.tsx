"use client";

import React, { useState, useCallback, useMemo } from "react";
import { assetColors, assetKeys, formatCurrency, mockData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import ChartLegend from "@/components/charts/chart-legend";
import ChartTooltip from "@/components/charts/chart-tooltip";
import axios from "axios";
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

export default function ETFChart() {
  const [activeAssets, setActiveAssets] = useState<string[]>(assetKeys);
  const [hoveredData, setHoveredData] = useState<any | null>(null);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleEndIndex, setVisibleEndIndex] = useState(
    Math.min(100, mockData.length - 1)
  );

  // Format date for axis display
  function formatDateForAxis(dateString: string) {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}.${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:00`;
  }

  // Prepare data with formatted dates
  const formattedData = useMemo(() => {
    return mockData.map((item) => ({
      ...item,
      formattedDate: formatDateForAxis(item.date),
    }));
  }, []);

  // Get the data for the currently selected range
  const visibleData = useMemo(() => {
    return formattedData.slice(visibleStartIndex, visibleEndIndex + 1);
  }, [formattedData, visibleStartIndex, visibleEndIndex]);

  // Toggle a specific asset's visibility
  const toggleAsset = useCallback((asset: string) => {
    setActiveAssets((prev) => {
      if (prev.includes(asset)) {
        return prev.filter((a) => a !== asset);
      } else {
        return [...prev, asset];
      }
    });
  }, []);

  // Toggle all assets' visibility
  const toggleAllAssets = useCallback(() => {
    setActiveAssets((prev) => {
      if (prev.length === assetKeys.length) {
        return [];
      } else {
        return [...assetKeys];
      }
    });
  }, []);

  // Handle brush change
  const handleBrushChange = useCallback((brushData: any) => {
    if (!brushData) return;
    console.log("Brush change:", brushData);
    setVisibleStartIndex(brushData.startIndex);
    setVisibleEndIndex(brushData.endIndex);
  }, []);

  // Get active colors for the chart
  const activeColors = useMemo(() => {
    return activeAssets.map((asset) => assetColors[asset]);
  }, [activeAssets]);

  // Create color map for assets
  const colorMap = useMemo(() => {
    return Object.fromEntries(assetKeys.map((key) => [key, assetColors[key]]));
  }, []);

  return (
    <Card className="w-full bg-[#0a0e17] border-border min-h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        {/* <CardTitle className="text-xl font-semibold text-muted-foreground">
          Allocation Over Time
        </CardTitle> */}
        {/* <X className="h-5 w-5 text-muted-foreground cursor-pointer" /> */}
      </CardHeader>

      <CardContent className="p-0">
        {/* Main chart */}
        <div className="px-4">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={visibleData} stackOffset="none">
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#333"
              />
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
                tickFormatter={(value) => formatCurrency(value)}
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
                  stroke={colorMap[asset]}
                  fill={colorMap[asset]}
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
            {/* Mini chart - compressed version of the full chart */}
            <div className="absolute top-0 left-0 w-full h-[20px] z-0">
              <ResponsiveContainer width="100%" height={20}>
                <AreaChart
                  data={formattedData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  {activeAssets.map((asset) => (
                    <Area
                      key={asset}
                      type="stepAfter"
                      dataKey={asset}
                      stackId="1"
                      stroke={colorMap[asset]}
                      fill={colorMap[asset]}
                      fillOpacity={0.6}
                      strokeWidth={0}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Brush component that overlays the mini chart */}
            <div className="absolute top-0 left-0 w-full h-[20px] z-10">
              <ResponsiveContainer width="100%" height={20}>
                <AreaChart
                  data={formattedData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
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
            items={assetKeys}
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
