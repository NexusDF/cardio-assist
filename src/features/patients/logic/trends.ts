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

export function chartDots(
  points: readonly TrendPoint[],
  width: number,
  height: number,
  pad = 16,
): ChartDot[] {
  if (points.length === 0 || width <= pad * 2 || height <= pad * 2) return []
  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const times = points.map((point) => Date.parse(point.at))
  const earliest = Math.min(...times)
  const latest = Math.max(...times)
  const timeSpan = latest - earliest || 1

  return points.map((point) => {
    const x =
      points.length === 1
        ? width / 2
        : pad + ((Date.parse(point.at) - earliest) / timeSpan) * (width - pad * 2)
    const y = pad + (1 - (point.value - min) / span) * (height - pad * 2)
    return { x, y, at: point.at, value: point.value }
  })
}

function sortByTime(points: readonly TrendPoint[]): TrendPoint[] {
  return [...points].sort((a, b) => a.at.localeCompare(b.at))
}
