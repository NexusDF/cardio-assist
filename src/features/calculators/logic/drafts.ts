import type { QtcBand, QtcFormulaId, Sex } from './qtc'

interface QtcFormulaDraft {
  readonly id: QtcFormulaId
  readonly qtcMs: number
  readonly band: QtcBand
}
import type { HeartBand } from './heart'

export const calculatorDraftStorageKey = 'cardioassist.calculator-drafts'
export const calculatorDraftLimit = 30

export interface QtcDraftSnapshot {
  readonly calculator: 'qtc'
  readonly sex: Sex
  readonly qtMs: number
  readonly heartRateBpm: number
  readonly rrSeconds: number
  readonly formulas: readonly QtcFormulaDraft[]
}

export interface PointsDraftSnapshot {
  readonly calculator: 'cha2ds2-vasc' | 'has-bled'
  readonly score: number
  readonly maxScore: number
}

export interface HeartDraftSnapshot {
  readonly calculator: 'heart'
  readonly score: number
  readonly maxScore: number
  readonly band: HeartBand
}

export type CalculatorSnapshot = QtcDraftSnapshot | PointsDraftSnapshot | HeartDraftSnapshot

export interface CalculatorDraft {
  readonly id: string
  readonly createdAt: string
  readonly snapshot: CalculatorSnapshot
}

export function appendDraft(
  drafts: readonly CalculatorDraft[],
  draft: CalculatorDraft,
  limit = calculatorDraftLimit,
): CalculatorDraft[] {
  return [draft, ...drafts.filter((item) => item.id !== draft.id)].slice(0, limit)
}

export function removeDraft(drafts: readonly CalculatorDraft[], id: string): CalculatorDraft[] {
  return drafts.filter((item) => item.id !== id)
}

export function parseDrafts(raw: string | null): CalculatorDraft[] {
  if (raw === null || raw.trim() === '') return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return parsed.flatMap((item) => {
    const draft = parseDraft(item)
    return draft === null ? [] : [draft]
  })
}

export function serializeDrafts(drafts: readonly CalculatorDraft[]): string {
  return JSON.stringify(drafts)
}

function parseDraft(value: unknown): CalculatorDraft | null {
  if (!isRecord(value)) return null
  if (typeof value.id !== 'string' || value.id === '') return null
  if (typeof value.createdAt !== 'string' || Number.isNaN(Date.parse(value.createdAt))) return null
  const snapshot = parseCalculatorSnapshot(value.snapshot)
  if (snapshot === null) return null
  return { id: value.id, createdAt: value.createdAt, snapshot }
}

export function parseCalculatorSnapshot(value: unknown): CalculatorSnapshot | null {
  if (!isRecord(value) || typeof value.calculator !== 'string') return null
  if (value.calculator === 'qtc') return parseQtcSnapshot(value)
  if (value.calculator === 'cha2ds2-vasc' || value.calculator === 'has-bled') {
    if (typeof value.score !== 'number' || typeof value.maxScore !== 'number') return null
    return { calculator: value.calculator, score: value.score, maxScore: value.maxScore }
  }
  if (value.calculator === 'heart') {
    if (typeof value.score !== 'number' || typeof value.maxScore !== 'number') return null
    if (value.band !== 'low' && value.band !== 'intermediate' && value.band !== 'high') return null
    return { calculator: 'heart', score: value.score, maxScore: value.maxScore, band: value.band }
  }
  return null
}

function parseQtcSnapshot(value: Record<string, unknown>): QtcDraftSnapshot | null {
  if (value.sex !== 'male' && value.sex !== 'female') return null
  if (
    !isFiniteNumber(value.qtMs) ||
    !isFiniteNumber(value.heartRateBpm) ||
    !isFiniteNumber(value.rrSeconds)
  ) {
    return null
  }
  if (!Array.isArray(value.formulas)) return null
  const formulas: QtcFormulaDraft[] = []
  for (const item of value.formulas) {
    const formula = parseQtcFormula(item)
    if (formula === null) return null
    formulas.push(formula)
  }
  return {
    calculator: 'qtc',
    sex: value.sex,
    qtMs: value.qtMs,
    heartRateBpm: value.heartRateBpm,
    rrSeconds: value.rrSeconds,
    formulas,
  }
}

function parseQtcFormula(value: unknown): QtcFormulaDraft | null {
  if (!isRecord(value)) return null
  if (
    value.id !== 'bazett' &&
    value.id !== 'fridericia' &&
    value.id !== 'framingham' &&
    value.id !== 'hodges'
  ) {
    return null
  }
  if (!isFiniteNumber(value.qtcMs)) return null
  if (value.band !== 'normal' && value.band !== 'prolonged' && value.band !== 'high') return null
  return { id: value.id, qtcMs: value.qtcMs, band: value.band }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
