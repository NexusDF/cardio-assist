import type { CalculatorSnapshot } from '@/features/calculators/logic/drafts'
import { heartRateFromRrMs, qtcFromIntervals } from '@/features/ecg/logic/measure'
import type { EcgIntervalsRecord } from '@/features/patients/db'

export interface TrendPoint {
  readonly at: string
  readonly value: number
}

export interface TrendSource {
  readonly createdAt: string
  readonly snapshot: CalculatorSnapshot
}

export interface EcgTrendSource {
  readonly createdAt: string
  readonly intervals: EcgIntervalsRecord
  readonly sex: '' | 'male' | 'female'
}

export interface ChartDot {
  readonly x: number
  readonly y: number
  readonly at: string
  readonly value: number
}

export interface ChartTick {
  readonly value: number
  readonly y: number
}

export interface ChartLayout {
  readonly dots: ChartDot[]
  readonly ticks: ChartTick[]
  readonly plotLeft: number
  readonly plotRight: number
  readonly plotBottom: number
}

export function collectTrends(
  results: readonly TrendSource[],
  ecgs: readonly EcgTrendSource[],
): { qtc: TrendPoint[]; heartRate: TrendPoint[] } {
  const qtc: TrendPoint[] = []
  const heartRate: TrendPoint[] = []

  for (const result of results) {
    if (result.snapshot.calculator !== 'qtc') continue
    const bazett = result.snapshot.formulas.find((item) => item.id === 'bazett')
    if (bazett !== undefined) qtc.push({ at: result.createdAt, value: bazett.qtcMs })
    if (Number.isFinite(result.snapshot.heartRateBpm)) {
      heartRate.push({ at: result.createdAt, value: result.snapshot.heartRateBpm })
    }
  }

  for (const ecg of ecgs) {
    const rate = ecg.intervals.rrMs === null ? null : heartRateFromRrMs(ecg.intervals.rrMs)
    if (rate !== null) heartRate.push({ at: ecg.createdAt, value: rate })
    const computed = qtcFromIntervals(ecg.intervals.qtMs, ecg.intervals.rrMs, ecg.sex)
    const bazett = computed?.formulas.find((item) => item.id === 'bazett')
    if (bazett !== undefined) qtc.push({ at: ecg.createdAt, value: bazett.qtcMs })
  }

  return { qtc: sortByTime(qtc), heartRate: sortByTime(heartRate) }
}

export function chartLayout(
  points: readonly TrendPoint[],
  width: number,
  height: number,
): ChartLayout {
  const plotLeft = 48
  const plotRight = width - 12
  const plotTop = 36
  const plotBottom = height - 28
  if (points.length === 0 || plotRight <= plotLeft || plotBottom <= plotTop) {
    return { dots: [], ticks: [], plotLeft, plotRight, plotBottom }
  }

  const ticks = axisTicks(
    Math.min(...points.map((point) => point.value)),
    Math.max(...points.map((point) => point.value)),
  )
  const domainMin = ticks[0] ?? 0
  const domainMax = ticks[ticks.length - 1] ?? domainMin + 1
  const domainSpan = domainMax - domainMin || 1
  const times = points.map((point) => Date.parse(point.at))
  const earliest = Math.min(...times)
  const timeSpan = Math.max(...times) - earliest || 1
  const yFor = (value: number) =>
    plotTop + (1 - (value - domainMin) / domainSpan) * (plotBottom - plotTop)

  return {
    plotLeft,
    plotRight,
    plotBottom,
    ticks: ticks.map((value) => ({ value, y: yFor(value) })),
    dots: points.map((point) => ({
      x:
        points.length === 1
          ? (plotLeft + plotRight) / 2
          : plotLeft + ((Date.parse(point.at) - earliest) / timeSpan) * (plotRight - plotLeft),
      y: yFor(point.value),
      at: point.at,
      value: point.value,
    })),
  }
}

export function valueLabelY(dotY: number): number {
  return dotY - 16
}

function axisTicks(min: number, max: number): number[] {
  let low = min
  let high = max
  if (low === high) {
    const pad = Math.max(10, Math.abs(low) * 0.25)
    low = Math.max(0, low - pad)
    high += pad
  }
  const step = niceStep((high - low) / 3)
  const start = Math.floor(low / step) * step
  const end = Math.ceil(high / step) * step
  const ticks: number[] = []
  for (let value = start; value <= end + step * 0.001 && ticks.length < 6; value += step) {
    ticks.push(Math.round(value * 100) / 100)
  }
  return ticks
}

function niceStep(rough: number): number {
  if (!Number.isFinite(rough) || rough <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(rough))
  const fraction = rough / power
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return nice * power
}

function sortByTime(points: readonly TrendPoint[]): TrendPoint[] {
  return [...points].sort((a, b) => a.at.localeCompare(b.at))
}
