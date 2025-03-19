"use client"

import { useState, useEffect, useMemo } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceArea } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

// Chart configuration with colors and labels
const chartConfig = {
  compoundUsdc: {
    label: "Compound v3 USDC",
    color: "hsl(142, 76%, 36%)",
  },
  moonwellUsdc: {
    label: "Moonwell USDC",
    color: "hsl(252, 87%, 53%)",
  },
  fluidUsdc: {
    label: "Fluid USDC",
    color: "hsl(262, 83%, 58%)",
  },
  morphoIonicUsdc: {
    label: "Morpho Ionic Ecosystem USDC",
    color: "hsl(201, 96%, 32%)",
  },
  morphoSeamlessUsdc: {
    label: "Morpho Seamless USDC Vault",
    color: "hsl(190, 95%, 39%)",
  },
  morphoWstEthUsdc: {
    label: "Morpho wstETH/USDC",
    color: "hsl(199, 89%, 48%)",
  },
  morphoCbEthUsdc: {
    label: "Morpho cbETH/USDC",
    color: "hsl(280, 87%, 65%)",
  },
  morphoWethUsdc: {
    label: "Morpho WETH/USDC",
    color: "hsl(262, 83%, 68%)",
  },
  morphoCbBtcUsdc: {
    label: "Morpho cbBTC/USDC",
    color: "hsl(31, 95%, 58%)",
  },
}

// Function to generate hourly data for a 3-day period
function generateMockupChartData() {
  const data = []
  const startDate = new Date("2023-02-17T00:00:00")
  const endDate = new Date("2023-02-19T23:00:00")

  // Define some patterns for the data to make it look realistic
  const patterns = {
    compoundUsdc: { base: 50000, variance: 10000, trend: 0.2 },
    moonwellUsdc: { base: 120000, variance: 15000, trend: -0.1 },
    fluidUsdc: { base: 80000, variance: 12000, trend: 0.1 },
    morphoIonicUsdc: { base: 200000, variance: 20000, trend: -0.2 },
    morphoSeamlessUsdc: { base: 0, variance: 5000, trend: 0.5, startHour: 48 }, // Starts after 2 days
    morphoWstEthUsdc: { base: 180000, variance: 18000, trend: 0.15 },
    morphoCbEthUsdc: { base: 150000, variance: 15000, trend: 0.1 },
    morphoWethUsdc: { base: 220000, variance: 22000, trend: -0.15 },
    morphoCbBtcUsdc: { base: 350000, variance: 35000, trend: -0.1 },
  }

  // Phase changes to simulate market shifts
  const phases = [
    { hour: 0, color: "orange" }, // First phase - orange dominant
    { hour: 36, color: "blue" }, // Second phase - blue dominant
    { hour: 60, color: "light-blue" }, // Third phase - light blue dominant
  ]

  // Generate hourly data
  let currentHour = 0
  for (let current = new Date(startDate); current <= endDate; current.setHours(current.getHours() + 1)) {
    const formattedDate = `${current.getDate().toString().padStart(2, "0")}.${(current.getMonth() + 1).toString().padStart(2, "0")}`
    const formattedHour = `${current.getHours().toString().padStart(2, "0")}:00`

    // Determine current phase
    let currentPhase = phases[0].color
    for (let i = phases.length - 1; i >= 0; i--) {
      if (currentHour >= phases[i].hour) {
        currentPhase = phases[i].color
        break
      }
    }

    // Generate data point with some randomness and trends
    const dataPoint: any = {
      date: formattedDate,
      hour: formattedHour,
      timestamp: current.toISOString(),
      fullTimestamp: `${formattedDate} ${formattedHour}`,
      phase: currentPhase,
    }

    // Add values for each token with randomness and trends
    Object.entries(patterns).forEach(([key, pattern]: any) => {
      // Skip if this token hasn't started yet
      if (pattern.startHour && currentHour < pattern.startHour) {
        dataPoint[key] = 0
        return
      }

      // Calculate value with base, trend, and random variance
      const trendFactor = 1 + pattern.trend * (currentHour / 24)
      const randomVariance = (Math.random() - 0.5) * pattern.variance

      // Apply phase effects
      let phaseMultiplier = 1
      if (currentPhase === "orange" && key === "morphoCbBtcUsdc") phaseMultiplier = 1.2
      if (currentPhase === "blue" && key === "morphoIonicUsdc") phaseMultiplier = 1.3
      if (currentPhase === "light-blue" && key === "morphoWstEthUsdc") phaseMultiplier = 1.4

      // Set final value
      dataPoint[key] = Math.max(0, Math.round((pattern.base * trendFactor + randomVariance) * phaseMultiplier))

      // Occasionally create spikes or drops
      if (Math.random() < 0.05) {
        dataPoint[key] = Math.round(dataPoint[key] * (Math.random() < 0.5 ? 1.5 : 0.6))
      }
    })

    // Add special tooltip data for a specific point
    if (formattedDate === "17.02" && formattedHour === "12:00") {
      dataPoint.blockNumber = 28988792
      dataPoint.specialTimestamp = "17.02.2023 12:00"
      dataPoint.morphoWstEthUsdcValue = 72812.6
      dataPoint.morphoCbEthUsdcValue = 72812.59
      dataPoint.morphoCbBtcUsdcValue = 1312428.56
      dataPoint.total = 1458251.74
    }

    data.push(dataPoint)
    currentHour++
  }

  return data
}

