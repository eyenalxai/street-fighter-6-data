"use client"

import type { TooltipValueType } from "recharts"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import type { ChartConfig } from "@/components/ui/chart-container"

import { useChart } from "@/components/ui/chart-container"
import { cn } from "@/lib/utils"

type TooltipNameType = number | string

const getPayloadConfigFromPayload = (config: ChartConfig, payload: unknown, key: string) => {
  if (typeof payload !== "object" || payload === null) return undefined
  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined
  let configLabelKey = key
  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }
  return configLabelKey in config ? config[configLabelKey] : config[key]
}

const ChartTooltip = RechartsPrimitive.Tooltip

const safeTooltipName = (value: unknown): string =>
  typeof value === "string" ? value : String(value ?? "")

const formatChartTooltipLabel = (_label: unknown, payload: unknown): string => {
  if (!Array.isArray(payload)) return ""
  const first = payload[0]
  if (typeof first !== "object" || first === null || !("payload" in first)) return ""
  const nested = first.payload
  if (typeof nested !== "object" || nested === null || !("name" in nested)) return ""
  return typeof nested.name === "string" ? nested.name : ""
}

const ChartTooltipContent = ({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>,
    "accessibilityLayer"
  >) => {
  const { config } = useChart()
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null
    const [item] = payload
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string" ? (config[label]?.label ?? label) : itemConfig?.label
    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
      )
    }
    return value ? <div className={cn("font-medium", labelClassName)}>{value}</div> : null
  }, [config, hideLabel, label, labelFormatter, labelClassName, labelKey, payload])

  if (!active || !payload?.length) return null
  const nestLabel = payload.length === 1 && indicator !== "dot"
  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-none border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color ?? item.payload?.fill ?? item.color
            return (
              <div
                key={index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            indicator === "dot" && "h-2.5 w-2.5",
                            indicator === "line" && "w-1",
                            indicator === "dashed" &&
                              "w-0 border-[1.5px] border-dashed bg-transparent",
                            nestLabel && indicator === "dashed" && "my-0.5",
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label ?? item.name}
                        </span>
                      </div>
                      {item.value != null ? (
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {typeof item.value === "number"
                            ? item.value.toLocaleString()
                            : String(item.value)}
                        </span>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export { ChartTooltip, ChartTooltipContent, formatChartTooltipLabel, safeTooltipName }
