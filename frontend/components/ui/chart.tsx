"use client"

import * as React from "react"
import { Tooltip, type TooltipProps } from "recharts"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, children, className, ...props }: ChartContainerProps) {
  // Create CSS variables for chart colors
  const style = React.useMemo(() => {
    return Object.entries(config).reduce(
      (acc, [key, value]) => {
        acc[`--color-${key}`] = value.color
        return acc
      },
      {} as Record<string, string>,
    )
  }, [config])

  return (
    <div className={cn("", className)} style={style} {...props}>
      {children}
    </div>
  )
}

interface ChartTooltipProps extends Omit<TooltipProps<any, any>, "content"> {
  content?: React.ReactNode | any
  defaultIndex?: number
}

export function ChartTooltip({
  content,
  cursor = { fill: "hsl(var(--muted))", opacity: 0.15 },
  defaultIndex,
  ...props
}: ChartTooltipProps) {
  const [activeIndex, setActiveIndex] = React.useState(defaultIndex)

  React.useEffect(() => {
    if (defaultIndex !== undefined) {
      setActiveIndex(defaultIndex)
    }
  }, [defaultIndex])

  return <Tooltip content={content} cursor={cursor} {...props} defaultIndex={activeIndex} />
}

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: number, name: string, props: any) => React.ReactNode
  labelFormatter?: (label: string) => React.ReactNode
  hideLabel?: boolean
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  hideLabel = false,
  className,
  children,
  ...props
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props}>
      {!hideLabel && (
        <div className="mb-1 text-xs font-medium">{labelFormatter ? labelFormatter(label as string) : label}</div>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <div>{formatter ? formatter(item.value, item.name, item) : item.value}</div>
          </div>
        ))}
        {children}
      </div>
    </div>
  )
}