export default function AllocationChart() {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const [timeRange, setTimeRange] = useState<[string, string]>(["17.02", "18.02"])
  const [allData, setAllData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<string | null>(null)
  const [dragEnd, setDragEnd] = useState<string | null>(null)

  // Generate data on component mount
  useEffect(() => {
    const data = generateMockupChartData()
    setAllData(data)
  }, [])

  // Filter data based on selected time range
  useEffect(() => {
    if (allData.length === 0) return

    const filtered = allData.filter((item) => {
      const date = item.date
      return date >= timeRange[0] && date <= timeRange[1]
    })

    setFilteredData(filtered)
  }, [allData, timeRange])

  // Predefined time ranges
  const timeRanges = useMemo(
    () => [
      { label: "1D", range: ["17.02", "17.02"] },
      { label: "2D", range: ["17.02", "18.02"] },
      { label: "3D", range: ["17.02", "19.02"] },
    ],
    [],
  )

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = filteredData.find(
        (d) => d.date === label.split(" ")[0] && d.hour === (label.split(" ")[1] || "00:00"),
      )

      if (dataPoint && dataPoint.blockNumber) {
        return (
          <div className="bg-black/90 p-4 rounded-lg border border-gray-800 text-white shadow-lg">
            <p className="text-gray-300">{dataPoint.specialTimestamp}</p>
            <p className="text-gray-400">Block: {dataPoint.blockNumber}</p>
            <div className="space-y-1 mt-2">
              {dataPoint.morphoWstEthUsdcValue && (
                <p className="text-blue-400">Morpho wstETH/USDC: ${dataPoint.morphoWstEthUsdcValue.toLocaleString()}</p>
              )}
              {dataPoint.morphoCbEthUsdcValue && (
                <p className="text-purple-400">Morpho cbETH/USDC: ${dataPoint.morphoCbEthUsdcValue.toLocaleString()}</p>
              )}
              {dataPoint.morphoCbBtcUsdcValue && (
                <p className="text-orange-400">Morpho cbBTC/USDC: ${dataPoint.morphoCbBtcUsdcValue.toLocaleString()}</p>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-700">
              <p className="font-bold">Total: ${dataPoint.total.toLocaleString()}</p>
            </div>
          </div>
        )
      }

      // Default tooltip for other data points
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0)

      return (
        <div className="bg-black/90 p-3 rounded-lg border border-gray-800 text-white shadow-lg">
          <p className="text-gray-300">{label}</p>
          <div className="space-y-1 mt-1">
            {payload.map(
              (entry: any, index: number) =>
                entry.value > 0 && (
                  <p key={`tooltip-${index}`} style={{ color: entry.color }}>
                    {entry.name}: ${entry.value.toLocaleString()}
                  </p>
                ),
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <p className="font-bold">Total: ${total.toLocaleString()}</p>
          </div>
        </div>
      )
    }
    return null
  }

  // Format y-axis values
  const formatYAxis = (value: number) => {
    if (value === 0) return "$0"
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  // Format x-axis ticks to show date and selected hours
  const formatXAxis = (value: string) => {
    if (!value) return ""
    const parts = value.split(" ")
    return parts[0] // Just show the date part
  }

  // Handle range selection via buttons
  const handleRangeSelect = (range: [string, string]) => {
    setTimeRange(range)
  }

  // Handle drag selection on mini chart
  const handleMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      setIsDragging(true)
      setDragStart(e.activeLabel)
      setDragEnd(null)
    }
  }

  const handleMouseMove = (e: any) => {
    if (isDragging && e && e.activeLabel) {
      setDragEnd(e.activeLabel)
    }
  }

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      // Extract dates from full timestamps
      const startDate = dragStart.split(" ")[0]
      const endDate = dragEnd.split(" ")[0]

      // Ensure start is before end
      if (startDate <= endDate) {
        setTimeRange([startDate, endDate])
      } else {
        setTimeRange([endDate, startDate])
      }
    }
    setIsDragging(false)
  }

  // Clean up event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging])

  // Add a console log to debug
  useEffect(() => {
    console.log("Filtered data length:", filteredData.length)
  }, [filteredData])

  return (
    <Card className="w-full bg-[#111827]">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-xl">Allocation Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Explicit height and width for the chart container */}
        <div className="h-[500px] w-full" style={{ minHeight: "500px" }}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData}
                  stackOffset="none"
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  onMouseMove={(e) => {
                    if (e.activeTooltipIndex !== undefined) {
                      setActiveTooltip(e.activeTooltipIndex)
                    }
                  }}
                >
                  <XAxis
                    dataKey="fullTimestamp"
                    stroke="#6b7280"
                    tick={{ fill: "#9ca3af" }}
                    axisLine={{ stroke: "#374151" }}
                    tickFormatter={formatXAxis}
                    interval={Math.floor(filteredData.length / 10)} // Show fewer ticks for readability
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fill: "#9ca3af" }}
                    tickFormatter={formatYAxis}
                    axisLine={{ stroke: "#374151" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="step" // Use step type for square/rectangular style
                    dataKey="compoundUsdc"
                    stackId="1"
                    stroke={chartConfig.compoundUsdc.color}
                    fill={chartConfig.compoundUsdc.color}
                    isAnimationActive={false} // Disable animation for large datasets
                  />
                  <Area
                    type="step"
                    dataKey="moonwellUsdc"
                    stackId="1"
                    stroke={chartConfig.moonwellUsdc.color}
                    fill={chartConfig.moonwellUsdc.color}
                    isAnimationActive={false}
                  />
                  <Area
                    type="step"
                    dataKey="fluidUsdc"
                    stackId="1"
                    stroke={chartConfig.fluidUsdc.color}
                    fill={chartConfig.fluidUsdc.color}
                    isAnimationActive={false}
                  />
                  <Area
                    type="step"
                    dataKey="morphoIonicUsdc"
                    stackId="1"
                    stroke={chartConfig.morphoIonicUsdc.color}
                    fill={chartConfig.morphoIonicUsdc.color}
                    isAnimationActive={false}
                  />
                  <Area
                    type="step"
                    dataKey="morphoSeamlessUsdc"
                    stackId="1"
                    stroke={chartConfig.morphoSeamlessUsdc.color}
                    fill={chartConfig.morphoSeamlessUsdc.color}
                    isAnimationActive={false}
                  />
                  <Area
                    type="step"
                    dataKey="morphoWstEthUsdc"
                    stackId="1"
                    stroke={chartConfig.morphoWstEthUsdc.color}
                    fill={chartConfig.morphoWstEthUsdc.color}
                    isAnimationActive={false}
                  />
                  <Area
                    type="step"
                    dataKey="morphoCbEthUsdc"
                    stackId="1"
                    stroke={chartConfig.morphoCbEthUsdc.color}
                    fill={chartConfig.morphoCbEthUsdc.color}
                    isAnimationActive={false}
                  />
                  <Area
                    type="step"
                    dataKey="morphoWethUsdc"
                    stackId="1"
                    stroke={chartConfig.morphoWethUsdc.color}
                    fill={chartConfig.morphoWethUsdc.color}
                    isAnimationActive={false}
                  />
                  <Area
                    type="step"
                    dataKey="morphoCbBtcUsdc"
                    stackId="1"
                    stroke={chartConfig.morphoCbBtcUsdc.color}
                    fill={chartConfig.morphoCbBtcUsdc.color}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full w-full text-white">Loading chart data...</div>
            )}
          </ChartContainer>
        </div>

        {/* Time Range Selector */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <Button
                key={range.label}
                variant={timeRange[0] === range.range[0] && timeRange[1] === range.range[1] ? "default" : "outline"}
                size="sm"
                onClick={() => handleRangeSelect(range.range as [string, string])}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>

          {/* Mini Chart for Range Selection */}
          <div className="h-10 w-1/2">
            {allData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={allData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <Area
                    type="step"
                    dataKey="morphoCbBtcUsdc"
                    stackId="1"
                    stroke="rgba(255,255,255,0.2)"
                    fill="rgba(255,255,255,0.1)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="step"
                    dataKey="morphoWstEthUsdc"
                    stackId="1"
                    stroke="rgba(255,255,255,0.2)"
                    fill="rgba(255,255,255,0.1)"
                    isAnimationActive={false}
                  />

                  {/* Current selected range */}
                  <ReferenceArea
                    x1={allData.find((d) => d.date === timeRange[0])?.fullTimestamp}
                    x2={allData.find((d) => d.date === timeRange[1] && d.hour === "23:00")?.fullTimestamp}
                    strokeOpacity={0.3}
                    fill="rgba(255,255,255,0.2)"
                  />

                  {/* Dragging selection */}
                  {isDragging && dragStart && dragEnd && (
                    <ReferenceArea x1={dragStart} x2={dragEnd} strokeOpacity={0.3} fill="rgba(100,100,255,0.3)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-gray-800 rounded animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 justify-center">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }}></div>
              <span className="text-sm text-gray-300">{config.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

