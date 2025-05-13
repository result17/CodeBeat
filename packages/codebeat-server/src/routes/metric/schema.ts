import type { HeartbeatMetrics, MetricValueDurationRatio } from '@/lib/metric/collector'
import { z } from '@hono/zod-openapi'

// Define metric types with their expected types
const STRING_METRICS = ['project', 'language', 'entity', 'userAgent', 'projectPath'] as const
const NUMBER_METRICS = ['cursorpos', 'lineno', 'lines'] as const

type StringMetric = typeof STRING_METRICS[number]
type NumberMetric = typeof NUMBER_METRICS[number]

// Type guard functions for type-safe metric checking
function isStringMetric(metric: HeartbeatMetrics): metric is StringMetric {
  return (STRING_METRICS as readonly string[]).includes(metric)
}

function isNumberMetric(metric: HeartbeatMetrics): metric is NumberMetric {
  return (NUMBER_METRICS as readonly string[]).includes(metric)
}

// Helper type for Zod schema inference based on metric type
type MetricSchemaType<T extends HeartbeatMetrics> = T extends StringMetric
  ? z.ZodString
  : T extends NumberMetric
    ? z.ZodNumber
    : z.ZodUnknown

/**
 * Creates a Zod schema for MetricValueDurationRatio based on the metric type
 * @param metric The metric key from HeartbeatRecordResponse
 * @returns A Zod schema that validates the metric value with proper type checking
 */
export function createMetricRatioSchema<T extends HeartbeatMetrics>(metric: T) {
  // Define value schema based on metric type with proper type narrowing
  const valueSchema: MetricSchemaType<T> = (() => {
    if (isStringMetric(metric)) {
      return z.string() as MetricSchemaType<T>
    }
    if (isNumberMetric(metric)) {
      return z.number().int() as MetricSchemaType<T>
    }
    return z.unknown() as MetricSchemaType<T>
  })()

  // Create the full ratio schema with the specific value type
  return z.object({
    value: valueSchema,
    duration: z.number().int().min(0).positive(),
    ratio: z.number().min(0).max(1),
    durationText: z.string().min(1),
  }) as z.ZodType<MetricValueDurationRatio<T>>
}

// Export metric constants for use in route definitions
export const METRIC_TYPES = {
  STRING_METRICS,
  NUMBER_METRICS,
  ALL_METRICS: [...STRING_METRICS, ...NUMBER_METRICS] as const,
}

export const baseMetricSchema = z.object({
  metric: z.enum(METRIC_TYPES.ALL_METRICS),
  ratios: z.array(z.object({
    value: z.union([z.string(), z.number()]),
    duration: z.number().int().min(0).positive(),
    ratio: z.number().min(0).max(1),
    durationText: z.string().min(1),
  })),
})

export type BaseMetric = z.infer<typeof baseMetricSchema>
